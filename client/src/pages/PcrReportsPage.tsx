import { getPcrReports } from '@/features/pcr/api/getPcrReports';
import { ALL_REPORTS_PATH } from '@/features/pcr/lib/reportsUrl';
import { ReportsListScreen } from '@/features/report-list/components/ReportsListScreen';
import type { RouteProps } from '@/routes/routeTypes';

/** All Production Cost Reports (`/dashboard/loadallpcrreport`, optionally `?categoryId=1` or `?search=...`): the shared reports list with PCR data. */
export function PcrReportsPage({ query }: Pick<RouteProps, 'query'>) {
  return <ReportsListScreen title="All Production Cost Reports" basePath={ALL_REPORTS_PATH} query={query} fetchReports={getPcrReports} />;
}
