import { Link } from '@/components/ui/Link';
import { CategoryAvatar } from '@/features/pcr/components/CategoryAvatar';
import type { PcrReport } from '@/features/pcr/types';

/** White card in "Recent Cost Models": title, description, then the category and country with the little person icon. */
export function ModelCard({ report }: { report: PcrReport }) {
  return (
    <li>
      <Link
        href={report.href}
        className="flex h-full flex-col gap-4 rounded-xl bg-dash-surface p-6 transition-shadow hover:shadow-dash-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
      >
        <span className="block text-sm leading-normal font-bold text-dash-ink">{report.title}</span>
        <span className="line-clamp-10 block text-sm leading-normal text-dash-subtle">{report.description}</span>
        <span className="mt-auto flex items-center gap-2.5 pt-1">
          <CategoryAvatar />
          <span className="min-w-0">
            <span className="block text-eyebrow leading-snug font-bold text-dash-ink">{report.categoryName}</span>
            <span className="block text-eyebrow leading-snug font-bold text-dash-subtle">{report.country}</span>
          </span>
        </span>
      </Link>
    </li>
  );
}
