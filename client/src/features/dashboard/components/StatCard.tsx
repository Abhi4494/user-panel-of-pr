import { ArrowRight } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { visualFor } from '@/features/dashboard/components/statVisuals';
import type { DashboardStat } from '@/features/dashboard/types';

/**
 * One clickable headline figure (proportions measured from the reference: 7px-ish radius, 28px padding, 48px tile).
 * Tall card: tile on top, title (wrapped narrow, so "Industry / Reports") + count centred, arrow bottom-right.
 * Compact card: tile left with the count right-aligned, title and arrow on the bottom row.
 */
export function StatCard({ stat }: { stat: DashboardStat }) {
  const { icon: Icon, tint, layout } = visualFor(stat.id);
  const tall = layout === 'tall';

  const tile = (
    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-dash-tile text-dash-tile-fg">
      <Icon size={24} aria-hidden />
    </span>
  );
  const title = (
    <Heading level={3} size="title" className="text-dash-text">
      {stat.title}
    </Heading>
  );
  const count = (
    <p className={`text-sm text-dash-muted ${tall ? 'mt-1' : 'text-right'}`}>
      <span className={`font-semibold text-dash-text tabular-nums ${tall ? '' : 'block text-base'}`}>{stat.count}</span> {stat.unit}
    </p>
  );
  const arrow = <ArrowRight size={26} strokeWidth={2.5} aria-hidden className="shrink-0 text-dash-text transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />;

  return (
    <Link
      href={stat.href}
      className={`group flex min-h-43 flex-col rounded-lg p-7 transition-shadow hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent ${tint} ${tall ? 'lg:row-span-2' : 'justify-between gap-4'}`}
    >
      {tall ? (
        <>
          {tile}
          <div className="my-auto max-w-32 py-4">
            {title}
            {count}
          </div>
          <span className="self-end">{arrow}</span>
        </>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            {tile}
            {count}
          </div>
          <div className="flex items-center justify-between gap-3">
            {title}
            {arrow}
          </div>
        </>
      )}
    </Link>
  );
}
