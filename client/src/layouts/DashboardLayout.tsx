import { X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PageLoader } from '@/components/ui/PageLoader';
import { ProductSearchPanel } from '@/features/product-search/components/ProductSearchPanel';
import { ProductSearchContext, type SearchPreset } from '@/features/product-search/ProductSearchContext';
import { MIN_SEARCH_LENGTH } from '@/features/product-search/components/SearchColumns';
import { CurrentUserProvider } from '@/features/dashboard/CurrentUserContext';
import { SidebarMenu } from '@/features/dashboard/components/SidebarMenu';
import { SidebarRail } from '@/features/dashboard/components/SidebarRail';
import { TopBar } from '@/features/dashboard/components/TopBar';
import { findActiveRailId } from '@/features/dashboard/data/navigation';
import { usePageLoader } from '@/hooks/usePageLoader';
import { HeroCurve } from '@/layouts/HeroCurve';
import { PageTitleContext } from '@/layouts/PageTitleContext';

interface DashboardLayoutProps {
  /** Normalised current path (drives the active sidebar item). */
  path: string;
  /** Top-bar title. */
  title: string;
  /** Show the title to screen readers only (the page draws its own visible heading on the navy header). */
  hideTitle?: boolean;
  /** Text/greeting shown on the navy header under the top bar (white on navy). Optional. */
  intro?: ReactNode;
  /** Height of the navy header: `tall` for content-heavy pages (Price Trends). */
  heroSize?: 'compact' | 'tall';
  children: ReactNode;
}

/**
 * Logged-in shell: icon rail + menu panel + top bar. lg+: sidebar is sticky and the menu panel can be collapsed
 * to the rail. Below the `nav` breakpoint (1024px): the sidebar is an off-canvas drawer opened from the top bar (closes on navigation, Esc, overlay).
 * Every navigation (and the first load) covers the right-hand column with the pulsing-circle `PageLoader` until the new
 * screen's data has arrived, like the live dashboard; the sidebar stays visible and usable.
 */
export function DashboardLayout({ path, title, hideTitle, intro, heroSize, children }: DashboardLayoutProps) {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchPreset, setSearchPreset] = useState<SearchPreset>();
  const [titleOverride, setTitleOverride] = useState<string>();
  const activeId = findActiveRailId(path);
  const loading = usePageLoader(path);

  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
    setSearchText('');
  }, [path]);

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const searchControls = useMemo(
    () => ({
      openWithIndustry: (industryId: string) => {
        setSearchText('');
        setSearchPreset((current) => ({ industryId, nonce: (current?.nonce ?? 0) + 1 }));
        setSearchOpen(true);
      },
    }),
    [],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <CurrentUserProvider>
      <ProductSearchContext.Provider value={searchControls}>
      <PageTitleContext.Provider value={setTitleOverride}>
      <div className="flex min-h-dvh bg-dash-bg font-sans text-dash-text dark:scheme-dark">
        {drawerOpen && <div aria-hidden onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-30 bg-ink/50 nav:hidden" />}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex max-w-[90vw] transition-[translate,visibility] duration-200 motion-reduce:transition-none nav:sticky nav:top-0 nav:z-30 nav:h-dvh nav:max-w-none nav:translate-x-0 nav:visible ${
            drawerOpen ? 'translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          {/* Below lg the sidebar is a drawer: a close button in its top-right corner (besides the overlay and Esc). */}
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full text-dash-subtle transition-colors hover:bg-dash-panel-soft hover:text-dash-strong focus-visible:outline-2 focus-visible:outline-dash-accent nav:hidden"
          >
            <X size={18} aria-hidden />
          </button>
          <SidebarRail
            activeId={activeId}
            searchOpen={searchOpen}
            onOpenSearch={() => {
              setDrawerOpen(false);
              setSearchOpen(true);
            }}
          />
          {/*
            The menu panel collapses by animating its width (lg+), so the page glides instead of snapping. SidebarMenu keeps
            its own fixed width inside, so its text never re-wraps mid-animation; `visibility` flips at the end of the
            transition, which also removes the hidden links from the tab order. Below lg this is the drawer: always full width.
          */}
          <div
            className={`flex min-h-0 w-menu overflow-hidden transition-[width,visibility] duration-300 ease-in-out motion-reduce:transition-none ${
              menuCollapsed ? 'nav:invisible nav:w-0' : ''
            }`}
          >
            <SidebarMenu activeId={activeId} path={path} />
          </div>
        </aside>

        <div className="relative isolate flex min-w-0 flex-1 flex-col">
          {/* Shared navy header with the curved bottom edge; the top bar and `intro` sit on it, page content overlaps it. */}
          <HeroCurve size={heroSize} />
          <TopBar
            title={titleOverride ?? title}
            hideTitle={hideTitle}
            menuCollapsed={menuCollapsed}
            onToggleMenu={() => setMenuCollapsed((collapsed) => !collapsed)}
            drawerOpen={drawerOpen}
            onOpenDrawer={() => setDrawerOpen(true)}
            searchText={searchText}
            onSearchTextChange={(text) => {
              setSearchText(text);
              if (text.trim().length >= MIN_SEARCH_LENGTH) setSearchOpen(true); // from 3 typed letters the product search opens with the matches
            }}
            onSearchSubmit={() => setSearchOpen(true)}
          />
          <main aria-busy={loading} className="flex-1 px-4 pb-8 sm:px-6 lg:px-8">
            {/* With a greeting the content overlaps the curve further down; without one it starts right under the top bar. */}
            {intro && <div className="min-h-20 pt-2 text-white">{intro}</div>}
            <div className={intro ? 'mt-11' : 'mt-4'}>{children}</div>
          </main>
          <PageLoader visible={loading} />
        </div>
        <ProductSearchPanel open={searchOpen} onClose={closeSearch} text={searchText} onTextChange={setSearchText} preset={searchPreset} />
      </div>
      </PageTitleContext.Provider>
      </ProductSearchContext.Provider>
    </CurrentUserProvider>
  );
}
