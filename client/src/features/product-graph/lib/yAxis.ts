export interface YAxisScale {
  domain: [number, number];
  /** Distance between gridlines/labels; pass it to `ticksBetween`. */
  step: number;
}

/** 1, 2, 2.5, 5 or 10 times a power of ten: the first that gives at most `maxTicks` intervals. */
function niceStep(range: number, maxTicks: number): number {
  const rough = range / maxTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((step) => step >= rough) ?? 10 * magnitude;
}

/**
 * Y scale for the visible min/max. Mirrors the reference chart: generous headroom below the line (three quarters of
 * the range again) and a little above, snapped to a round step, e.g. 545..862 -> 300..900 in steps of 100.
 */
export function computeYAxis(min: number, max: number): YAxisScale {
  const spread = Math.max(max - min, Math.abs(max) * 0.1, 1);
  const rawLow = Math.max(0, min - spread * 0.75);
  const rawHigh = max + spread * 0.1;
  const step = niceStep(rawHigh - rawLow, 6);
  return { domain: [Math.max(0, Math.floor(rawLow / step) * step), Math.ceil(rawHigh / step) * step], step };
}

/** Round values from `low` to `high` every `step` (inclusive), free of floating-point dust. */
export function ticksBetween(low: number, high: number, step: number): number[] {
  const ticks: number[] = [];
  for (let tick = low; tick <= high + step / 1000; tick += step) ticks.push(Math.round(tick * 1e6) / 1e6);
  return ticks;
}
