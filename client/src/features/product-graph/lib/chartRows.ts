import type { Extent } from '@/features/product-graph/lib/priceWindow';
import type { PricePoint } from '@/features/product-graph/types';

/** One x position of the chart. `value` is the solid line, `forecast` the dashed one, `all` feeds the navigator. */
export interface ChartRow {
  t: number;
  value?: number;
  forecast?: number;
  all: number;
}

/**
 * API points -> chart rows. The last actual point also carries a `forecast` value so the dashed tail starts exactly
 * where the solid line ends.
 */
export function toChartRows(series: PricePoint[]): ChartRow[] {
  const rows: ChartRow[] = series.map((point) => ({
    t: Date.parse(point.date),
    ...(point.forecast ? { forecast: point.value } : { value: point.value }),
    all: point.value,
  }));
  const lastActual = rows.map((row) => row.value !== undefined).lastIndexOf(true);
  if (lastActual >= 0 && lastActual < rows.length - 1) rows[lastActual].forecast = rows[lastActual].value;
  return rows;
}

export function extentOf(rows: ChartRow[]): Extent {
  return { min: rows[0].t, max: rows[rows.length - 1].t };
}
