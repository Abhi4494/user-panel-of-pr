/* ---------- API contracts (see docs/architecture.md) ---------- */

/** One question card on the Discussion Forum screen. */
export interface ForumTopic {
  id: string;
  /** Pink chip: the product/topic the question is about (e.g. "Coal"). */
  tag: string;
  /** Bold card title. */
  title: string;
  /** The question text. */
  question: string;
  /** Publication day, ISO `YYYY-MM-DD`. */
  publishedAt: string;
  /** Navy pill: the industry category name. */
  categoryName: string;
  /** Who answered / asked; empty on most cards (a silhouette is drawn). */
  author?: string;
  /** Internal path of the topic's own screen. */
  href: string;
}

export interface ForumListQuery {
  page: number;
  pageSize: number;
}

/** GET /api/forum/topics?page=&pageSize= */
export interface ForumListResult {
  items: ForumTopic[];
  total: number;
}
