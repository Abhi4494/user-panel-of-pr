import { getApiData, records, text } from '@/lib/apiData';
import type { ReportListQuery, ReportListResult } from '@/features/report-list/types';
import { parseApiDay } from '@/lib/parseApiDay';
import { pcrUrl } from '@/lib/websiteUrl';

/**
 * One page of the all-reports list, from `GET /api/v1/user-panel/pcr-reports?categoryId=&search=&page=&limit=`.
 * Filtering and paging happen on the server. The report's country is shown as the small grey line under the description.
 */
export async function getPcrReports({ categoryId, search, page, pageSize }: ReportListQuery): Promise<ReportListResult> {
  const params = new URLSearchParams({ categoryId: categoryId === null ? '' : String(categoryId), search: search.trim(), page: String(page), limit: String(pageSize) });
  const data = await getApiData(`/api/v1/user-panel/pcr-reports?${params}`, 'Unable to load the reports right now.');

  const pagination = typeof data.Pagination === 'object' && data.Pagination !== null ? (data.Pagination as Record<string, unknown>) : {};
  return {
    items: records(data.Reports).map((report) => {
      const country = text(report, 'CountryName');
      return {
        id: text(report, 'PCReportID'),
        title: text(report, 'ShortName') || text(report, 'Name'),
        description: text(report, 'ShortDescription'),
        categoryId: Number(report.CategoryID) || 0,
        categoryName: text(report, 'CategoryName'),
        publishedAt: parseApiDay(report.CreatedDate),
        href: pcrUrl(text(report, 'Url')),
        facts: country ? [country] : undefined,
      };
    }),
    total: Number(pagination.TotalRecords) || 0,
  };
}
