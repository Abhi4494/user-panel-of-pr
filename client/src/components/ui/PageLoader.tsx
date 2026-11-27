import { useEffect, useState } from 'react';

interface PageLoaderProps {
  visible: boolean;
}

/** Matches the ~0.4 s fade-out measured on the reference. */
const FADE_OUT_MS = 400;

/**
 * Covers its (positioned) parent with a flat grey surface and a pulsing white circle while a screen loads, like the live
 * dashboard: it appears instantly when navigation starts, then fades out over ~0.4 s to reveal the new screen. The circle is
 * centred in the visible part of the area (sticky, one viewport tall), so it stays in view on long pages. Under
 * `prefers-reduced-motion` the circle is static and the fade is instant.
 */
export function PageLoader({ visible }: PageLoaderProps) {
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true); // appear in the same render that asked for it

  useEffect(() => {
    if (visible || !mounted) return;
    const timer = setTimeout(() => setMounted(false), FADE_OUT_MS + 50);
    return () => clearTimeout(timer);
  }, [visible, mounted]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-label="Loading"
      // The transition lives only on the hidden state: showing is instant (a hard cut, as on the reference), hiding fades.
      className={`absolute inset-0 z-40 bg-dash-loader-bg ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0 transition-opacity duration-400 ease-in-out motion-reduce:transition-none'
      }`}
    >
      <div className="sticky top-0 grid h-dvh place-items-center">
        <span aria-hidden className="size-15 rounded-full bg-dash-loader-dot motion-safe:animate-loader-pulse" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
