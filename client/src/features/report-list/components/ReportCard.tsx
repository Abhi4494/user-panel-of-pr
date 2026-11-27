import { Link } from '@/components/ui/Link';
import type { ReportSummary } from '@/features/report-list/types';
import { formatDay } from '@/lib/formatDay';

const pill = 'rounded-lg px-3.5 py-1.5 text-eyebrow leading-4 font-medium text-white';

/**
 * One report in an "All ... Reports" list: category pill + date pill, title, description, optional facts (quarter, country), "View".
 * The category pill may wrap its text on a narrow screen (a long category must never push the card wider); the date never wraps.
 */
export function ReportCard({ report }: { report: ReportSummary }) {
  return (
    <li className="min-w-0 rounded bg-dash-surface p-7 shadow-dash-card sm:p-9">
      <div className="flex items-start justify-between gap-3">
        {report.categoryName && <span className={`${pill} min-w-0 bg-dash-badge-category`}>{report.categoryName}</span>}
        {report.publishedAt && (
          <time dateTime={report.publishedAt} className={`${pill} ml-auto shrink-0 whitespace-nowrap bg-dash-btn-dark`}>
            {formatDay(report.publishedAt)}
          </time>
        )}
      </div>
      <p className="mt-7 text-base leading-snug font-bold text-dash-ink">{report.title}</p>
      {report.description && <p className="mt-4 text-sm leading-normal text-dash-ink">{report.description}</p>}
      {report.facts && report.facts.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-x-3.5 text-caption font-bold text-dash-subtle">
          {report.facts.map((fact) => (
            <span key={fact}>{fact}</span>
          ))}
        </p>
      )}
      <Link
        href={report.href}
        className="mt-4 inline-flex h-9.5 items-center justify-center rounded bg-dash-btn-dark px-5.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
      >
        View
      </Link>
    </li>
  );
}
