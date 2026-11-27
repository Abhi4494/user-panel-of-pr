import { Heading } from '@/components/ui/Heading';
import type { ProductGraph } from '@/features/product-graph/types';

/** Stands in for the chart card while the product has no price history to draw: same title and subtitle, a short note and a way back to the filters. */
export function GraphUnavailableCard({ graph, onOpenFilters }: { graph: ProductGraph; onOpenFilters: () => void }) {
  return (
    <section aria-label={`${graph.name} price graph`} className="min-w-0 rounded-xl bg-dash-chart-card p-6 shadow-dash-card">
      <Heading level={2} size="section" className="text-dash-outline">
        {graph.name}
      </Heading>
      <p className="mt-1.5 text-eyebrow text-dash-subtle">{graph.subtitle.join(' | ')}</p>
      <p className="mt-10 text-center text-sm text-dash-subtle">The price history for this product is not available yet.</p>
      <p className="mt-3 mb-16 text-center text-sm">
        <button type="button" onClick={onOpenFilters} className="font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
          Change filters
        </button>
      </p>
    </section>
  );
}
