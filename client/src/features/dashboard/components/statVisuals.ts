import { ChartLine, FileSearch, ShoppingBag, TrendingUp, type LucideIcon } from 'lucide-react';

export interface StatVisual {
  icon: LucideIcon;
  /** Full class names so Tailwind can see them. Tints are theme tokens (light/dark). */
  tint: string;
  /** `tall` spans two grid rows at lg+; `compact` is a single row. */
  layout: 'tall' | 'compact';
}

/**
 * Presentation per `DashboardStat.id`. The backend sends data only; look and placement stay here.
 * A new id from the API falls back to `fallbackVisual`, so adding a stat server-side never breaks the page.
 */
const visuals: Record<string, StatVisual> = {
  'industry-reports': { icon: ChartLine, tint: 'bg-dash-tint-mint', layout: 'tall' },
  'price-trends': { icon: TrendingUp, tint: 'bg-dash-tint-rose', layout: 'compact' },
  'production-cost-reports': { icon: FileSearch, tint: 'bg-dash-tint-sky', layout: 'tall' },
  'my-purchases': { icon: ShoppingBag, tint: 'bg-dash-tint-peach', layout: 'compact' },
};

const fallbackVisual: StatVisual = { icon: ChartLine, tint: 'bg-dash-surface', layout: 'compact' };

export function visualFor(id: string): StatVisual {
  return visuals[id] ?? fallbackVisual;
}
