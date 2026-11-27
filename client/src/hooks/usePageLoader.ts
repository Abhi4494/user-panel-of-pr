import { useEffect, useState } from 'react';
import { usePendingLoads } from '@/hooks/pendingLoads';

/**
 * Shortest time the loader stays up after a navigation (and on first load), so a fast screen does not flash the overlay
 * for a few frames. 800 ms is the shortest loader seen in the reference recording (it ran 0.8 to 1.5 s), long enough for
 * the circle to finish shrinking and start growing again, which is how it looks on the live site. Lower it if it feels slow.
 */
export const LOADER_MIN_MS = 800;

/**
 * Whether the page loader should be showing: from the moment `path` changes (the same render, so the new screen is never
 * visible for a frame first) until the minimum time has passed AND every data request of the new screen has settled.
 */
export function usePageLoader(path: string): boolean {
  const pending = usePendingLoads();
  const [lastPath, setLastPath] = useState(path);
  const [held, setHeld] = useState(true);

  if (path !== lastPath) {
    // Derived state: flips during render so the overlay is part of the very first frame of the new route.
    setLastPath(path);
    setHeld(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => setHeld(false), LOADER_MIN_MS);
    return () => clearTimeout(timer);
  }, [path]);

  return held || pending > 0;
}
