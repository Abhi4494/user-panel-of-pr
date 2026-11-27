export const DAY_MS = 24 * 3600 * 1000;
export const MONTH_MS = 30.4375 * DAY_MS;

/** The visible slice of the series, as UTC millisecond timestamps. */
export interface TimeWindow {
  from: number;
  to: number;
}

/** First/last timestamp of the whole series (including the forecast tail). */
export interface Extent {
  min: number;
  max: number;
}

export type RangeId = 'home' | '1Y' | '2Y' | '5Y' | '10Y' | 'All';

/** Slightly more than N years so a window ending on the forecast tail starts on the last data point of that year. */
const RANGE_SPAN_DAYS: Record<Exclude<RangeId, 'All'>, number> = {
  home: 375,
  '1Y': 375,
  '2Y': 740,
  '5Y': 5 * 365.25 + 10,
  '10Y': 10 * 365.25 + 10,
};

/** Smallest window the user can zoom/drag to (30 days). */
export const MIN_SPAN = 30 * DAY_MS;

export function windowForRange(range: RangeId, extent: Extent): TimeWindow {
  if (range === 'All') return { from: extent.min, to: extent.max };
  return clampWindow({ from: extent.max - RANGE_SPAN_DAYS[range] * DAY_MS, to: extent.max }, extent);
}

/** Keeps the span but slides the window back inside the extent; shrinks it only if it is larger than the extent. */
export function clampWindow(window: TimeWindow, extent: Extent): TimeWindow {
  const full = extent.max - extent.min;
  const span = Math.min(Math.max(window.to - window.from, Math.min(MIN_SPAN, full)), full);
  const from = Math.min(Math.max(window.from, extent.min), extent.max - span);
  return { from, to: from + span };
}

/** `factor` < 1 zooms in, > 1 zooms out, both around the window's centre. */
export function zoomWindow(window: TimeWindow, extent: Extent, factor: number): TimeWindow {
  const centre = (window.from + window.to) / 2;
  const half = ((window.to - window.from) * factor) / 2;
  return clampWindow({ from: centre - half, to: centre + half }, extent);
}
