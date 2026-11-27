import { Link } from '@/components/ui/Link';
import type { NewsArticle } from '@/features/mrr/types';
import { formatDay } from '@/lib/formatDay';

/** White card in "News Articles": a wide photo with the headline and date under it. */
export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <li>
      <Link
        href={article.href}
        className="group block overflow-hidden rounded-2xl bg-dash-surface transition-shadow hover:shadow-dash-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
      >
        <img src={article.imageUrl} alt="" width={600} height={280} loading="lazy" className="block h-35 w-full object-cover" />
        <span className="block px-6 py-5">
          <span className="block text-sm leading-normal font-bold text-dash-ink group-hover:underline">{article.title}</span>
          <time dateTime={article.publishedAt} className="mt-1.5 block text-caption text-dash-subtle">
            {formatDay(article.publishedAt)}
          </time>
        </span>
      </Link>
    </li>
  );
}
