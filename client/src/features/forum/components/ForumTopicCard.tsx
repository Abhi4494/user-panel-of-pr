import { UserRound } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import type { ForumTopic } from '@/features/forum/types';
import { formatDay } from '@/lib/formatDay';

/** White question card: topic chip + date, title, question, industry pill and the author (silhouette when unnamed). */
export function ForumTopicCard({ topic }: { topic: ForumTopic }) {
  return (
    <article className="flex min-w-0 flex-col rounded-md bg-dash-surface p-6 shadow-dash-card @min-[34rem]:min-h-74 @min-[34rem]:p-9.5">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 truncate rounded-md bg-dash-forum-tag px-3 py-1.5 text-eyebrow leading-4 text-white shadow-dash-card">{topic.tag}</span>
        <time dateTime={topic.publishedAt} className="shrink-0 rounded-md bg-dash-forum-date px-3 py-1.5 text-eyebrow leading-4 text-white">
          {formatDay(topic.publishedAt)}
        </time>
      </div>

      <Heading level={3} size="nav" className="mt-8 text-dash-strong">
        <Link href={topic.href} className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent">
          {topic.title}
        </Link>
      </Heading>
      <p className="mt-4 text-list-row leading-relaxed font-light text-dash-ink">{topic.question}</p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="min-w-0 rounded-md bg-dash-outline px-3.5 py-2 text-eyebrow leading-4 text-white shadow-[0_8px_14px_-6px_rgb(0_34_102/45%)]">{topic.categoryName}</span>
        <span className="flex shrink-0 items-center gap-2.5 text-sm font-semibold text-dash-strong">
          <UserRound size={22} strokeWidth={0} fill="currentColor" aria-hidden className="text-dash-forum-avatar" />
          {topic.author}
        </span>
      </div>
    </article>
  );
}
