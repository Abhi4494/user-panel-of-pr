import { Shapes } from 'lucide-react';
import { Carousel } from '@/components/ui/Carousel';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import type { Category } from '@/features/catalog/types';
import { mrrReportsUrl } from '@/features/mrr/lib/mrrUrls';

/**
 * Ten tiles side by side when there is room: exactly a tenth of the width (112px in the 1120px container, 96-98px when the sidebar menu is open;
 * not rounded, so no sliver of the next tile shows at the edge), never narrower than 96px. Narrower than 960px, fewer fit and the rest scroll in.
 */
const tileWidth = (viewportWidth: number) => Math.min(112, Math.max(96, viewportWidth / 10));

/**
 * The strip of industry tiles on the navy header: a photo (112x54 ratio) with the category name underneath (white, bold, wraps to 3 lines).
 * It is a looping autoplay carousel (see `Carousel`): the tiles glide one step every few seconds, pause on hover/focus, and have
 * arrows (on hover), swipe and a Pause button. A category without a photo ("Other") gets a neutral tile (the live site shows a broken image).
 * Each tile opens the reports list filtered to that category.
 */
export function CategoryCarousel({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="mrr-industries" className="text-white">
      <Heading id="mrr-industries" level={2} size="section" className="sr-only">
        Industries
      </Heading>
      {/* Arrows sit over the photos (about half a tile high), not over the whole tile including its label. */}
      <Carousel
        label="Industries"
        items={categories}
        getKey={(category) => category.id}
        slideWidth={tileWidth}
        autoplayMs={3500}
        controlsClassName="top-6 -translate-y-1/2"
        renderItem={(category, clone) => (
          <Link
            href={mrrReportsUrl({ categoryId: category.id })}
            tabIndex={clone ? -1 : undefined}
            aria-hidden={clone || undefined}
            className="group block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            {category.imageUrl ? (
              <img src={category.imageUrl} alt="" width={112} height={54} loading="lazy" draggable={false} className="block aspect-112/54 w-full object-cover" />
            ) : (
              <span aria-hidden className="grid aspect-112/54 w-full place-items-center bg-white/10 text-white/60">
                <Shapes size={22} strokeWidth={1.5} />
              </span>
            )}
            <span className="mt-3.5 block pr-3 text-sm leading-snug font-bold group-hover:underline">{category.name}</span>
          </Link>
        )}
      />
    </section>
  );
}
