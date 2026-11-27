import { ReportCard } from '@/features/report-list/components/ReportCard';
import type { ReportSummary } from '@/features/report-list/types';

interface ReportsListProps {
  /** `undefined` until the first response arrives (skeleton cards are shown). */
  reports: ReportSummary[] | undefined;
  /** True while a refetch (new filter or page) is running over already-shown results: they dim instead of disappearing. */
  isRefreshing: boolean;
}

const skeleton = 'h-64 animate-pulse rounded bg-dash-surface shadow-dash-card motion-reduce:animate-none';

export function ReportsList({ reports, isRefreshing }: ReportsListProps) {
  if (!reports) {
    return (
      <div aria-busy="true" aria-label="Loading reports" className="grid grid-cols-1 gap-5.5">
        {[0, 1, 2].map((index) => (
          <div key={index} className={skeleton} />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return <p className="rounded bg-dash-surface p-9 text-center text-sm text-dash-subtle shadow-dash-card">No reports match your search.</p>;
  }

  return (
    <ul aria-busy={isRefreshing} className={`grid grid-cols-1 gap-5.5 transition-opacity duration-200 motion-reduce:transition-none ${isRefreshing ? 'opacity-60' : ''}`}>
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </ul>
  );
}
