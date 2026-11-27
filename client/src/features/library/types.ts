import type { MrrOverview } from '@/features/mrr/types';

/** GET /api/library/overview: the same shape as the Industry Reports overview, for the user's own library. */
export type LibraryOverview = Pick<MrrOverview, 'totals' | 'trending' | 'latestReports' | 'news'>;
