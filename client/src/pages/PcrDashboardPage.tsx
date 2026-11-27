import { BriefcaseBusiness, Gem, Ticket } from 'lucide-react';
import { SearchBox } from '@/components/ui/SearchBox';
import { StatStrip } from '@/components/ui/StatStrip';
import { getCategories } from '@/features/catalog/api/getCategories';
import { getPcrOverview } from '@/features/pcr/api/getPcrOverview';
import { IndustriesBanner } from '@/features/pcr/components/IndustriesBanner';
import { PurchasedReportsCard } from '@/features/pcr/components/PurchasedReportsCard';
import { RecentModels } from '@/features/pcr/components/RecentModels';
import { reportsUrl } from '@/features/pcr/lib/reportsUrl';
import { useAsync } from '@/hooks/useAsync';
import { navigate } from '@/router';

const skeleton = 'animate-pulse rounded-xl bg-dash-surface motion-reduce:animate-none';

/**
 * Production Cost Report dashboard (`/dashboard/pcrdashboard`). Composition only: data from `features/pcr/api/*`,
 * presentation from `features/pcr/components/*`. Two columns (2:1, like the live site) once the content area is wide enough
 * (container query: the sidebar menu changes that width); narrower, one column with the search and recent models below.
 */
export function PcrDashboardPage() {
  const overview = useAsync(getPcrOverview);
  const categories = useAsync(getCategories);

  if (overview.error || categories.error) {
    return (
      <p role="alert" className="rounded-xl border border-dash-hairline bg-dash-surface p-5 text-sm text-alert">
        We couldn&apos;t load the production cost reports right now. Please try again later.
      </p>
    );
  }

  const { data } = overview;
  return (
    <div className="@container mx-auto max-w-280">
      <div className="grid items-start gap-5.5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5.5">
          {data && categories.data ? (
            <>
              <StatStrip
                ariaLabel="Report totals"
                labelTone="ink"
                items={[
                  { icon: BriefcaseBusiness, value: data.totals.totalReports, label: 'Total Reports' },
                  { icon: Gem, value: data.totals.purchasedReports, label: 'Purchased Reports' },
                  { icon: Ticket, value: data.totals.bookmarkedReports, label: 'Bookmarked Reports' },
                ]}
              />
              <IndustriesBanner categories={categories.data} />
              <div className="mt-3">
                <PurchasedReportsCard reports={data.purchasedReports} />
              </div>
            </>
          ) : (
            <div aria-busy="true" aria-label="Loading dashboard" className="flex flex-col gap-5.5">
              <div className={`h-32 ${skeleton}`} />
              <div className={`h-80 ${skeleton}`} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5.5">
          <SearchBox id="pcr-search" label="Search production cost reports" onSearch={(text) => navigate(reportsUrl({ search: text }))} />
          {data ? <RecentModels models={data.recentModels} /> : <div aria-busy="true" className={`h-96 ${skeleton}`} />}
        </div>
      </div>
    </div>
  );
}
