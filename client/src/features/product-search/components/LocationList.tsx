import { SearchX } from 'lucide-react';
import { Link } from '@/components/ui/Link';
import { productGraphPath } from '@/features/product-search/lib/productUrl';
import type { SearchLocation } from '@/features/product-search/types';

/** Places a product is tracked in; each opens that product's price graph. A product without any shows the "no results" note. */
export function LocationList({ productSlug, locations }: { productSlug: string; locations: SearchLocation[] }) {
  if (!locations.length) {
    return (
      <div className="flex flex-col items-center pt-6 pr-1 text-center">
        <SearchX size={64} strokeWidth={1} aria-hidden className="text-dash-outline/60" />
        <p className="mt-4 text-sm font-medium text-dash-ink">No Matching Results</p>
        <p className="mt-1 text-sm text-dash-subtle">Sorry, we couldn&apos;t find any matching records. Please try different search terms.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1">
      {locations.map((location) => (
        <li key={location.slug}>
          <Link
            href={productGraphPath(productSlug, location.slug)}
            className="block py-2.5 text-menu-link text-dash-ink transition-colors hover:font-semibold hover:text-dash-outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
          >
            {location.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
