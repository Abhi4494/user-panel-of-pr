import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { Link } from '@/components/ui/Link';
import { showToast } from '@/components/ui/Toaster';
import { logout } from '@/features/dashboard/api/logout';
import { useCurrentUser } from '@/features/dashboard/CurrentUserContext';
import { UserAvatar } from '@/features/dashboard/components/UserAvatar';
import { userMenuItems } from '@/features/dashboard/data/navigation';
import { navigate } from '@/router';

/**
 * Avatar button at the bottom of the rail; opens the account popover (profile summary, account links, Logout).
 * Anchored to the rail (it must be `relative`), opening to its right. Closes on outside click, Esc and navigation.
 */
export function UserMenu() {
  const { data: user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/account/login');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Unable to log out.');
    } finally {
      setIsLoggingOut(false);
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="mt-2">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
      >
        <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} online className="size-10" />
      </button>

      {open && (
        <div role="dialog" aria-label="Account" className="absolute bottom-4 left-full z-50 ml-2 w-68 overflow-hidden rounded-lg border border-dash-line bg-dash-surface shadow-card">
          <div className="flex items-center gap-4 bg-dash-rail px-5 py-5">
            <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} className="size-14" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-dash-text">{user?.name}</p>
              {user?.roleLabel && <p className="text-eyebrow font-medium tracking-wide text-dash-faint uppercase">{user.roleLabel}</p>}
            </div>
          </div>

          <ul>
            {userMenuItems.map(({ id, label, href, icon: Icon, description }) => (
              <li key={id} className="border-t border-dash-line">
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-dash-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent"
                >
                  <Icon size={20} aria-hidden className="shrink-0 text-dash-muted" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-dash-text">{label}</span>
                    {description && <span className="block text-caption text-dash-faint">{description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-dash-line p-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-dash-hero text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent disabled:opacity-60"
            >
              <LogOut size={16} aria-hidden />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
