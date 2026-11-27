import { BriefcaseBusiness, Gem, Ticket } from 'lucide-react';
import { SearchBox } from '@/components/ui/SearchBox';
import { StatStrip } from '@/components/ui/StatStrip';
import { getCategories } from '@/features/catalog/api/getCategories';
import { getLibraryOverview } from '@/features/library/api/getLibraryOverview';
import { LatestReportsCard } from '@/features/mrr/components/LatestReportsCard';
import { CategoryCarousel } from '@/features/mrr/components/CategoryCarousel';
import { NewsPanel } from '@/features/mrr/components/NewsPanel';
import { TrendingReportCard } from '@/features/mrr/components/TrendingReportCard';
import { useAsync } from '@/hooks/useAsync';
import { navigate } from '@/router';

const skeleton = 'animate-pulse rounded-2xl bg-dash-surface motion-reduce:animate-none';

/**
 * Library (`/dashboard/livereportdashboard`, "Live Report Dashboard" on production). Same frame as the Industry Reports screen:
 * category tiles on the navy header, trending report + totals on the left, search + news on the right.
 * TODO(backend): the search goes to `/dashboard/livereport` (name confirmed to exist, contents unknown).
 */
export function LibraryPage() {
  const overview = useAsync(getLibraryOverview);
  const categories = useAsync(getCategories);

  if (overview.error || categories.error) {
    return (
      <p role="alert" className="rounded-xl border border-dash-hairline bg-dash-surface p-5 text-sm text-alert">
        We couldn&apos;t load your library right now. Please try again later.
      </p>
    );
  }

  const { data } = overview;
  return (
    <div className="@container mx-auto max-w-280">
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
                ariaLabel="Library totals"
                labelTone="ink"
                surface="sky"
                items={[
                  { icon: BriefcaseBusiness, value: data.totals.totalReports, label: 'Total Reports' },
                  { icon: Gem, value: data.totals.purchasedReports, label: 'Purchased Reports' },
                  { icon: Ticket, value: data.totals.bookmarkedReports, label: 'Bookmarked Reports' },
                ]}
              />
              <LatestReportsCard reports={data.latestReports} viewAllHref="/dashboard/livereport" />
            </>
          ) : (
            <div aria-busy="true" aria-label="Loading library" className="flex flex-col gap-5.5">
              <div className={`h-52 ${skeleton}`} />
              <div className={`h-36 ${skeleton}`} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5.5">
          <SearchBox id="library-search" label="Search your library" onSearch={(text) => navigate(`/dashboard/livereport?search=${encodeURIComponent(text)}`)} />
          {data ? <NewsPanel articles={data.news} /> : <div aria-busy="true" className={`h-96 ${skeleton}`} />}
        </div>
      </div>
    </div>
  );
}
