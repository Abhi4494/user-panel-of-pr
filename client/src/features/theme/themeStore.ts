import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pr-theme';
const listeners = new Set<() => void>();
let current: Theme = 'light';

function readInitial(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage blocked: fall through to the OS preference */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
  current = theme;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

/** Call once before the first render (main.tsx) so the saved/OS theme is applied with no flash. */
export function initTheme() {
  apply(readInitial());
}

export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* non-fatal: theme just won't persist */
  }
  apply(theme);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current theme plus a toggle. Colours are CSS variables (see `index.css`), so no component re-styles itself. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current);
  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}
