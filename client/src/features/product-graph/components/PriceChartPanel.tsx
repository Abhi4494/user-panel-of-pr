import { PriceChart, extraColor, type ExtraSeriesEntry } from '@/features/product-graph/components/PriceChart';
import { PriceNavigator } from '@/features/product-graph/components/PriceNavigator';
import type { ChartRow } from '@/features/product-graph/lib/chartRows';
import type { Extent, TimeWindow } from '@/features/product-graph/lib/priceWindow';

interface PriceChartPanelProps {
  rows: ChartRow[];
  extent: Extent;
  window: TimeWindow;
  unit: string;
  seriesLabel: string;
  extraSeries?: ExtraSeriesEntry[];
  onWindowChange: (next: TimeWindow) => void;
}

export default function PriceChartPanel({ rows, extent, window, unit, seriesLabel, extraSeries = [], onWindowChange }: PriceChartPanelProps) {
  return (
    <>
      <PriceChart rows={rows} window={window} unit={unit} seriesLabel={seriesLabel} extraSeries={extraSeries} />
      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <p className="flex items-center gap-1.5 text-caption text-dash-chart-line">
          <span aria-hidden className="size-3.5 rounded-full bg-dash-chart-line" />
          {seriesLabel}
        </p>
        {extraSeries.map((series, idx) => (
          <p key={idx} className="flex items-center gap-1.5 text-caption" style={{ color: extraColor(idx) }}>
            <span aria-hidden className="size-3.5 flex-shrink-0 rounded-full" style={{ backgroundColor: extraColor(idx) }} />
            {series.label}
          </p>
        ))}
      </div>
      <div className="mt-6">
        <PriceNavigator rows={rows} extent={extent} window={window} onChange={onWindowChange} />
      </div>
    </>
  );
}
