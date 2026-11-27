import { getApiData, records, text } from '@/lib/apiData';
import type { ReportListQuery, ReportListResult } from '@/features/report-list/types';
import { parseApiDay } from '@/lib/parseApiDay';
import { reportUrl } from '@/lib/websiteUrl';

/**
 * One page of the Industry Reports list, from `GET /api/v1/user-panel/mrr-reports?categoryId=&search=&page=&limit=`.
 * Filtering and paging happen on the server. The API sends no category per report, so the category pill stays empty.
 */
export async function getMrrReports({ categoryId, search, page, pageSize }: ReportListQuery): Promise<ReportListResult> {
  const params = new URLSearchParams({ categoryId: categoryId === null ? '' : String(categoryId), search: search.trim(), page: String(page), limit: String(pageSize) });
  const data = await getApiData(`/api/v1/user-panel/mrr-reports?${params}`, 'Unable to load the reports right now.');

  const pagination = typeof data.Pagination === 'object' && data.Pagination !== null ? (data.Pagination as Record<string, unknown>) : {};
  return {
    items: records(data.Reports).map((report) => ({
      id: text(report, 'ReportId'),
      title: text(report, 'ShortTitle') || text(report, 'Title'),
      description: text(report, 'ShortDescription'),
      categoryId: categoryId ?? 0,
      categoryName: '',
      publishedAt: parseApiDay(report.CreatedDate),
      href: reportUrl(text(report, 'Url')),
    })),
    total: Number(pagination.TotalRecords) || 0,
  };
}
