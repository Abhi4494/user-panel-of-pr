import { ChevronDown } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import type { Category } from '@/features/catalog/types';

interface ReportsToolbarProps {
  /** Page heading, e.g. "All Production Cost Reports". */
  title: string;
  categories: Category[];
  categoryId: number | null;
  onCategoryChange: (id: number | null) => void;
  pageSize: number;
  pageSizes: number[];
  onPageSizeChange: (size: number) => void;
  search: string;
  onSearchChange: (text: string) => void;
}

const field =
  'h-9 w-full appearance-none rounded bg-dash-surface pr-9 pl-3 text-sm text-dash-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * The controls that sit on the navy header of the all-reports screen (white text on navy): page heading and the category select,
 * then "Show N entries" and the search box. Everything is controlled by the page, which owns the filters.
 */
export function ReportsToolbar({ title, categories, categoryId, onCategoryChange, pageSize, pageSizes, onPageSizeChange, search, onSearchChange }: ReportsToolbarProps) {
  return (
    <div className="text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-2.5">
        <Heading level={2} size="section" className="text-white">
          {title}
        </Heading>
        <div className="relative w-full sm:w-71">
          <label htmlFor="pcr-category" className="sr-only">
            Category
          </label>
          <select
            id="pcr-category"
            value={categoryId ?? ''}
            onChange={(event) => onCategoryChange(event.target.value === '' ? null : Number(event.target.value))}
            className={field}
          >
            <option value="">Please select</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-dash-subtle" />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm">
          <label htmlFor="pcr-page-size">Show</label>
          <select
            id="pcr-page-size"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-11 rounded bg-dash-surface px-3 text-sm text-dash-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>Entries</span>
        </div>
        <div>
          <label htmlFor="pcr-search-reports" className="sr-only">
            Search reports
          </label>
          <input
            id="pcr-search-reports"
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className="h-11 w-full min-w-0 rounded-none border border-dash-input-border bg-dash-surface px-3 text-sm text-dash-ink placeholder:text-dash-ink/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-45"
          />
        </div>
      </div>
    </div>
  );
}
