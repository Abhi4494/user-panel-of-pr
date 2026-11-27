import { getMrrReports } from '@/features/mrr/api/getMrrReports';
import { ALL_MRR_REPORTS_PATH } from '@/features/mrr/lib/mrrUrls';
import { ReportsListScreen } from '@/features/report-list/components/ReportsListScreen';
import type { RouteProps } from '@/routes/routeTypes';

/**
 * Industry Reports list (`/dashboard/loadallmrrreport`, optionally `?categoryId=2` or `?search=...`): the shared reports list with Industry Reports data.
 * The heading ("All Industry Reports") and the path are assumptions: production's own screen was not available.
 */
export function MrrReportsPage({ query }: Pick<RouteProps, 'query'>) {
  return <ReportsListScreen title="All Industry Reports" basePath={ALL_MRR_REPORTS_PATH} query={query} fetchReports={getMrrReports} />;
}
