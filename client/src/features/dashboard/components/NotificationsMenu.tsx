import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getUnreadNotificationCount } from '@/features/dashboard/api/getUnreadNotificationCount';
import { NotificationsList } from '@/features/dashboard/components/NotificationsList';
import { topBarButton } from '@/features/dashboard/components/topBarStyles';
import { useAsync } from '@/hooks/useAsync';

/**
 * Bell on the navy header with its popover: a white card under the bell listing the latest notifications. It fades and slides
 * in (always mounted, so it can animate), closes on outside click, Esc and when a row is opened. The red dot disappears once opened.
 * TODO(backend): mark the notifications as read when the popover opens (see `getNotifications`).
 */
export function NotificationsMenu() {
  const { data: unread = 0 } = useAsync(getUnreadNotificationCount, { pageLoader: false });
  const [open, setOpen] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const showDot = unread > 0 && !everOpened;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setEverOpened(true);
        }}
        aria-label={showDot ? `Notifications (${unread} unread)` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${topBarButton} ${open ? 'bg-white! text-dash-subtle!' : ''}`}
      >
        <Bell size={18} aria-hidden />
        {showDot && <span aria-hidden className="absolute top-1.5 right-2 size-2 rounded-full bg-alert" />}
      </button>

      <div
        role="dialog"
        aria-label="Notifications"
        aria-hidden={!open}
        className={`absolute top-full right-0 z-40 mt-3 w-72 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-lg border border-dash-line bg-dash-surface text-dash-text shadow-card transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0'
        }`}
      >
        <p className="border-b border-dash-line px-5 py-3.5 text-eyebrow font-semibold tracking-widest text-dash-subtle uppercase">Notifications</p>
        <div className="scrollbar-soft max-h-[min(30rem,calc(100dvh-8rem))] overflow-y-auto">{everOpened && <NotificationsList onNavigate={() => setOpen(false)} />}</div>
      </div>
    </div>
  );
}
