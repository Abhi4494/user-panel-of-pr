import { PriceChangeRow } from '@/features/product-graph/components/PriceChangeRow';
import { formatPrice } from '@/features/product-graph/lib/format';
import type { ProductGraph } from '@/features/product-graph/types';

/** Right-hand white card: latest price box, then the W-o-W / M-o-M / Q-o-Q / Y-o-Y change rows. */
export function PriceSummaryPanel({ graph }: { graph: ProductGraph }) {
  const { latest, changes } = graph;

  return (
    <aside aria-label="Latest price and changes" className="flex min-w-0 flex-col gap-5 rounded-xl bg-dash-surface p-5 shadow-dash-card @3xl:p-6">
      <div className="rounded-2xl border border-dash-hairline px-3 py-6 text-center">
        <p className="text-lg leading-none font-bold text-dash-ink tabular-nums">{formatPrice(latest.price)}</p>
        <p className="mt-2 text-eyebrow leading-snug text-dash-subtle uppercase">{latest.unit}</p>
        <p className="text-eyebrow leading-snug text-dash-subtle uppercase">{latest.region}</p>
      </div>

      <div className="divide-y divide-dash-divider rounded-xl border border-dash-divider">
        {changes.map((change) => (
          <PriceChangeRow key={change.period} change={change} />
        ))}
      </div>
    </aside>
  );
}
