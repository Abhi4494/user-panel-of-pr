import { Link } from '@/components/ui/Link';
import { getNotifications } from '@/features/dashboard/api/getNotifications';
import { useAsync } from '@/hooks/useAsync';
import { timeAgo } from '@/lib/timeAgo';

const note = 'px-5 py-6 text-center text-sm text-dash-subtle';

/** The rows inside the popover. Mounted on first open, so the request is only made when someone looks. */
export function NotificationsList({ onNavigate }: { onNavigate: () => void }) {
  const { data, error } = useAsync(getNotifications, { pageLoader: false });

  if (error) {
    return (
      <p role="alert" className={note}>
        We couldn&apos;t load your notifications right now.
      </p>
    );
  }
  if (!data) {
    return (
      <p aria-busy="true" className={note}>
        Loading…
      </p>
    );
  }
  if (!data.length) return <p className={note}>You&apos;re all caught up.</p>;

  return (
    <ul className="grid grid-cols-1">
      {data.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className="block px-5 py-3.5 transition-colors hover:bg-dash-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
          >
            <span className="block text-list-row leading-snug font-light text-dash-ink">{item.message}</span>
            <time dateTime={item.createdAt} className="mt-0.5 block text-caption text-dash-subtle">
              {timeAgo(item.createdAt)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
