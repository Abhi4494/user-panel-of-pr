import { Heading } from '@/components/ui/Heading';
import type { ProductCategory } from '@/features/price-trends/types';

interface CategoryFilterProps {
  categories: ProductCategory[];
  /** Called with the category's id when a chip is clicked (the page opens the product search on it). */
  onPick: (id: string) => void;
}

/** Outlined category chips; each opens the "Search Products" panel on that industry. */
export function CategoryFilter({ categories, onPick }: CategoryFilterProps) {
  return (
    <section aria-labelledby="price-trends-categories">
      <Heading id="price-trends-categories" level={2} size="section" className="text-dash-ink">
        Categories
      </Heading>
      <ul className="mt-3.5 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              onClick={() => onPick(category.id)}
              className="rounded-lg border border-dash-outline px-3 py-1 text-caption leading-4 text-dash-ink transition-colors hover:bg-dash-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
