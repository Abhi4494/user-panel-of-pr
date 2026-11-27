import { Hash } from 'lucide-react';
import { Link } from '@/components/ui/Link';
import type { SubscribedProduct } from '@/features/price-trends/types';

/** One row: hash glyph, product name + category, and the "Subscribed" / "Not Subscribed" status pill. */
export function SubscribedProductItem({ product }: { product: SubscribedProduct }) {
  return (
    <li>
      <Link
        href={product.href}
        className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-dash-hover focus-visible:outline-2 focus-visible:outline-dash-accent"
      >
        <Hash size={20} strokeWidth={2} aria-hidden className="shrink-0 text-dash-ink" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-snug font-medium text-dash-ink">{product.name}</span>
          <span className="block text-caption leading-snug text-dash-subtle">{product.categoryName}</span>
        </span>
        <span className="shrink-0 rounded-full bg-dash-pill px-2.5 py-1 text-eyebrow leading-4 text-dash-pill-text">{product.subscribed ? 'Subscribed' : 'Not Subscribed'}</span>
      </Link>
    </li>
  );
}
