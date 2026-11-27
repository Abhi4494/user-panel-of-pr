/**
 * Number of unread notifications (drives the red dot on the bell).
 *
 * TODO(backend): replace the mock with `GET /api/dashboard/notifications/unread-count` -> `{ count: number }`
 * and return `count`. Keep the signature.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return 1;
}
