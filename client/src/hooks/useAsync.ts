import { useEffect, useRef, useState } from 'react';
import { beginPendingLoad } from '@/hooks/pendingLoads';

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

interface UseAsyncOptions {
  /**
   * Whether this request keeps the dashboard's full-page loader up: `true` (default) every run, `'first'` only the first run
   * (use it for lists that refetch on filter/page changes, which should not cover the page again), `false` never.
   */
  pageLoader?: boolean | 'first';
}

/**
 * Runs `load` on mount and whenever it changes, and reports loading / data / error. `load` must be a stable reference
 * (a module-level api function, or `useCallback` over its inputs). When it changes, the previous data stays available while
 * the new request runs (`isLoading` is true), so lists don't blink empty; out-of-order responses are ignored.
 */
export function useAsync<T>(load: () => Promise<T>, { pageLoader = true }: UseAsyncOptions = {}): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, isLoading: true });
  const hasRun = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const track = pageLoader === true || (pageLoader === 'first' && !hasRun.current);
    hasRun.current = true;
    const finish = track ? beginPendingLoad() : () => undefined;
    setState((current) => (current.isLoading ? current : { ...current, error: undefined, isLoading: true }));
    load().then(
      (data) => {
        if (!cancelled) setState({ data, error: undefined, isLoading: false });
        finish();
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({ data: undefined, error: error instanceof Error ? error : new Error('Request failed'), isLoading: false });
        }
        finish();
      },
    );
    return () => {
      cancelled = true;
      finish();
    };
  }, [load, pageLoader]);

  return state;
}
