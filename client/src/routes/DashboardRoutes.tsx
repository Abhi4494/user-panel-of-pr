import type { ComponentType } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { findNavLabel } from '@/features/dashboard/data/navigation';
import { WelcomeHeader } from '@/features/dashboard/components/WelcomeHeader';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { CostModelsPage } from '@/pages/CostModelsPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ForumPage } from '@/pages/ForumPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { ManageSubscriptionPage } from '@/pages/ManageSubscriptionPage';
import { MyAlertsPage } from '@/pages/MyAlertsPage';
import { MyReportsPage } from '@/pages/MyReportsPage';
import { MrrDashboardPage } from '@/pages/MrrDashboardPage';
import { MrrReportsPage } from '@/pages/MrrReportsPage';
import { PcrDashboardPage } from '@/pages/PcrDashboardPage';
import { PcrReportsPage } from '@/pages/PcrReportsPage';
import { PriceTrendsPage } from '@/pages/PriceTrendsPage';
import { ProductGraphPage } from '@/pages/ProductGraphPage';
import { SavedGraphsPage } from '@/pages/SavedGraphsPage';
import { SavedGraphViewPage } from '@/pages/SavedGraphViewPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { UpdateCostModelPage } from '@/pages/UpdateCostModelPage';
import { useSearch } from '@/router';
import type { RouteParams, RouteProps } from '@/routes/routeTypes';

interface DashboardRoute {
  key: string;
  title: string;
  /** Show `title` to screen readers only: the page draws its own visible heading on the navy header. */
  hideTitle?: boolean;
  /** Optional greeting/summary shown on the navy header (white on navy). */
  Intro?: ComponentType;
  /** Navy header height; `tall` for content-heavy pages. */
  heroSize?: 'compact' | 'tall';
  Page: ComponentType<RouteProps>;
}

const home: DashboardRoute = { key: 'index', title: 'Dashboard', Intro: WelcomeHeader, Page: DashboardPage };
const priceTrends: DashboardRoute = { key: 'pricetrend', title: 'Price Trends Dashboard', heroSize: 'tall', Page: PriceTrendsPage };
const productGraph: DashboardRoute = { key: 'product-graph', title: 'Product Graph', heroSize: 'tall', Page: ProductGraphPage };
const pcrDashboard: DashboardRoute = { key: 'pcrdashboard', title: 'Production Cost Report Dashboard', heroSize: 'tall', Page: PcrDashboardPage };
const mrrDashboard: DashboardRoute = { key: 'mrrdashboard', title: 'Industry Reports Dashboard', heroSize: 'tall', Page: MrrDashboardPage };
const library: DashboardRoute = { key: 'livereportdashboard', title: 'Live Report Dashboard', heroSize: 'tall', Page: LibraryPage };
const forum: DashboardRoute = { key: 'discussionforum', title: 'Discussion Forum', heroSize: 'tall', Page: ForumPage };
const costModels: DashboardRoute = { key: 'costmodels', title: 'Cost Models', heroSize: 'tall', Page: CostModelsPage };
const updateCostModel: DashboardRoute = { key: 'updatecostmodel', title: 'Add Cost Models', heroSize: 'tall', Page: UpdateCostModelPage };
const mrrReports: DashboardRoute = { key: 'loadallmrrreport', title: 'All Industry Reports', hideTitle: true, heroSize: 'tall', Page: MrrReportsPage };
const pcrReports: DashboardRoute = { key: 'loadallpcrreport', title: 'All Production Cost Reports', hideTitle: true, heroSize: 'tall', Page: PcrReportsPage };
const changePassword: DashboardRoute = { key: 'change-password', title: 'Change Password', Page: ChangePasswordPage };
const myAlerts: DashboardRoute = { key: 'my-alerts', title: 'My Alerts', heroSize: 'tall', Page: MyAlertsPage };
const savedGraphs: DashboardRoute = { key: 'saved-graphs', title: 'Graph Library', heroSize: 'tall', Page: SavedGraphsPage };
const myDashboard: DashboardRoute = { key: 'my-dashboard', title: 'Graph Library', heroSize: 'tall', Page: SavedGraphsPage };
const savedGraphView: DashboardRoute = { key: 'saved-graph-view', title: 'Saved Trend', heroSize: 'tall', Page: SavedGraphViewPage };
const profile: DashboardRoute = { key: 'profile', title: 'Profile', Page: ProfilePage };
const myReports: DashboardRoute = { key: 'my-reports', title: 'My Reports', heroSize: 'tall', Page: MyReportsPage };
const manageSubscription: DashboardRoute ={ key: 'managesubscription', title: 'Manage Subscriptions', heroSize: 'tall', Page: ManageSubscriptionPage };

/**
 * Logged-in screens. New screen = page component in `src/pages` + a row here (+ its links in
 * `features/dashboard/data/navigation.ts`). Unlisted dashboard paths show `ComingSoonPage`.
 * Pages also get the URL's query string (`query`), e.g. `/dashboard/loadallpcrreport?categoryId=1`.
 * The session guard lives in `CurrentUserProvider` (rendered by `DashboardLayout`): a 401 sends the user to /account/login.
 */
const routes: Record<string, DashboardRoute> = {
  '/dashboard': home,
  '/dashboard/index': home,
  '/dashboard/pricetrend': priceTrends,
  '/dashboard/mrrdashboard': mrrDashboard,
  '/dashboard/loadallmrrreport': mrrReports,
  '/dashboard/livereportdashboard': library,
  '/dashboard/discussionforum': forum,
  '/dashboard/costmodels': costModels,
  '/dashboard/pcrdashboard': pcrDashboard,
  '/dashboard/loadallpcrreport': pcrReports,
  '/dashboard/change-password': changePassword,
  '/dashboard/my-alerts': myAlerts,
  '/dashboard/saved-graphs': savedGraphs,
  '/dashboard/my-dashboard': myDashboard,
  '/dashboard/profile': profile,
  '/dashboard/managesubscription': manageSubscription,
};

/** Paths with a variable part. Capture groups are passed to the page as the named `params`, in order. */
const dynamicRoutes: Array<{ pattern: RegExp; params: string[]; route: DashboardRoute }> = [
  { pattern: /^\/price-trend-dashboard\/([^/]+)$/, params: ['slug'], route: productGraph },
  { pattern: /^\/costmodel\/updatecostmodel\/([^/]+)$/, params: ['id'], route: updateCostModel }, // production serves this outside /dashboard
  { pattern: /^\/price-trend-dashboard\/([^/]+)\/([^/]+)$/, params: ['slug', 'location'], route: productGraph }, // from the search panel
  { pattern: /^\/dashboard\/savedgraph\/([^/]+)$/, params: ['id'], route: savedGraphView },
  // The sidebar's My Purchases / My Subscriptions lists: /dashboard/purchases/industry-reports, /dashboard/subscriptions/strategy-reports, ...
  { pattern: /^\/dashboard\/(purchases|subscriptions)\/([^/]+)$/, params: ['group', 'kind'], route: myReports },
];

/** The old .NET addresses of the same six lists (still linked from the report dashboards). */
const myReportAliases: Record<string, RouteParams> = {
  '/dashboard/myreport': { group: 'purchases', kind: 'industry-reports' },
  '/dashboard/mypcreport': { group: 'purchases', kind: 'production-cost-reports' },
  '/dashboard/mylivereport': { group: 'purchases', kind: 'strategy-reports' },
  '/dashboard/mysubscribereport': { group: 'subscriptions', kind: 'industry-reports' },
  '/dashboard/mysubscribepcreport': { group: 'subscriptions', kind: 'production-cost-reports' },
  '/dashboard/mysubscribelivereport': { group: 'subscriptions', kind: 'strategy-reports' },
};

/** URL roots that render inside the dashboard shell (the live site also serves screens outside `/dashboard`). */
const DASHBOARD_ROOTS = ['/dashboard', '/price-trend-dashboard', '/costmodel'];

export const isDashboardPath = (path: string) => DASHBOARD_ROOTS.some((root) => path === root || path.startsWith(`${root}/`));

function resolve(path: string): { route?: DashboardRoute; params: RouteParams } {
  const exact = routes[path];
  if (exact) return { route: exact, params: {} };
  const alias = myReportAliases[path];
  if (alias) return { route: myReports, params: alias };
  for (const { pattern, params, route } of dynamicRoutes) {
    const match = pattern.exec(path);
    if (match) return { route, params: Object.fromEntries(params.map((name, index) => [name, decodeURIComponent(match[index + 1])])) };
  }
  return { params: {} };
}

/** One persistent shell; only the page content swaps (with a fade), like the auth screens. */
export function DashboardRoutes({ path }: { path: string }) {
  const { route, params } = resolve(path);
  const query = useSearch();
  const title = route?.title ?? findNavLabel(path) ?? 'Dashboard';
  const Page = route?.Page ?? ComingSoonPage;

  return (
    <DashboardLayout
      path={path}
      title={title}
      hideTitle={route?.hideTitle}
      heroSize={route?.heroSize}
      intro={
        route?.Intro && (
          <FadeIn key={route.key}>
            <route.Intro />
          </FadeIn>
        )
      }
    >
      {/* Keyed by path for dynamic routes, so moving between two products remounts (fresh data, fresh chart window).
          The query string is deliberately not part of the key: filters change in place (see PcrReportsPage). */}
      <FadeIn key={route && !Object.keys(params).length ? route.key : path}>
        <Page params={params} query={query} />
      </FadeIn>
    </DashboardLayout>
  );
}
