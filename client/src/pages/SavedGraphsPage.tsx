import { AlignJustify, Eye, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link } from '@/components/ui/Link';
import { deleteSavedGraph } from '@/features/product-graph/api/deleteSavedGraph';
import { getExtraSeriesData } from '@/features/product-graph/api/getExtraSeriesData';
import { getSavedGraphs, type SavedGraph, type SavedGraphSeries } from '@/features/product-graph/api/getSavedGraphs';
import { extraColor, PriceChart, type ExtraSeriesEntry } from '@/features/product-graph/components/PriceChart';
import { extentOf, toChartRows } from '@/features/product-graph/lib/chartRows';
import { windowForRange } from '@/features/product-graph/lib/priceWindow';
import { useAsync } from '@/hooks/useAsync';

const focus = 'focus-visible:outline-2 focus-visible:outline-dash-accent';

/** Unit name for display; the "blank" placeholder unit is hidden (same as the .NET dashboard). */
const cleanUnit = (name: string | null | undefined) => (name && name.trim().toLowerCase() !== 'blank' ? name : '');

/** "USD/MT", "MT" or "" depending on what is available. */
const currencyUnit = (currency: string | null | undefined, unit: string) =>
  [currency?.toUpperCase(), unit].filter(Boolean).join('/');

/** Fetches all series in parallel and renders a compact multi-series chart preview. */
function SavedGraphMiniChart({
  graphId,
  series,
  unitId,
  currency,
  unit,
}: {
  graphId: number;
  series: SavedGraphSeries[];
  unitId: string;
  currency: string;
  unit: string;
}) {
  const seriesKey = series.map((s) => `${s.slug}/${s.locationShortName}`).join(',');

  const load = useCallback(async () => {
    const valid = series.filter((s) => s.slug && s.locationShortName);
    const results = await Promise.allSettled(valid.map((s) => getExtraSeriesData(s.slug!, s.locationShortName!, unitId, currency, true, graphId)));
    // The first series draws the main line: if it fails, show why. Failed extra series are simply left out.
    if (results[0].status === 'rejected') throw results[0].reason;
    const all = results.map((r) => (r.status === 'fulfilled' ? r.value : []));
    // Same rule as the .NET dashboard: forecast points only show when the graph has a single series.
    return valid.length > 1 ? all.map((pts) => pts.filter((p) => !p.forecast)) : all;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphId, seriesKey, unitId, currency]);

  const dataAsync = useAsync(load, { pageLoader: false });

  const primaryPoints = dataAsync.data?.[0] ?? [];
  const rows = useMemo(() => toChartRows(primaryPoints), [primaryPoints]);
  const extent = useMemo(() => (rows.length ? extentOf(rows) : null), [rows]);
  const window = useMemo(() => (extent ? windowForRange('1Y', extent) : null), [extent]);

  const validSeries = series.filter((s) => s.slug && s.locationShortName);
  const extraSeries = useMemo((): ExtraSeriesEntry[] => {
    if (!dataAsync.data) return [];
    return validSeries.slice(1).map((s, i) => ({
      label: s.productName ?? s.slug ?? '',
      points: dataAsync.data![i + 1] ?? [],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataAsync.data]);

  if (dataAsync.error) {
    return (
      <div className="flex h-52 items-center justify-center px-4 text-center text-xs text-dash-subtle">
        {dataAsync.error.message}
      </div>
    );
  }
  if (!dataAsync.data) {
    return <div className="h-52 animate-pulse rounded bg-dash-hover motion-reduce:animate-none" />;
  }
  if (!rows.length || !window) {
    return (
      <div className="flex h-52 items-center justify-center text-xs text-dash-subtle">
        No chart data
      </div>
    );
  }

  return (
    <div className="h-52 overflow-hidden">
      <PriceChart rows={rows} window={window} unit={unit} extraSeries={extraSeries} />
    </div>
  );
}

function GraphCard({
  graph,
  onDeleted,
}: {
  graph: SavedGraph;
  onDeleted: (id: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const href = `/dashboard/savedgraph/${graph.graphDashboardId}`;

  // Subtitle inside the chart panel: Unit | Location (product name is already the bold heading)
  const unitName = cleanUnit(graph.unitName);
  const unitLabel = currencyUnit(graph.currency, unitName);
  const subtitle = [unitLabel, graph.locationName].filter(Boolean).join(' | ');
  const validSeries = (graph.series ?? []).filter((s) => s.slug && s.locationShortName);
  const canPreview = validSeries.length > 0 && !!(graph.unitId && graph.currency);

  async function handleDelete() {
    setBusy(true);
    setError('');
    try {
      await deleteSavedGraph(graph.graphDashboardId);
      onDeleted(graph.graphDashboardId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this graph.');
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-dash-surface shadow-dash-card">

      {/* ── Outer card header: graph title + action buttons ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-dash-outline">{graph.title}</h2>
          {graph.description && (
            <p className="mt-0.5 truncate text-xs text-dash-subtle">{graph.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Link
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-md bg-[#1a3a5c] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 ${focus}`}
            >
              <Eye size={12} aria-hidden />
              View
            </Link>
          )}

          {confirming ? (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="text-dash-subtle">Delete?</span>
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className={`rounded bg-red-600 px-2 py-1 font-semibold text-white hover:bg-red-700 disabled:opacity-60 ${focus}`}
              >
                {busy ? '…' : 'Yes'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(false)}
                className={`font-semibold text-dash-outline hover:underline ${focus}`}
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              aria-label={`Delete ${graph.title}`}
              onClick={() => setConfirming(true)}
              className={`inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 ${focus}`}
            >
              <Trash2 size={12} aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* ── Inner chart panel (matches the .NET product chart panel) ── */}
      <div className="border-t border-dash-hairline">

        {/* Inner product header: bold product name + cosmetic zoom controls */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-dash-ink">
              {graph.productName ?? '—'}
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-dash-subtle">{subtitle}</p>
            )}
          </div>

          {/* Cosmetic zoom / menu icons — same chrome as the full chart view */}
          <div className="flex shrink-0 items-center gap-1 text-dash-subtle">
            <span className="inline-flex size-6 items-center justify-center rounded border border-dash-control-border text-sm leading-none select-none">
              +
            </span>
            <span className="inline-flex size-6 items-center justify-center rounded border border-dash-control-border text-sm leading-none select-none">
              −
            </span>
            <span className="inline-flex size-6 items-center justify-center rounded border border-dash-control-border select-none">
              <AlignJustify size={12} aria-hidden />
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="px-2 pb-2">
          {canPreview ? (
            <SavedGraphMiniChart
              graphId={graph.graphDashboardId}
              series={validSeries}
              unitId={graph.unitId!}
              currency={graph.currency!}
              unit={unitName || graph.unitId || ''}
            />
          ) : (
            <div className="flex h-52 items-center justify-center text-sm text-dash-subtle">
              Graph unavailable
            </div>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      {canPreview && validSeries.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-dash-hairline px-5 py-3">
          {validSeries.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-dash-subtle">
              <span
                className="flex-shrink-0 text-sm"
                style={{ color: i === 0 ? 'var(--dash-chart-line)' : extraColor(i - 1) }}
              >
                ●
              </span>
              <span className="truncate">
                {/* Same format as the .NET legend: Product(Country, LocationData, CUR/Unit) */}
                {s.productName ?? s.slug ?? ''}
                {`(${[s.locationName, s.locationData, unitLabel].filter(Boolean).join(', ')})`}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p role="alert" className="px-5 pb-3 text-xs text-alert">{error}</p>}
    </article>
  );
}

/** `/dashboard/saved-graphs` — lists all saved graphs with preview charts, view + delete. */
export function SavedGraphsPage() {
  const graphs = useAsync(getSavedGraphs);
  const [deleted, setDeleted] = useState<number[]>([]);
  const visible = (graphs.data ?? []).filter((g) => !deleted.includes(g.graphDashboardId));

  return (
    <section aria-label="My saved graphs" className="mx-auto max-w-280">
      {graphs.error ? (
        <div className="rounded-xl bg-dash-surface p-8 text-center shadow-dash-card">
          <p className="text-sm text-dash-ink">We couldn&apos;t load your saved graphs right now.</p>
        </div>
      ) : !graphs.data ? (
        <div
          aria-busy="true"
          aria-label="Loading saved graphs"
          className="@container grid gap-5 @sm:grid-cols-2"
        >
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-96 animate-pulse rounded-xl bg-dash-surface shadow-dash-card motion-reduce:animate-none" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl bg-dash-surface p-10 text-center shadow-dash-card">
          <p className="text-sm text-dash-ink">Your graph library is empty.</p>
          <p className="mt-2 text-sm text-dash-subtle">
            Open a product graph and click the folder icon to save it to your library.
          </p>
          <Link
            href="/dashboard/pricetrend"
            className={`mt-4 inline-block text-sm font-semibold text-dash-outline hover:underline ${focus}`}
          >
            Go to Price Trends
          </Link>
        </div>
      ) : (
        <div className="@container">
          <div className="grid gap-5 @sm:grid-cols-2">
            {visible.map((graph) => (
              <GraphCard
                key={graph.graphDashboardId}
                graph={graph}
                onDeleted={(id) => setDeleted((prev) => [...prev, id])}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
