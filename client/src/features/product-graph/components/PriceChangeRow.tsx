import { formatPercent, formatPrice } from '@/features/product-graph/lib/format';
import type { PriceChange } from '@/features/product-graph/types';

/** "%Q-o-Q Change", the percentage (big, light) and the price it is compared with (small). N/A when unavailable. */
export function PriceChangeRow({ change }: { change: PriceChange }) {
  const percent = change.percent === null ? 'N/A' : formatPercent(change.percent);
  const previous = change.previousPrice === null ? 'N/A' : formatPrice(change.previousPrice);

  return (
    <div className="px-4 py-5 text-center">
      <p className="text-sm text-dash-subtle">%{change.period} Change</p>
      <p className="mt-2 flex flex-wrap items-baseline justify-center gap-x-6 gap-y-1">
        <span className="text-headline leading-tight font-light text-dash-ink tabular-nums">{percent}</span>
        <span className="text-sm text-dash-ink tabular-nums">{previous}</span>
      </p>
    </div>
  );
}
