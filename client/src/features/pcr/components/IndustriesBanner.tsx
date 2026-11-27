import { Link } from '@/components/ui/Link';
import illustrationUrl from '@/assets/books-reading.png';
import { reportsUrl } from '@/features/pcr/lib/reportsUrl';
import type { Category } from '@/features/catalog/types';

/**
 * Peach card: how many industries there are, a line of copy with one black chip per category (each opens the all-reports
 * list filtered to it), and (right) the illustration with "Subscribe More". Like the Price Trends summary card it follows its
 * own width (container queries; three columns from 38rem, below that the longest chip would touch the divider) because the sidebar
 * menu changes the room available.
 * TODO(backend): confirm where "Subscribe More" goes (placeholder internal path).
 */
export function IndustriesBanner({ categories }: { categories: Category[] }) {
  return (
    <section aria-label="Industries" className="@container">
      <div className="flex flex-col gap-8 rounded-xl bg-dash-tint-peach p-8 @min-[38rem]:flex-row @min-[38rem]:items-stretch @min-[38rem]:gap-6 @min-[38rem]:p-[clamp(1.5rem,5cqw,2.5rem)]">
        <div className="flex shrink-0 flex-col justify-center">
          <p className="text-hero-number leading-none font-bold tracking-tighter text-dash-ink tabular-nums">{categories.length}+</p>
          <p className="mt-3 max-w-32 text-lg leading-snug font-bold text-dash-strong">Industries to explore</p>
        </div>

        <div className="min-w-0 flex-1 text-sm leading-snug text-dash-ink">
          <p>Reports examining production costs of chemicals &amp; utilities.</p>
          <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1.25">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={reportsUrl({ categoryId: category.id })}
                  className="block rounded bg-dash-chip px-3 py-0.5 text-eyebrow leading-3 font-semibold whitespace-nowrap text-dash-chip-text transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-dash-accent-line pt-8 @min-[38rem]:w-36 @min-[38rem]:shrink-0 @min-[38rem]:border-t-0 @min-[38rem]:border-l @min-[38rem]:pt-0 @min-[38rem]:pl-6">
          <img src={illustrationUrl} alt="" width={158} height={80} className="h-auto w-full max-w-40" />
          <Link
            href="/dashboard/managesubscription"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-dash-chip px-4 text-sm font-semibold whitespace-nowrap text-dash-chip-text transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
          >
            Subscribe More
          </Link>
        </div>
      </div>
    </section>
  );
}
