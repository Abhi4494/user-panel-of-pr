import { useCallback, useState } from 'react';
import { getCategories } from '@/features/catalog/api/getCategories';
import { ReportsList } from '@/features/report-list/components/ReportsList';
import { ReportsPager } from '@/features/report-list/components/ReportsPager';
import { ReportsToolbar } from '@/features/report-list/components/ReportsToolbar';
import { listUrl, parseCategoryId } from '@/features/report-list/lib/listUrl';
import type { ReportListQuery, ReportListResult } from '@/features/report-list/types';
import { useAsync } from '@/hooks/useAsync';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { replace } from '@/router';

const PAGE_SIZES = [10, 25, 50, 100];

interface ReportsListScreenProps {
  /** Heading drawn on the navy header, e.g. "All Production Cost Reports". */
  title: string;
  /** The screen's own path (used when the category select updates the URL). */
  basePath: string;
  /** The URL's query string: `?categoryId=` and `?search=` pre-fill the filters. */
  query: URLSearchParams;
  /** One page of results for the given filters. Must be a stable reference (a module-level function). */
  fetchReports: (query: ReportListQuery) => Promise<ReportListResult>;
}

/**
 * The shared "All ... Reports" screen (Production Cost Reports, Industry Reports): toolbar on the navy header, report cards, pager.
 * The category lives in the URL (so links and the browser's Back/Forward work) and is changed with `replace`; page size, search text
 * and page number are local state. Every change refetches one page (the backend does the filtering and paging).
 */
export function ReportsListScreen({ title, basePath, query, fetchReports }: ReportsListScreenProps) {
  const categoryId = parseCategoryId(query.get('categoryId'));
  const [searchText, setSearchText] = useState(query.get('search') ?? '');
  const search = useDebouncedValue(searchText, 300);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  // The page number belongs to one set of filters: when any filter changes it silently falls back to page 1 (no extra request).
  const filterKey = `${categoryId ?? ''}|${search}|${pageSize}`;
  const [paging, setPaging] = useState({ key: filterKey, page: 1 });
  const page = paging.key === filterKey ? paging.page : 1;

  const categories = useAsync(getCategories);
  const load = useCallback(() => fetchReports({ categoryId, search, page, pageSize }), [fetchReports, categoryId, search, page, pageSize]);
  // 'first': only the first load keeps the full-page loader up; refetching on a filter change must not cover the page again.
  const reports = useAsync(load, { pageLoader: 'first' });

  return (
    <div className="mx-auto max-w-285">
      <ReportsToolbar
        title={title}
        categories={categories.data ?? []}
        categoryId={categoryId}
        onCategoryChange={(id) => replace(listUrl(basePath, { categoryId: id }))}
        pageSize={pageSize}
        pageSizes={PAGE_SIZES}
        onPageSizeChange={setPageSize}
        search={searchText}
        onSearchChange={setSearchText}
      />

      <div className="mt-8">
        {reports.error ? (
          <p role="alert" className="rounded bg-dash-surface p-9 text-center text-sm text-alert shadow-dash-card">
            We couldn&apos;t load the reports right now. Please try again later.
          </p>
        ) : (
          <>
            <ReportsList reports={reports.data?.items} isRefreshing={reports.isLoading && !!reports.data} />
            {reports.data && <ReportsPager page={page} pageSize={pageSize} total={reports.data.total} onPageChange={(next) => setPaging({ key: filterKey, page: next })} />}
          </>
        )}
      </div>
    </div>
  );
}
