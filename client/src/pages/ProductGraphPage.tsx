import { useCallback, useState } from 'react';
import { Link } from '@/components/ui/Link';
import { NotSubscribedError, getProductData } from '@/features/product-graph/api/getProductData';
import { getExtraSeriesData } from '@/features/product-graph/api/getExtraSeriesData';
import { SaveGraphDialog } from '@/features/product-graph/components/SaveGraphDialog';
import { PriceAlertDialog } from '@/features/product-graph/components/PriceAlertDialog';
import { ChartInfoDialog } from '@/features/product-graph/components/ChartInfoDialog';
import { ChartFilterDialog } from '@/features/product-graph/components/ChartFilterDialog';
import { AddSeriesDialog, type AddSeriesEntry } from '@/features/product-graph/components/AddSeriesDialog';
import { GraphUnavailableCard } from '@/features/product-graph/components/GraphUnavailableCard';
import { NotSubscribedCard } from '@/features/product-graph/components/NotSubscribedCard';
import { InsightsTabs } from '@/features/product-graph/components/InsightsTabs';
import { PriceSummaryPanel } from '@/features/product-graph/components/PriceSummaryPanel';
import { ProductGraphCard } from '@/features/product-graph/components/ProductGraphCard';
import { useAsync } from '@/hooks/useAsync';
import { useTitleOverride } from '@/layouts/PageTitleContext';
import type { ExtraSeriesEntry } from '@/features/product-graph/components/PriceChart';
import type { ChartFilters } from '@/features/product-graph/types';
import type { RouteParams } from '@/routes/routeTypes';

const skeleton = 'animate-pulse rounded-xl bg-dash-surface motion-reduce:animate-none';

export function ProductGraphPage({ params }: { params: RouteParams }) {
  const slug = params.slug ?? '';
  const location = params.location;
  const urlKey = `${slug}/${location ?? ''}`;
  const [chosen, setChosen] = useState<{ key: string; filters: ChartFilters }>();
  const filters = chosen?.key === urlKey ? chosen.filters : { location: location ?? '', currency: '', unitId: '' };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [extraSeries, setExtraSeries] = useState<ExtraSeriesEntry[]>([]);

  const load = useCallback(() => getProductData(slug, filters), [slug, filters.location, filters.currency, filters.unitId]); // eslint-disable-line react-hooks/exhaustive-deps
  const product = useAsync(load);
  const notSubscribed = product.error instanceof NotSubscribedError;
  const subscriptionTarget = product.error instanceof NotSubscribedError ? product.error.target : undefined;
  useTitleOverride(notSubscribed ? (subscriptionTarget ? 'Unauthorised Access' : 'Data Not Available') : undefined);

  async function handleAddSeries(entries: AddSeriesEntry[]) {
    setAddOpen(false);
    if (!product.data) return;
    const { unitId, currency } = product.data.graph.filters;
    const fetched = await Promise.all(
      entries.map(async (entry) => {
        const points = await getExtraSeriesData(entry.slug, entry.locationShortName, unitId, currency);
        return {
          label: `${entry.productName} (${entry.locationName})`,
          points,
          productId: entry.productId,
          locationId: entry.locationId,
        } satisfies ExtraSeriesEntry;
      }),
    );
    setExtraSeries((prev) => [...prev, ...fetched.filter((s) => s.points.length > 0)]);
  }

  if (notSubscribed) return <NotSubscribedCard target={subscriptionTarget} />;

  if (product.error) {
    return (
      <div role="alert" className="mx-auto max-w-280 rounded-xl bg-dash-surface p-8 text-center shadow-dash-card">
        <p className="text-sm text-dash-ink">We couldn&apos;t load this product right now.</p>
        <Link href="/dashboard/pricetrend" className="mt-3 inline-block text-sm font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
          Back to Price Trends
        </Link>
      </div>
    );
  }

  return (
    <div className="@container mx-auto flex max-w-280 flex-col gap-5.5">
      <div className="grid items-start gap-5.5 @3xl:grid-cols-[minmax(0,19fr)_minmax(0,6fr)]">
        {product.data ? (
          <>
            {product.data.graph.series.length > 0
              ? <ProductGraphCard graph={product.data.graph} info={product.data.info} extraSeries={extraSeries} onOpenFilters={() => setFiltersOpen(true)} onOpenInfo={() => setInfoOpen(true)} onOpenAlert={() => setAlertOpen(true)} onOpenSave={() => setSaveOpen(true)} onOpenAdd={() => setAddOpen(true)} />
              : <GraphUnavailableCard graph={product.data.graph} onOpenFilters={() => setFiltersOpen(true)} />}
            <PriceSummaryPanel graph={product.data.graph} />
          </>
        ) : (
          <>
            <div aria-busy="true" aria-label="Loading graph" className={`h-160 ${skeleton}`} />
            <div aria-busy="true" className={`h-96 ${skeleton}`} />
          </>
        )}
      </div>

      {product.data ? <InsightsTabs tabs={product.data.insights.tabs} /> : <div aria-busy="true" className={`h-64 ${skeleton}`} />}
      {saveOpen && product.data && <SaveGraphDialog graph={product.data.graph} info={product.data.info} extraSeries={extraSeries} onClose={() => setSaveOpen(false)} />}
      {addOpen && product.data && (
        <AddSeriesDialog
          unitId={product.data.graph.filters.unitId}
          currency={product.data.graph.filters.currency}
          onClose={() => setAddOpen(false)}
          onAdd={handleAddSeries}
        />
      )}
      {alertOpen && product.data && <PriceAlertDialog info={product.data.info} onClose={() => setAlertOpen(false)} />}
      {infoOpen && product.data && <ChartInfoDialog info={product.data.info} onClose={() => setInfoOpen(false)} />}
      {filtersOpen && product.data && (
        <ChartFilterDialog
          graph={product.data.graph}
          onApply={(next) => {
            setChosen({ key: urlKey, filters: next });
            setFiltersOpen(false);
            setExtraSeries([]); // clear extra series when filters change (unit/location/currency changed)
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </div>
  );
}
