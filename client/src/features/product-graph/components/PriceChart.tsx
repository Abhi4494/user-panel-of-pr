import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { formatDate, formatPrice } from '@/features/product-graph/lib/format';
import type { ChartRow } from '@/features/product-graph/lib/chartRows';
import type { TimeWindow } from '@/features/product-graph/lib/priceWindow';
import { buildTimeTicks, formatTick, thinTicks, type TickUnit } from '@/features/product-graph/lib/timeTicks';
import { computeYAxis, ticksBetween } from '@/features/product-graph/lib/yAxis';
import type { PricePoint } from '@/features/product-graph/types';

/** Extra series entry: label + raw price points, to be merged with the primary rows by time key. */
export interface ExtraSeriesEntry {
  label: string;
  points: PricePoint[];
  /** Kept so the graph can be saved with all series. */
  productId?: string | number;
  locationId?: string | number;
}

interface PriceChartProps {
  rows: ChartRow[];
  window: TimeWindow;
  unit: string;
  seriesLabel?: string;
  extraSeries?: ExtraSeriesEntry[];
}

interface TickProps {
  x?: number;
  y?: number;
  payload?: { value: number };
  tickUnit: TickUnit;
  chartWidth: number;
}

const EDGE_ROOM = 28;
const LABEL_SLOT = 48;

/** Colors for extra series (index 0 = first extra, etc.). Primary uses `var(--dash-chart-line)`. */
const EXTRA_COLORS = ['#F97316', '#8B5CF6', '#10B981', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444'];
export const extraColor = (idx: number) => EXTRA_COLORS[idx % EXTRA_COLORS.length];

function TimeTick({ x = 0, y = 0, payload, tickUnit, chartWidth }: TickProps) {
  if (!payload) return null;
  const { text, isYear } = formatTick(payload.value, tickUnit);
  const atEnd = x > chartWidth - EDGE_ROOM;
  return (
    <text
      x={atEnd ? chartWidth - 2 : x}
      y={y + 14}
      textAnchor={atEnd ? 'end' : 'middle'}
      fontSize={10}
      fontWeight={isYear ? 700 : 400}
      fill="var(--dash-chart-axis)"
    >
      {text}
    </text>
  );
}

function PriceTooltip({ active, payload, unit, seriesLabel, extraLabels }: TooltipProps<number, string> & { unit: string; seriesLabel: string; extraLabels: string[] }) {
  const row = payload?.[0]?.payload as Record<string, unknown> | undefined;
  if (!active || !row) return null;
  const t = row.t as number;
  const all = row.all as number;
  const isForecast = row.value === undefined;
  return (
    <div className="rounded-md border border-dash-control-border bg-dash-surface px-3 py-2 text-caption shadow-dash-card min-w-32 max-w-72">
      <p className="mb-1 text-dash-subtle">{formatDate(t)}</p>
      <p className="font-semibold whitespace-nowrap text-dash-ink" style={{ color: 'var(--dash-chart-line)' }}>
        <span className="font-normal text-dash-subtle">{seriesLabel}: </span>
        {formatPrice(all)}
        {isForecast && <span className="ml-1 font-normal text-dash-subtle">(forecast)</span>}
      </p>
      {extraLabels.map((label, idx) => {
        const n = idx + 1;
        const val = (row[`v${n}`] ?? row[`f${n}`]) as number | undefined;
        if (val == null) return null;
        const isFc = row[`v${n}`] == null;
        return (
          <p key={n} className="font-semibold whitespace-nowrap" style={{ color: extraColor(idx) }}>
            <span className="font-normal" style={{ color: extraColor(idx) }}>{label} ({unit}): </span>
            {formatPrice(val)}
            {isFc && <span className="ml-1 font-normal" style={{ color: extraColor(idx), opacity: 0.7 }}>(forecast)</span>}
          </p>
        );
      })}
    </div>
  );
}

export function PriceChart({ rows, window, unit, seriesLabel = '', extraSeries = [] }: PriceChartProps) {
  const [width, setWidth] = useState(720);

  const { ticks, tickUnit } = useMemo(() => {
    const built = buildTimeTicks(window.from, window.to);
    return { ticks: thinTicks(built.ticks, Math.max(2, Math.floor(width / LABEL_SLOT))), tickUnit: built.unit };
  }, [window.from, window.to, width]);

  // Merge extra series data into the primary rows by timestamp for Recharts
  const mergedData = useMemo((): Record<string, unknown>[] => {
    if (!extraSeries.length) return rows as unknown as Record<string, unknown>[];

    const byTime = new Map<number, Record<string, unknown>>();
    rows.forEach((row) => byTime.set(row.t, { ...row }));

    extraSeries.forEach((series, idx) => {
      const n = idx + 1;
      const sorted = [...series.points].sort((a, b) => a.date.localeCompare(b.date));
      const lastActualIdx = sorted.map((p) => !p.forecast).lastIndexOf(true);

      sorted.forEach((pt, ptIdx) => {
        const t = Date.parse(pt.date);
        const existing = byTime.get(t) ?? { t, all: pt.value };
        // Bridge: last actual point also carries a forecast key so the dashed line starts there
        if (!pt.forecast) {
          (existing as Record<string, unknown>)[`v${n}`] = pt.value;
          if (ptIdx === lastActualIdx && lastActualIdx < sorted.length - 1) {
            (existing as Record<string, unknown>)[`f${n}`] = pt.value;
          }
        } else {
          (existing as Record<string, unknown>)[`f${n}`] = pt.value;
        }
        // `a${n}` = all values for this extra series (used for y-axis domain)
        (existing as Record<string, unknown>)[`a${n}`] = pt.value;
        byTime.set(t, existing as Record<string, unknown>);
      });
    });

    return Array.from(byTime.values()).sort((a, b) => (a.t as number) - (b.t as number));
  }, [rows, extraSeries]);

  const yScale = useMemo(() => {
    const allValues: number[] = [];
    mergedData.forEach((row) => {
      const t = row.t as number;
      if (t < window.from || t > window.to) return;
      if (row.all != null) allValues.push(row.all as number);
      extraSeries.forEach((_, idx) => {
        const val = row[`a${idx + 1}`] as number | undefined;
        if (val != null) allValues.push(val);
      });
    });
    const { domain, step } = allValues.length
      ? computeYAxis(Math.min(...allValues), Math.max(...allValues))
      : { domain: [0, 100] as [number, number], step: 25 };
    return { domain, ticks: ticksBetween(domain[0], domain[1], step) };
  }, [mergedData, window.from, window.to, extraSeries]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%" onResize={(nextWidth) => setWidth(nextWidth)}>
        <LineChart data={mergedData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--dash-chart-grid)" />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[window.from, window.to]}
            ticks={ticks}
            interval={0}
            allowDataOverflow
            tickLine={false}
            axisLine={false}
            height={28}
            tick={<TimeTick tickUnit={tickUnit} chartWidth={width} />}
          />
          <YAxis
            domain={yScale.domain}
            ticks={yScale.ticks}
            allowDataOverflow
            tickLine={false}
            axisLine={false}
            width={56}
            tickMargin={10}
            tickFormatter={formatPrice}
            tick={{ fontSize: 10, fill: 'var(--dash-chart-axis)' }}
          />
          <Tooltip content={<PriceTooltip unit={unit} seriesLabel={seriesLabel} extraLabels={extraSeries.map((s) => s.label)} />} cursor={{ stroke: 'var(--dash-chart-axis)', strokeDasharray: '3 3' }} isAnimationActive={false} />
          {/* Primary series — connectNulls so extra-series rows between primary timestamps don't break the line */}
          <Line dataKey="value" type="linear" stroke="var(--dash-chart-line)" strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4, stroke: 'var(--dash-surface)', strokeWidth: 2 }} isAnimationActive={false} />
          <Line dataKey="forecast" type="linear" stroke="var(--dash-chart-line)" strokeWidth={2} strokeDasharray="4 3" dot={false} connectNulls activeDot={{ r: 4, stroke: 'var(--dash-surface)', strokeWidth: 2 }} isAnimationActive={false} />
          {/* Extra series */}
          {extraSeries.map((_, idx) => {
            const n = idx + 1;
            const color = extraColor(idx);
            return [
              <Line key={`v${n}`} dataKey={`v${n}`} type="linear" stroke={color} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4, stroke: 'var(--dash-surface)', strokeWidth: 2 }} isAnimationActive={false} />,
              <Line key={`f${n}`} dataKey={`f${n}`} type="linear" stroke={color} strokeWidth={2} strokeDasharray="4 3" dot={false} connectNulls activeDot={{ r: 4, stroke: 'var(--dash-surface)', strokeWidth: 2 }} isAnimationActive={false} />,
            ];
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
