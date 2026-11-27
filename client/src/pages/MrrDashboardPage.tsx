import { BriefcaseBusiness, Gem, Ticket } from 'lucide-react';
import { SearchBox } from '@/components/ui/SearchBox';
import { StatStrip } from '@/components/ui/StatStrip';
import { getCategories } from '@/features/catalog/api/getCategories';
import { getMrrOverview } from '@/features/mrr/api/getMrrOverview';
import { CategoryCarousel } from '@/features/mrr/components/CategoryCarousel';
import { NewsPanel } from '@/features/mrr/components/NewsPanel';
import { TrendingReportCard } from '@/features/mrr/components/TrendingReportCard';
import { LatestReportsCard } from '@/features/mrr/components/LatestReportsCard';
import { mrrReportsUrl } from '@/features/mrr/lib/mrrUrls';
import { useAsync } from '@/hooks/useAsync';
import { navigate } from '@/router';

const skeleton = 'animate-pulse rounded-2xl bg-dash-surface motion-reduce:animate-none';

/**
 * Industry Reports dashboard (`/dashboard/mrrdashboard`). Composition only: data from `features/catalog` and `features/mrr/api/*`,
 * presentation from `features/mrr/components/*`. The category carousel sits on the navy header; below it two columns (2:1, like the
 * live site) once the content area is wide enough (container query), else one column.
 */
export function MrrDashboardPage() {
  const overview = useAsync(getMrrOverview);
  const categories = useAsync(getCategories);

  if (overview.error || categories.error) {
    return (
      <p role="alert" className="rounded-xl border border-dash-hairline bg-dash-surface p-5 text-sm text-alert">
        We couldn&apos;t load the industry reports right now. Please try again later.
      </p>
    );
  }

  const { data } = overview;
  return (
    <div className="@container mx-auto max-w-280">
      {/* The live page leaves ~40px under the top bar before the tiles; the layout already adds 16px. */}
      <div className="pt-6">
        {categories.data ? (
          <CategoryCarousel categories={categories.data} />
        ) : (
          <div aria-busy="true" aria-label="Loading industries" className="h-44 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
        )}
      </div>

      <div className="mt-9 grid items-start gap-5.5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5.5">
          {data ? (
            <>
              <TrendingReportCard report={data.trending} />
              <StatStrip
                ariaLabel="Report totals"
                labelTone="ink"
                surface="sky"
                items={[
                  { icon: BriefcaseBusiness, value: data.totals.totalReports, label: 'Total Reports' },
                  { icon: Gem, value: data.totals.purchasedReports, label: 'Purchased Reports' },
                  { icon: Ticket, value: data.totals.bookmarkedReports, label: 'Bookmarked Reports' },
                ]}
              />
              <LatestReportsCard reports={data.latestReports} />
            </>
          ) : (
            <div aria-busy="true" aria-label="Loading reports" className="flex flex-col gap-5.5">
              <div className={`h-52 ${skeleton}`} />
              <div className={`h-36 ${skeleton}`} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5.5">
          <SearchBox id="mrr-search" label="Search industry reports" onSearch={(text) => navigate(mrrReportsUrl({ search: text }))} />
          {data ? <NewsPanel articles={data.news} /> : <div aria-busy="true" className={`h-96 ${skeleton}`} />}
        </div>
      </div>
    </div>
  );
}
