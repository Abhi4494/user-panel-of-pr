import { getCategories } from '@/features/catalog/api/getCategories';
import { getPriceTrendsDashboard } from '@/features/price-trends/api/getPriceTrendsDashboard';
import { CategoryFilter } from '@/features/price-trends/components/CategoryFilter';
import { PriceTrendsStats } from '@/features/price-trends/components/PriceTrendsStats';
import { SubscribedProductList } from '@/features/price-trends/components/SubscribedProductList';
import { SubscriptionSummary } from '@/features/price-trends/components/SubscriptionSummary';
import { useProductSearch } from '@/features/product-search/ProductSearchContext';
import { useAsync } from '@/hooks/useAsync';

const skeleton = 'animate-pulse rounded-xl bg-dash-surface motion-reduce:animate-none';

/**
 * Price Trends dashboard (`/dashboard/pricetrend`). Composition only (a category chip opens the product search); data comes from
 * `features/price-trends/api/*`, presentation from `features/price-trends/components/*`.
 *
 * Layout: two columns (2:1 fluid, like the live site) only when the content area itself is wide enough (container
 * query), because that width depends on whether the sidebar menu is open. Narrower: one column, the list below.
 */
export function PriceTrendsPage() {
  const dashboard = useAsync(getPriceTrendsDashboard);
  const categories = useAsync(getCategories);
  const { openWithIndustry } = useProductSearch();

  if (dashboard.error || categories.error) {
    return (
      <p role="alert" className="rounded-xl border border-dash-hairline bg-dash-surface p-5 text-sm text-alert">
        We couldn&apos;t load your price trends right now. Please try again later.
      </p>
    );
  }

  return (
    <div className="@container mx-auto max-w-280">
      <div className="grid items-start gap-5.5 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          {dashboard.data && categories.data ? (
            <>
              <PriceTrendsStats totals={dashboard.data.totals} industries={categories.data.length} />
              <SubscriptionSummary subscription={dashboard.data.subscription} />
              <div className="mt-9">
                <CategoryFilter categories={categories.data.map(({ id, name }) => ({ id: String(id), name }))} onPick={openWithIndustry} />
              </div>
            </>
          ) : (
            <div aria-busy="true" aria-label="Loading price trends" className="flex flex-col gap-5">
              <div className={`h-32 ${skeleton}`} />
              <div className={`h-72 ${skeleton}`} />
            </div>
          )}
        </div>

        {dashboard.data ? <SubscribedProductList products={dashboard.data.products} /> : <div aria-busy="true" className={`h-96 ${skeleton}`} />}
      </div>
    </div>
  );
}
