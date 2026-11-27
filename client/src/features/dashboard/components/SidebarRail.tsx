import { WEBSITE_HOME_URL } from '@/lib/websiteUrl';
import { Link } from '@/components/ui/Link';
import { railItems } from '@/features/dashboard/data/navigation';
import { UserMenu } from '@/features/dashboard/components/UserMenu';

interface SidebarRailProps {
  activeId: string;
  searchOpen: boolean;
  /** The Search item opens the product search panel instead of navigating. */
  onOpenSearch: () => void;
}

/**
 * Narrow icon column: brand mark, primary sections, and the user's avatar. Items are 64px tall with 7px uppercase
 * captions and a 3px bar on the active one, matching the live dashboard (tokens `text-rail-label`, `dash-nav-*`).
 * The rail is 80px wide including a 1px right border (`dash-divider`, #ededed on the live site); the sidebar itself has no outer border.
 */
export function SidebarRail({ activeId, searchOpen, onOpenSearch }: SidebarRailProps) {
  return (
    <div className="relative flex w-rail shrink-0 flex-col items-center border-r border-dash-divider bg-dash-rail py-4">
      {/* Brand mark goes back to the public website (full page load: it is a different app). */}
      <a href={WEBSITE_HOME_URL} aria-label="Back to website" className="mb-3 rounded-full focus-visible:outline-2 focus-visible:outline-dash-accent">
        <img src="/fav.svg" alt="" className="size-9" />
      </a>

      <nav aria-label="Primary" className="flex w-full flex-1 flex-col overflow-y-auto scrollbar-none">
        {railItems.map(({ id, label, href, icon: Icon }) => {
          const isSearch = id === 'search';
          const active = isSearch ? searchOpen : id === activeId;
          const itemClass = `relative flex h-16 shrink-0 flex-col items-center justify-center gap-1.5 px-1 text-center text-rail-label font-bold tracking-wide uppercase transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-dash-accent ${
                active ? 'text-dash-nav-active' : 'text-dash-nav-idle hover:text-dash-nav-active'
              }`;
          const content = (
            <>
              {active && <span aria-hidden className="absolute inset-y-0 left-0 w-0.75 bg-dash-nav-active" />}
              <Icon size={20} aria-hidden className={active ? '' : 'text-dash-nav-icon'} />
              <span>{label}</span>
            </>
          );
          return isSearch ? (
            <button key={id} type="button" aria-haspopup="dialog" aria-expanded={searchOpen} onClick={onOpenSearch} className={`${itemClass} w-full`}>
              {content}
            </button>
          ) : (
            <Link key={id} href={href} aria-current={active ? 'page' : undefined} className={itemClass}>
              {content}
            </Link>
          );
        })}
      </nav>

      <UserMenu />
    </div>
  );
}
