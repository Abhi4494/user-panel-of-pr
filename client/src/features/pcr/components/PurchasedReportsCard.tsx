import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { ViewAllLink } from '@/components/ui/ViewAllLink';
import { reportsUrl } from '@/features/pcr/lib/reportsUrl';
import type { PurchasedReport } from '@/features/pcr/types';
import { formatDay } from '@/lib/formatDay';

/**
 * Mint card at the bottom of the PCR dashboard: "Purchased Reports", a "View All" link, and the user's purchases (title + purchase
 * date, each opening the report). With no purchases it is just the header.
 * TODO(backend): "View All" may need to open a purchased-only list.
 */
export function PurchasedReportsCard({ reports }: { reports: PurchasedReport[] }) {
  return (
    <section aria-labelledby="pcr-purchased" className="rounded-2xl border border-dash-hairline bg-dash-tint-mint px-6 pt-6 pb-9">
      <div className="flex items-center justify-between gap-3">
        <Heading id="pcr-purchased" level={2} size="section" className="font-bold text-dash-ink">
          Purchased Reports
        </Heading>
        <ViewAllLink href={reportsUrl()} />
      </div>
      {reports.length > 0 && (
        <ul className="mt-3 grid grid-cols-1 divide-y divide-dash-hairline">
          {reports.map((report, index) => (
            <li key={`${report.href}-${index}`}>
              <Link
                href={report.href}
                className="group flex items-center justify-between gap-6 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
              >
                <span className="min-w-0 text-list-row font-light tracking-tight text-dash-ink group-hover:underline">{report.title}</span>
                {report.purchasedAt && (
                  <time dateTime={report.purchasedAt} className="shrink-0 text-caption font-bold text-dash-ink">
                    {formatDay(report.purchasedAt)}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
