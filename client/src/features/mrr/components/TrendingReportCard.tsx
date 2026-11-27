import { BookOpen } from 'lucide-react';
import { Link } from '@/components/ui/Link';
import type { TrendingReport } from '@/features/mrr/types';
import { formatDay } from '@/lib/formatDay';

const action =
  'inline-flex h-9.5 w-full items-center justify-center rounded bg-dash-chip px-4 text-sm font-semibold whitespace-nowrap text-dash-chip-text transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';
const chip = 'mt-2.5 inline-block rounded bg-dash-chip px-3 py-0.5 text-eyebrow leading-3 font-semibold text-dash-chip-text';

/**
 * Peach card for the currently trending report: cover + "Trending Reports", date, title and category chip, then the three
 * actions stacked on the right. Columns follow the card's own width (container query), like the other peach cards.
 * "Enquire Now" and "Request Sample" open the report's `/request-sample` page on the website; "Buy Now" opens `/pricing-details`.
 */
export function TrendingReportCard({ report }: { report: TrendingReport }) {
  const requestSample = `${report.href}/request-sample`;
  const pricingDetails = `${report.href}/pricing-details`;

  return (
    <section aria-label="Trending report" className="@container">
      <div className="flex flex-col gap-6 rounded-2xl bg-dash-tint-peach p-8 @min-[38rem]:flex-row @min-[38rem]:items-center @min-[38rem]:gap-8 @min-[38rem]:px-10 @min-[38rem]:py-10">
        <div className="flex shrink-0 flex-col gap-4 @min-[38rem]:w-32">
          {report.coverUrl ? (
            <img src={report.coverUrl} alt="" className="size-17 rounded-xl object-cover" />
          ) : (
            <span aria-hidden className="grid size-17 place-items-center rounded-xl bg-dash-cover-bg text-dash-cover-fg">
              <BookOpen size={26} strokeWidth={1.5} />
            </span>
          )}
          <p className="max-w-28 text-lg leading-snug font-bold text-dash-strong">Trending Reports</p>
        </div>

        <div className="min-w-0 flex-1">
          <time dateTime={report.publishedAt} className="block text-eyebrow font-bold text-dash-ink">
            {formatDay(report.publishedAt)}
          </time>
          <Link href={report.href} className="mt-2.5 block text-base leading-tight text-dash-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent">
            {report.title}
          </Link>
          {report.categoryHref ? (
            <Link href={report.categoryHref} className={`${chip} hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent`}>
              {report.categoryName}
            </Link>
          ) : (
            <p className={chip}>{report.categoryName}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-dash-accent-line pt-6 @min-[38rem]:w-47 @min-[38rem]:shrink-0 @min-[38rem]:border-t-0 @min-[38rem]:border-l @min-[38rem]:pt-0 @min-[38rem]:pl-8">
          <Link href={requestSample} className={action}>
            Enquire Now
          </Link>
          <Link href={requestSample} className={action}>
            Request Sample
          </Link>
          <Link href={pricingDetails} className={action}>
            Buy Now
          </Link>
        </div>
      </div>
    </section>
  );
}
