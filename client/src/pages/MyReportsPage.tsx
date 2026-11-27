import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/components/ui/Link';
import { getCategories } from '@/features/catalog/api/getCategories';
import { formatDate } from '@/features/product-graph/lib/format';
import { getSubCategories } from '@/features/product-search/api/searchApi';
import { ReportsPager } from '@/features/report-list/components/ReportsPager';
import { getMyReports, isMyReportsKind, type MyReport, type MyReportsGroup, type MyReportsKind } from '@/features/my-reports/api/myReports';
import { useAsync } from '@/hooks/useAsync';
import { useTitleOverride } from '@/layouts/PageTitleContext';
import { pcrUrl, reportUrl } from '@/lib/websiteUrl';
import type { RouteParams } from '@/routes/routeTypes';

const PAGE_SIZE = 10;

const KIND_LABEL: Record<MyReportsKind, string> = {
  'industry-reports': 'Industry Reports',
  'production-cost-reports': 'Production Cost Reports',
  'strategy-reports': 'Strategy Reports',
};

/** Where "Buy More" / "Explore Reports" goes: the report lists inside the dashboard. */
const BUY_MORE: Record<MyReportsKind, string> = {
  'industry-reports': '/dashboard/loadallmrrreport',
  'production-cost-reports': '/dashboard/loadallpcrreport',
  'strategy-reports': '/dashboard/loadallmrrreport',
};

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';
const card = 'rounded-xl bg-dash-surface shadow-dash-card';
const select = `h-10 w-full rounded-md border border-dash-control-border bg-dash-surface px-3 text-sm text-dash-ink ${focus}`;

const day = (iso: string) => {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? '' : formatDate(time);
};
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function ReportCard({ report, group, kind }: { report: MyReport; group: MyReportsGroup; kind: MyReportsKind }) {
  const href = report.url ? (kind === 'production-cost-reports' ? pcrUrl(report.url) : reportUrl(report.url)) : '';
  return (
    <article className={`${card} flex flex-col gap-3 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {report.categoryName ? (
          <span className="rounded bg-dash-hover px-2.5 py-0.5 text-xs font-semibold text-dash-outline">{report.categoryName}</span>
        ) : (
          <span />
        )}
        {group === 'purchases' && report.date && (
          <span className="flex items-center gap-1 text-xs text-dash-subtle">
            <CalendarDays size={13} aria-hidden />
            {day(report.date)}
          </span>
        )}
      </div>

      <div className="flex gap-4">
        {report.imageUrl && <img src={report.imageUrl} alt="" loading="lazy" className="hidden size-24 shrink-0 rounded object-cover sm:block" />}
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold text-dash-ink">{report.title}</h3>
          {report.shortDescription && <p className="mt-2 line-clamp-4 text-sm text-dash-subtle">{report.shortDescription}</p>}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-dash-hairline pt-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dash-subtle">
          {report.quarter && (
            <li className="flex items-center gap-1">
              <Clock size={13} aria-hidden />
              {report.quarter}
            </li>
          )}
          {report.locationName && (
            <li className="flex items-center gap-1">
              <MapPin size={13} aria-hidden />
              {report.locationName}
            </li>
          )}
          {group === 'purchases' && report.planName && <li>{report.planName} license</li>}
          {group === 'purchases' && report.amount !== null && <li>{money.format(report.amount)}</li>}
          {group === 'purchases' && report.orderNumber && <li>Order {report.orderNumber}</li>}
          {group === 'subscriptions' && report.startDate && report.endDate && (
            <li>
              {day(report.startDate)} - {day(report.endDate)}
            </li>
          )}
        </ul>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex h-9 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong ${focus}`}
          >
            View
          </a>
        ) : (
          <span className="text-xs text-dash-subtle">Report page not available</span>
        )}
      </div>
    </article>
  );
}

/**
 * My Purchases / My Subscriptions lists (`/dashboard/purchases/<kind>`, `/dashboard/subscriptions/<kind>`; the old .NET
 * addresses such as `/dashboard/myreport` land here too). Purchases are the user's paid orders; subscriptions are the
 * ones active today. Filters: report title, industry and sub industry. "View" opens the report's page on the website.
 */
export function MyReportsPage({ params }: { params: RouteParams }) {
  const group: MyReportsGroup = params.group === 'subscriptions' ? 'subscriptions' : 'purchases';
  const kind: MyReportsKind = isMyReportsKind(params.kind ?? '') ? (params.kind as MyReportsKind) : 'industry-reports';
  const heading = `${group === 'purchases' ? 'Purchased' : 'Subscribed'} ${KIND_LABEL[kind]}`;
  useTitleOverride(heading);

  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');

  // Start again from the first page and clear the filters when the user opens another list.
  useEffect(() => {
    setPage(1);
    setSearchText('');
    setSearch('');
    setCategoryId('');
    setSubCategoryId('');
  }, [group, kind]);

  // Ask the API a moment after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const categories = useAsync(getCategories, { pageLoader: false });
  const loadSubCategories = useCallback(() => (categoryId ? getSubCategories(categoryId) : Promise.resolve([])), [categoryId]);
  const subCategories = useAsync(loadSubCategories, { pageLoader: false });

  const effectiveCategory = Number(subCategoryId || categoryId) || undefined;
  const load = useCallback(
    () => getMyReports(group, kind, { page, limit: PAGE_SIZE, search, categoryId: effectiveCategory }),
    [group, kind, page, search, effectiveCategory],
  );
  const list = useAsync(load, { pageLoader: 'first' });

  return (
    <div className="@container mx-auto flex max-w-285 flex-col gap-5">
      <section className={`${card} flex flex-wrap items-center justify-between gap-3 p-5`}>
        <div>
          <h2 className="text-lg font-semibold text-dash-outline">{heading}</h2>
          <p className="mt-1 text-sm text-dash-subtle" aria-live="polite">
            {list.data ? `You have ${list.data.total} ${group === 'purchases' ? 'purchased' : 'subscribed'} report${list.data.total === 1 ? '' : 's'}` : ' '}
          </p>
        </div>
        <Link href={BUY_MORE[kind]} className={`inline-flex h-10 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong ${focus}`}>
          {group === 'purchases' ? 'Buy More' : 'Explore Reports'}
        </Link>
      </section>

      <section aria-label="Filters" className={`${card} grid gap-4 p-5 @2xl:grid-cols-3`}>
        <label className="text-sm font-medium text-dash-ink">
          Search
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Report title"
            className={`mt-1 h-10 w-full rounded-md border border-dash-control-border bg-dash-surface px-3 text-sm font-normal text-dash-ink ${focus}`}
          />
        </label>
        <label className="text-sm font-medium text-dash-ink">
          Category
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSubCategoryId('');
              setPage(1);
            }}
            className={`mt-1 ${select}`}
          >
            <option value="">All categories</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-dash-ink">
          Sub Category
          <select
            value={subCategoryId}
            disabled={!categoryId}
            onChange={(event) => {
              setSubCategoryId(event.target.value);
              setPage(1);
            }}
            className={`mt-1 ${select} disabled:opacity-60`}
          >
            <option value="">All sub categories</option>
            {(subCategories.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {list.error ? (
        <p role="alert" className={`${card} p-8 text-center text-sm text-alert`}>
          We couldn&apos;t load your reports right now.
        </p>
      ) : !list.data ? (
        <div aria-busy="true" aria-label="Loading reports" className="grid gap-5 @3xl:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-52 animate-pulse rounded-xl bg-dash-surface shadow-dash-card motion-reduce:animate-none" />
          ))}
        </div>
      ) : list.data.items.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <p className="text-sm text-dash-ink">
            {search || effectiveCategory ? "We couldn't find any matching reports. Please try different filters." : `You have no ${group === 'purchases' ? 'purchased' : 'subscribed'} ${KIND_LABEL[kind].toLowerCase()} yet.`}
          </p>
          <Link href={BUY_MORE[kind]} className="mt-3 inline-block text-sm font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
            Explore {KIND_LABEL[kind]}
          </Link>
        </div>
      ) : (
        <>
          <ul aria-busy={list.isLoading} className="grid gap-5 @3xl:grid-cols-2">
            {list.data.items.map((report) => (
              <li key={report.id} className="flex *:flex-1">
                <ReportCard report={report} group={group} kind={kind} />
              </li>
            ))}
          </ul>
          <ReportsPager page={page} pageSize={PAGE_SIZE} total={list.data.total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
