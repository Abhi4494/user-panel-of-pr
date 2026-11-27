import { useCallback, useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { getForumTopics } from '@/features/forum/api/getForumTopics';
import { ForumTopicCard } from '@/features/forum/components/ForumTopicCard';
import { ReportsPager } from '@/features/report-list/components/ReportsPager';
import { useAsync } from '@/hooks/useAsync';

const PAGE_SIZE = 10;

/**
 * Discussion Forum (`/dashboard/discussionforum`): heading on the navy header, two columns of question cards (one when narrow), pager.
 * TODO(backend): confirm production's paging/search; the top-bar search is not wired to the forum yet.
 */
export function ForumPage() {
  const [page, setPage] = useState(1);
  const load = useCallback(() => getForumTopics({ page, pageSize: PAGE_SIZE }), [page]);
  const topics = useAsync(load, { pageLoader: 'first' });

  return (
    <div className="@container mx-auto max-w-285">
      <div className="pt-2">
        <Heading level={2} size="title" className="text-white">
          Forums
        </Heading>
        <p className="mt-1 text-sm font-light text-white/60">Find your answers in our knowledge base</p>
      </div>

      <div className="mt-8">
        {topics.error ? (
          <p role="alert" className="rounded bg-dash-surface p-9 text-center text-sm text-alert shadow-dash-card">
            We couldn&apos;t load the discussions right now. Please try again later.
          </p>
        ) : (
          <>
            <ul aria-busy={topics.isLoading} className="grid grid-cols-1 gap-5 @3xl:grid-cols-2">
              {(topics.data?.items ?? []).map((topic) => (
                <li key={topic.id} className="flex *:flex-1">
                  <ForumTopicCard topic={topic} />
                </li>
              ))}
            </ul>
            {topics.data && <ReportsPager page={page} pageSize={PAGE_SIZE} total={topics.data.total} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
}
