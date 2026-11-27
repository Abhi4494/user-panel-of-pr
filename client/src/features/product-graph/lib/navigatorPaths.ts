import type { ChartRow } from '@/features/product-graph/lib/chartRows';
import type { Extent } from '@/features/product-graph/lib/priceWindow';

const WIDTH = 1000;
const HEIGHT = 100;
const TOP_PAD = 4;
const MAX_POINTS = 600;

/** SVG path data (in a 1000x100 box) for the navigator: the outline and the closed area under it. */
export function buildNavigatorPaths(rows: ChartRow[], extent: Extent): { line: string; area: string } {
  const stride = Math.max(1, Math.ceil(rows.length / MAX_POINTS));
  const sample = rows.filter((_, index) => index % stride === 0 || index === rows.length - 1);
  const values = sample.map((row) => row.all);
  const low = Math.min(...values);
  const span = Math.max(Math.max(...values) - low, 1e-9);
  const total = Math.max(extent.max - extent.min, 1);

  const points = sample.map((row) => {
    const x = ((row.t - extent.min) / total) * WIDTH;
    const y = HEIGHT - ((row.all - low) / span) * (HEIGHT - TOP_PAD);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${points.join('L')}`;
  return { line, area: `${line}L${WIDTH},${HEIGHT}L0,${HEIGHT}Z` };
}
