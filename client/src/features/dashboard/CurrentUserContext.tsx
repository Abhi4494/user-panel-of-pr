import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAsync, type AsyncState } from '@/hooks/useAsync';
import { UnauthorizedError } from '@/features/auth/api/UnauthorizedError';
import { getCurrentUser } from '@/features/dashboard/api/getCurrentUser';
import type { DashboardUser } from '@/features/dashboard/types';
import { navigate } from '@/router';

type CurrentUser = AsyncState<DashboardUser> & {
  /** Loads the user again (e.g. after the profile was edited) without covering the page with the loader. */
  reload: () => void;
};

const CurrentUserContext = createContext<CurrentUser | null>(null);

/**
 * Loads the signed-in user once for the whole dashboard shell (sidebar avatar, welcome banner, ...). It doubles as the
 * session guard: no valid session cookie means the user is sent to the login screen.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  // `version` is only there to give `load` a new identity: useAsync then fetches again (keeping the old data meanwhile).
  // The full-page loader is for the first load only.
  const load = useCallback(() => getCurrentUser(), [version]);
  const state = useAsync(load, { pageLoader: version === 0 });
  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const value = useMemo(() => ({ ...state, reload }), [state, reload]);
  const isSignedOut = state.error instanceof UnauthorizedError;

  useEffect(() => {
    if (isSignedOut) navigate('/account/login');
  }, [isSignedOut]);

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const state = useContext(CurrentUserContext);
  if (!state) throw new Error('useCurrentUser must be used inside <CurrentUserProvider>');
  return state;
}
