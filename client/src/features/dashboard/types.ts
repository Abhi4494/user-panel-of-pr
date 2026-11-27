import type { LucideIcon } from 'lucide-react';

/* ---------- API contracts (what the backend returns; see docs/architecture.md) ---------- */

/** GET /api/dashboard/me */
export interface DashboardUser {
  id: string;
  name: string;
  avatarUrl?: string;
  /** Small label under the name in the account menu, e.g. "Customer". */
  roleLabel?: string;
}

/** One headline figure on the dashboard home. `id` selects the icon/colour in `components/statVisuals.ts`. */
export interface DashboardStat {
  id: string;
  title: string;
  count: number;
  /** Noun shown after the count, e.g. "Reports", "Products". */
  unit: string;
  /** Where the card links to (internal path). */
  href: string;
}

/** GET /api/dashboard/summary */
export interface DashboardSummary {
  stats: DashboardStat[];
}

/* ---------- Navigation config (front-end owned, see data/navigation.ts) ---------- */

export interface RailItem {
  id: string;
  label: string;
  /** Title of the menu panel when this item is selected; defaults to `label`. */
  menuTitle?: string;
  /** Extra URL roots that belong to this item (e.g. `/price-trend-dashboard`), so it stays active on those screens. */
  pathPrefixes?: string[];
  href: string;
  icon: LucideIcon;
}

/** A row in the account popover (avatar menu). */
export interface UserMenuItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional second line under the label. */
  description?: string;
}

export interface MenuLink {
  label: string;
  href: string;
}

export interface MenuSection {
  /** Small section label; omit for an untitled group. */
  title?: string;
  links: MenuLink[];
}

/** One row of the bell's notifications popover. */
export interface DashboardNotification {
  id: string;
  message: string;
  /** When it happened, ISO timestamp (shown as "8 months ago"). */
  createdAt: string;
  /** Internal path the row opens (e.g. the new article). */
  href: string;
}
