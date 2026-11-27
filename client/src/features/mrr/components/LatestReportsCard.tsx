import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { ViewAllLink } from '@/components/ui/ViewAllLink';
import { mrrReportsUrl } from '@/features/mrr/lib/mrrUrls';
import type { LatestReport } from '@/features/mrr/types';
import { formatShortDay } from '@/lib/formatDay';

/** White card under the stats: the newest reports as a title + short date per row; "View All" opens the full Industry Reports list. */
export function LatestReportsCard({ reports, viewAllHref = mrrReportsUrl() }: { reports: LatestReport[]; viewAllHref?: string }) {
  return (
    <section aria-labelledby="mrr-latest" className="rounded-2xl border border-dash-hairline bg-dash-surface p-5.5">
      <div className="flex items-center justify-between gap-3">
        <Heading id="mrr-latest" level={2} size="section" className="font-bold text-dash-ink">
          Latest Reports
        </Heading>
        <ViewAllLink href={viewAllHref} />
      </div>
      <ul className="mt-3 grid grid-cols-1 divide-y divide-dash-hairline">
        {reports.map((report) => (
          <li key={report.id}>
            <Link
              href={report.href}
              className="group flex items-center justify-between gap-6 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
            >
              <span className="min-w-0 text-list-row font-light tracking-tight text-dash-ink group-hover:underline">{report.title}</span>
              <time dateTime={report.publishedAt} className="shrink-0 text-caption font-bold text-dash-ink">
                {formatShortDay(report.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
