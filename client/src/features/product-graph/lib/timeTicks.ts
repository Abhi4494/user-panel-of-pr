import { MONTH_MS } from '@/features/product-graph/lib/priceWindow';

export type TickUnit = 'month' | 'quarter' | 'year';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Axis ticks (UTC midnight, first of a month) with a density that suits the window length. */
export function buildTimeTicks(from: number, to: number): { ticks: number[]; unit: TickUnit } {
  const months = (to - from) / MONTH_MS;
  const unit: TickUnit = months <= 16 ? 'month' : months <= 40 ? 'quarter' : 'year';
  const start = new Date(from);
  const ticks: number[] = [];

  if (unit === 'year') {
    const years = Math.ceil(months / 12);
    const step = years > 24 ? 5 : years > 12 ? 2 : 1;
    for (let year = start.getUTCFullYear() + (start.getUTCMonth() > 0 || start.getUTCDate() > 1 ? 1 : 0); ; year += 1) {
      const tick = Date.UTC(year, 0, 1);
      if (tick > to) break;
      if (year % step === 0 || step === 1) ticks.push(tick);
    }
    return { ticks, unit };
  }

  const stride = unit === 'month' ? 1 : 3;
  const year = start.getUTCFullYear();
  let month = start.getUTCMonth() + (start.getUTCDate() > 1 ? 1 : 0);
  if (stride === 3) month = Math.ceil(month / 3) * 3;
  for (;;) {
    const tick = Date.UTC(year + Math.floor(month / 12), month % 12, 1);
    if (tick > to) break;
    if (tick >= from) ticks.push(tick);
    month += stride;
  }
  return { ticks, unit };
}

/** Keeps at most `max` ticks, evenly thinned (always keeps the first). */
export function thinTicks(ticks: number[], max: number): number[] {
  if (max < 1 || ticks.length <= max) return ticks;
  const step = Math.ceil(ticks.length / max);
  return ticks.filter((_, index) => index % step === 0);
}

/** "Nov '25" for ordinary ticks; the bare year (rendered bold) for January ticks, or for every tick on a yearly axis. */
export function formatTick(timestamp: number, unit: TickUnit): { text: string; isYear: boolean } {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  if (unit === 'year' || date.getUTCMonth() === 0) return { text: String(year), isYear: unit !== 'year' };
  return { text: `${MONTHS[date.getUTCMonth()]} '${String(year).slice(2)}`, isYear: false };
}
