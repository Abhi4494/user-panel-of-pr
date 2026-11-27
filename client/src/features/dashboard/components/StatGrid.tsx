import { StatCard } from '@/features/dashboard/components/StatCard';
import { useAsync } from '@/hooks/useAsync';
import { getDashboardSummary } from '@/features/dashboard/api/getDashboardSummary';

/**
 * lg+: 3 columns x 2 rows (tall cards span both rows), centred block ~53rem wide with fixed 10.75rem rows, matching the
 * reference (cards ~260px wide, ~35px apart). Below lg: 2 then 1 column.
 */
const gridClass = 'grid gap-4 sm:grid-cols-2 lg:mx-auto lg:max-w-212 lg:auto-rows-[10.75rem] lg:grid-cols-3 lg:gap-x-9 lg:gap-y-3.5';

export function StatGrid() {
  const { data, error, isLoading } = useAsync(getDashboardSummary);

  if (error) {
    return (
      <p role="alert" className="rounded-2xl border border-dash-line bg-dash-surface p-5 text-sm text-alert">
        We couldn&apos;t load your dashboard right now. Please try again later.
      </p>
    );
  }

  if (isLoading || !data) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading dashboard">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`min-h-43 animate-pulse rounded-lg bg-dash-surface motion-reduce:animate-none ${index % 2 === 0 ? 'lg:row-span-2' : ''}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {data.stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  );
}
