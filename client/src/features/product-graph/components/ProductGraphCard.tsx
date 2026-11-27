import { Suspense, lazy, useMemo, useState } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ChartActions } from '@/features/product-graph/components/ChartActions';
import { ChartHeader } from '@/features/product-graph/components/ChartHeader';
import { RangeButtons } from '@/features/product-graph/components/RangeButtons';
import { extentOf, toChartRows } from '@/features/product-graph/lib/chartRows';
import { downloadCsv } from '@/features/product-graph/lib/exportCsv';
import { exportGraph } from '@/features/product-graph/api/exportGraph';
import { zoomWindow, windowForRange, type RangeId, type TimeWindow } from '@/features/product-graph/lib/priceWindow';
import type { ExtraSeriesEntry } from '@/features/product-graph/components/PriceChart';
import type { ProductGraph, ProductInfo } from '@/features/product-graph/types';

const PriceChartPanel = lazy(() => import('@/features/product-graph/components/PriceChartPanel'));

export function ProductGraphCard({
  graph,
  info,
  extraSeries = [],
  onOpenFilters,
  onOpenInfo,
  onOpenAlert,
  onOpenSave,
  onOpenAdd,
}: {
  graph: ProductGraph;
  info: ProductInfo;
  extraSeries?: ExtraSeriesEntry[];
  onOpenFilters: () => void;
  onOpenInfo: () => void;
  onOpenAlert: () => void;
  onOpenSave: () => void;
  onOpenAdd: () => void;
}) {
  const rows = useMemo(() => toChartRows(graph.series), [graph.series]);
  const extent = useMemo(() => extentOf(rows), [rows]);
  const [window, setWindow] = useState<TimeWindow>(() => windowForRange('home', extent));
  const [active, setActive] = useState<RangeId | null>('home');
  const [downloading, setDownloading] = useState(false);

  const selectRange = (range: RangeId) => {
    setActive(range);
    setWindow(windowForRange(range, extent));
  };
  const customWindow = (next: TimeWindow | ((current: TimeWindow) => TimeWindow)) => {
    setActive(null);
    setWindow(next);
  };

  async function download() {
    if (downloading) return;
    setDownloading(true);
    try {
      const series = await exportGraph(graph.filters.currency, [
        { productId: info.productId, locationId: info.locationId },
      ]);
      if (series.length === 0) return;
      const s = series[0];
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      downloadCsv(`${graph.slug}-price-trend.csv`, [
        ['Date', s.label],
        ...s.rows.map((r) => [`${MONTHS[r.month - 1]}-${r.year}`, r.price]),
      ]);
    } catch {
      const visible = graph.series.filter((point) => Date.parse(point.date) >= window.from && Date.parse(point.date) <= window.to);
      downloadCsv(`${graph.slug}-price-trend.csv`, [
        ['Date', `Price (${graph.latest.unit})`, 'Type'],
        ...visible.map((point) => [point.date, point.value, point.forecast ? 'Forecast' : 'Actual']),
      ]);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section aria-label={`${graph.name} price graph`} className="min-w-0 rounded-xl bg-dash-chart-card p-6 shadow-dash-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RangeButtons active={active} onSelect={selectRange} />
        <ChartActions onDownload={download} onFilter={onOpenFilters} onInfo={onOpenInfo} onAlert={onOpenAlert} onSave={onOpenSave} onAdd={onOpenAdd} />
      </div>

      <div className="mt-6">
        <ChartHeader
          title={graph.name}
          subtitle={graph.subtitle}
          onZoomIn={() => customWindow((current) => zoomWindow(current, extent, 0.5))}
          onZoomOut={() => customWindow((current) => zoomWindow(current, extent, 2))}
        />
      </div>

      <div className="mt-5">
        <ErrorBoundary
          fallback={
            <div role="alert" className="flex h-104 flex-col items-center justify-center gap-3 rounded-lg bg-dash-hover text-center text-sm text-dash-ink">
              <p>The chart could not be loaded.</p>
              <button type="button" onClick={() => globalThis.location.reload()} className="font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
                Reload page
              </button>
            </div>
          }
        >
          <Suspense fallback={<div aria-busy="true" className="h-104 animate-pulse rounded-lg bg-dash-hover motion-reduce:animate-none" />}>
            <PriceChartPanel rows={rows} extent={extent} window={window} unit={graph.latest.unit} seriesLabel={graph.seriesLabel} extraSeries={extraSeries} onWindowChange={customWindow} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </section>
  );
}
