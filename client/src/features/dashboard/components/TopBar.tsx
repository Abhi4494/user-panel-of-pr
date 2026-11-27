import { ChevronLeft, Menu, Search } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { NotificationsMenu } from '@/features/dashboard/components/NotificationsMenu';
import { ThemeToggle } from '@/features/dashboard/components/ThemeToggle';
import { topBarButton } from '@/features/dashboard/components/topBarStyles';
import { WEBSITE_HOME_URL } from '@/lib/websiteUrl';

interface TopBarProps {
  title: string;
  /** Keep the title for screen readers only (screens whose visible heading is part of the page, like the all-reports list). */
  hideTitle?: boolean;
  /** lg+: the secondary menu is hidden (rail only). */
  menuCollapsed: boolean;
  onToggleMenu: () => void;
  /** Below lg: the sidebar is a drawer. */
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  /** The header search field is the same search as the rail's Search panel: typing here opens it with this text. */
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onSearchSubmit: () => void;
}

/** Sits on the navy header (see DashboardLayout), so its controls are light-on-dark in both themes. */
export function TopBar({ title, hideTitle = false, menuCollapsed, onToggleMenu, drawerOpen, onOpenDrawer, searchText, onSearchTextChange, onSearchSubmit }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 text-white sm:gap-3 sm:px-6 lg:px-8">
      <button type="button" onClick={onOpenDrawer} aria-label="Open navigation" aria-expanded={drawerOpen} className={`${topBarButton} nav:hidden`}>
        <Menu size={20} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label={menuCollapsed ? 'Show menu' : 'Hide menu'}
        aria-expanded={!menuCollapsed}
        className={`${topBarButton} max-nav:hidden`}
      >
        {/* Same icons as the live site: hamburger when the menu is hidden, back chevron while it is open. */}
        {menuCollapsed ? <Menu size={20} aria-hidden /> : <ChevronLeft size={20} aria-hidden />}
      </button>

      <Heading level={1} size="title" className={`min-w-0 truncate text-white ${hideTitle ? 'sr-only' : ''}`}>
        {title}
      </Heading>

      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <a href={WEBSITE_HOME_URL} className="hidden px-2 text-sm whitespace-nowrap text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white md:inline">
          Back to Website
        </a>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
  className="relative hidden sm:block">
          <label htmlFor="dashboard-search" className="sr-only">
            Search
          </label>
          <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-dash-faint" />
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            autoComplete="off"
            className="h-9 w-40 rounded-lg bg-dash-surface pr-3 pl-9 text-sm text-dash-text placeholder:text-dash-faint focus-visible:outline-2 focus-visible:outline-white lg:w-44 2xl:w-64"
          />
        </form>

        <ThemeToggle />
        <NotificationsMenu />
      </div>
    </header>
  );
}
