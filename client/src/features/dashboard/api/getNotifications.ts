import type { DashboardNotification } from '@/features/dashboard/types';

const monthsAgo = (months: number) => new Date(Date.now() - months * 30.5 * 24 * 3600 * 1000).toISOString();

/**
 * The latest notifications for the bell popover, newest first.
 *
 * MOCK DATA: the copy and ages come from the reference screenshot.
 * TODO(backend): replace with `GET /api/dashboard/notifications` -> `DashboardNotification[]` (newest first, paged if long) and mark them
 * read with `POST /api/dashboard/notifications/read` when the popover opens. Keep the signature.
 */
export async function getNotifications(): Promise<DashboardNotification[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const article = (id: string, message: string, months: number): DashboardNotification => ({ id, message, createdAt: monthsAgo(months), href: '/dashboard/newsarticles' });
  return [
    article('n6', 'Procurement Resource added a new article. Have a look!', 8),
    article('n5', 'Procurement Resource added a new article. Have a look!', 9),
    article('n4', 'Procurement Resource added a new article. Have a look!', 9),
    article('n3', 'Procurement Resource added a new article. Have a look!', 9),
    article('n2', 'Procurement Resource update a article. Have a look!', 9),
    article('n1', 'Procurement Resource update a article. Have a look!', 9),
  ];
}
