import { MOCK_FORUM_TOPICS } from '@/features/forum/api/mockTopics';
import type { ForumListQuery, ForumListResult } from '@/features/forum/types';

/**
 * One page of discussion topics.
 *
 * TODO(backend): replace the mock with `GET /api/forum/topics?page=&pageSize=` -> `ForumListResult` (paging done by the server). Keep the signature.
 */
export async function getForumTopics({ page, pageSize }: ForumListQuery): Promise<ForumListResult> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const start = (page - 1) * pageSize;
  return { items: MOCK_FORUM_TOPICS.slice(start, start + pageSize), total: MOCK_FORUM_TOPICS.length };
}
