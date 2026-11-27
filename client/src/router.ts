import { useMemo, useSyncExternalStore } from 'react';

/**
 * Minimal client-side navigation (History API). Keeps the page shell mounted between screens so there is no
 * full reload, font swap or particle restart. Replace with a router library only if routing needs grow
 * (nested routes, data loading).
 */
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

/** Normalised current path: lower-case, no trailing slash ("/" stays "/"). The query string is not part of it. */
function currentPath() {
  return window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
}

const currentSearch = () => window.location.search;

/** Go to `to` (path + optional query) with a new history entry. Navigating to the exact current URL does nothing. */
export function navigate(to: string) {
  const target = new URL(to, window.location.origin);
  if (target.pathname === window.location.pathname && target.search === window.location.search) return;
  window.history.pushState(null, '', to);
  window.scrollTo(0, 0);
  notify();
}

/** Update the URL in place (no new history entry, no scroll jump): for filters/search that should stay shareable. */
export function replace(to: string) {
  window.history.replaceState(null, '', to);
  notify();
}

export function usePath() {
  return useSyncExternalStore(subscribe, currentPath);
}

/** The current query string as `URLSearchParams` (re-renders when it changes). */
export function useSearch() {
  const search = useSyncExternalStore(subscribe, currentSearch);
  return useMemo(() => new URLSearchParams(search), [search]);
}
