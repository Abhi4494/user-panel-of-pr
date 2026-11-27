import { Heading } from '@/components/ui/Heading';
import { ViewAllLink } from '@/components/ui/ViewAllLink';
import { NewsCard } from '@/features/mrr/components/NewsCard';
import { NEWS_LIST_URL } from '@/lib/websiteUrl';
import type { NewsArticle } from '@/features/mrr/types';

/** Soft grey panel with the latest news; "View All" opens the full news list. */
export function NewsPanel({ articles }: { articles: NewsArticle[] }) {
  return (
    <section aria-labelledby="mrr-news" className="rounded-2xl bg-dash-panel-soft p-6 @3xl:p-7.5">
      <div className="flex items-center justify-between gap-3">
        <Heading id="mrr-news" level={2} size="section" className="text-dash-ink">
          News Articles
        </Heading>
        <ViewAllLink href={NEWS_LIST_URL} />
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </ul>
    </section>
  );
}
