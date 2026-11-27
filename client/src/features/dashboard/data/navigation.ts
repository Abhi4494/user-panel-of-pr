// Library, MessageSquare and Cpu are the icons of the hidden Library / Forums / Cost Models items below.
import { Activity, BookOpen, ChartColumn, CircleHelp, House, Lock, PanelsTopLeft, Search, Settings, User } from 'lucide-react';
import type { MenuSection, RailItem, UserMenuItem } from '@/features/dashboard/types';

/** Rows of the account popover opened from the avatar (hrefs are placeholders until those screens exist). */
export const userMenuItems: UserMenuItem[] = [
  { id: 'help', label: 'Help Center', href: '/dashboard/helpcenter', icon: CircleHelp },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { id: 'password', label: 'Change Password', href: '/dashboard/change-password', icon: Lock },
  { id: 'profile', label: 'Profile', href: '/dashboard/profile', icon: User, description: 'View your profile' },
  { id: 'subscription', label: 'Manage Subscription', href: '/dashboard/managesubscription', icon: PanelsTopLeft, description: 'Request for products' },
];

/**
 * Sidebar structure. Static for now; hrefs are placeholders until each screen is migrated
 * (unknown dashboard paths render `ComingSoonPage`).
 * TODO(backend): if menus must depend on the user's plan/permissions, serve this from the API and keep these types.
 */
export const railItems: RailItem[] = [
  { id: 'home', label: 'Home', menuTitle: 'Dashboard', href: '/dashboard/index', pathPrefixes: ['/dashboard/my-dashboard', '/dashboard/my-alerts'], icon: House },
  { id: 'price-trends', label: 'Price Trends', href: '/dashboard/pricetrend', pathPrefixes: ['/price-trend-dashboard', '/dashboard/saved-graphs'], icon: Activity },
  {
    id: 'production-cost',
    label: 'Production Cost Report',
    menuTitle: 'Production Cost',
    href: '/dashboard/pcrdashboard',
    pathPrefixes: ['/dashboard/loadallpcrreport', '/dashboard/pcrreport'], // the all-reports list and a single report stay under this item
    icon: ChartColumn,
  },
  {
    id: 'reports',
    label: 'Reports',
    menuTitle: 'Reports',
    href: '/dashboard/mrrdashboard',
    pathPrefixes: ['/dashboard/loadallmrrreport', '/dashboard/mrrreport', '/dashboard/newsarticles'], // the reports list, a single report and the news stay under this item
    icon: BookOpen,
  },
  // Hidden for now (screens not needed yet). To bring them back, uncomment and re-add the icons to the lucide-react import.
  // { id: 'library', label: 'Library', menuTitle: 'Reports', href: '/dashboard/livereportdashboard', pathPrefixes: ['/dashboard/livereport', '/dashboard/livereportdetail'], icon: Library },
  // { id: 'forums', label: 'Forums', menuTitle: 'Discussion Forums', href: '/dashboard/discussionforum', icon: MessageSquare },
  // { id: 'cost-models', label: 'Cost Models', href: '/dashboard/costmodels', pathPrefixes: ['/costmodel'], icon: Cpu },
  { id: 'search', label: 'Search', href: '/dashboard/search', icon: Search },
];

const reportKinds = [
  { label: 'Industry Reports', slug: 'industry-reports' },
  { label: 'Production Cost Reports', slug: 'production-cost-reports' },
  { label: 'Strategy Reports', slug: 'strategy-reports' },
];

/** Secondary menu per rail item. A rail item without an entry shows just itself (see `menuFor`). */
const menus: Record<string, MenuSection[]> = {
  home: [
    { links: [{ label: 'Home', href: '/dashboard/index' }] },
    {
      title: 'Custom Dashboard',
      links: [
        { label: 'My Dashboard', href: '/dashboard/my-dashboard' },
        { label: 'My Alerts', href: '/dashboard/my-alerts' },
      ],
    },
    { title: 'My Purchases', links: reportKinds.map(({ label, slug }) => ({ label, href: `/dashboard/purchases/${slug}` })) },
    { title: 'My Subscriptions', links: reportKinds.map(({ label, slug }) => ({ label, href: `/dashboard/subscriptions/${slug}` })) },
  ],
  'price-trends': [{ links: [{ label: 'Price Trends Dashboard', href: '/dashboard/pricetrend' }, { label: 'Graph Library', href: '/dashboard/saved-graphs' }] }],
  'production-cost': [{ links: [{ label: 'PCR Dashboard', href: '/dashboard/pcrdashboard' }] }],
  reports: [], // production's "Reports" menu panel has a header only, no links
  forums: [{ links: [{ label: 'Discussion Forums', href: '/dashboard/discussionforum' }] }],
  library: [], // production shows the same header-only "Reports" panel on the Library screen
};

export function menuFor(railId: string): MenuSection[] {
  const item = railItems.find((candidate) => candidate.id === railId);
  return menus[railId] ?? (item ? [{ links: [{ label: item.label, href: item.href }] }] : []);
}

/** Rail item that owns `path` (its own href or one of its menu links); falls back to Home. */
export function findActiveRailId(path: string): string {
  const owner = railItems.find(
    (item) =>
      item.href === path ||
      path.startsWith(`${item.href}/`) || // sub-screens of the item's own URL keep it active
      (item.pathPrefixes ?? []).some((root) => path === root || path.startsWith(`${root}/`)) || // e.g. /price-trend-dashboard/<slug>
      menuFor(item.id).some((section) => section.links.some((link) => link.href === path)),
  );
  return owner?.id ?? 'home';
}

/** Human label for a path, used as the top-bar title for screens that are not built yet. */
export function findNavLabel(path: string): string | undefined {
  const accountItem = userMenuItems.find((item) => item.href === path);
  if (accountItem) return accountItem.label;
  for (const item of railItems) {
    if (item.href === path) return item.label;
    for (const section of menuFor(item.id)) {
      const link = section.links.find((candidate) => candidate.href === path);
      if (link) return link.label;
    }
  }
  return undefined;
}
