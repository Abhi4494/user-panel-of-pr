import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode, type TransitionEvent } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface CarouselProps<T> {
  /** Accessible name of the region, e.g. "Industries". */
  label: string;
  items: T[];
  getKey: (item: T) => string | number;
  /**
   * Draws one slide. `clone` is true for the duplicated slides that make the loop seamless: they are decoration only,
   * so anything focusable inside must get `tabIndex={-1}` and `aria-hidden`.
   */
  renderItem: (item: T, clone: boolean) => ReactNode;
  /** Width of one slide (px) for the current viewport width, e.g. "ten across if they fit, never narrower than 96". */
  slideWidth: (viewportWidth: number) => number;
  /** Time between automatic steps; `false` turns autoplay off. */
  autoplayMs?: number | false;
  /** Tailwind classes that place the arrow buttons vertically (default: centred). */
  controlsClassName?: string;
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (listener: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

const SWIPE_PX = 40;
/** Duration of one slide animation (keep in sync with `duration-700` below). */
const SLIDE_MS = 700;

/**
 * Looping carousel: slides advance one at a time, automatically, and wrap around seamlessly (the first slides are duplicated at the
 * end, then the track jumps back without animation). It keeps moving even when every slide fits, so the strip always reads as a carousel.
 * Autoplay pauses while the pointer is over it, while anything inside has focus, while the tab is hidden, and through the
 * Pause button (WCAG 2.2.2); with `prefers-reduced-motion` there is no autoplay and steps are instant. Previous/Next buttons (shown on
 * hover/focus) and touch swipe move it by hand. Slides are laid out with `transform`, so it works at any width.
 */
export function Carousel<T>({ label, items, getKey, renderItem, slideWidth, autoplayMs = 3500, controlsClassName = 'top-1/2 -translate-y-1/2' }: CarouselProps<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const goBackAfterJump = useRef(false);
  const swipeStart = useRef<number | null>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);

  const count = items.length;
  const slide = width > 0 ? slideWidth(width) : 0;
  const cloneCount = slide > 0 ? Math.min(count, Math.ceil(width / slide) + 1) : 0;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // After a silent jump (animation off), turn the animation back on a couple of frames later; if we jumped to the end to
  // step backwards, start that step now.
  useEffect(() => {
    if (animate) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        setAnimate(true);
        if (goBackAfterJump.current) {
          goBackAfterJump.current = false;
          setIndex(count - 1);
        }
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [animate, count]);

  const next = useCallback(() => {
    if (reducedMotion) setIndex((current) => (current + 1) % count);
    else setIndex((current) => (current < count ? current + 1 : current)); // ignored while the loop is resetting
  }, [count, reducedMotion]);

  const previous = useCallback(() => {
    if (reducedMotion) {
      setIndex((current) => (current - 1 + count) % count);
    } else if (index === 0) {
      goBackAfterJump.current = true;
      setAnimate(false);
      setIndex(count);
    } else {
      setIndex((current) => current - 1);
    }
  }, [count, index, reducedMotion]);

  const paused = hovered || focused || userPaused || tabHidden || reducedMotion || autoplayMs === false || count < 2;
  useEffect(() => {
    if (paused) return; // `paused` already covers `autoplayMs === false`, so below it is a number
    const timer = setInterval(next, autoplayMs);
    return () => clearInterval(timer);
  }, [paused, autoplayMs, next]);

  // Once the track has slid onto the duplicated slides it is visually identical to the start: jump back there without animation.
  const resetLoop = useCallback(() => {
    setAnimate(false);
    setIndex((current) => (current >= count ? current - count : current));
  }, [count]);

  useEffect(() => {
    if (index < count || count === 0) return;
    // `transitionend` is the normal trigger, but it does not fire in every situation (background tab, interrupted transition),
    // and a carousel stuck on its clones would never move again, so a timer backs it up.
    const timer = setTimeout(resetLoop, SLIDE_MS + 150);
    return () => clearTimeout(timer);
  }, [index, count, resetLoop]);

  function onTransitionEnd(event: TransitionEvent<HTMLUListElement>) {
    if (event.target === event.currentTarget && event.propertyName === 'transform') resetLoop();
  }

  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.pointerType === 'touch' ? event.clientX : null;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (distance <= -SWIPE_PX) next();
    else if (distance >= SWIPE_PX) previous();
  };

  const slides = [
    ...items.map((item) => ({ item, clone: false, key: `s-${getKey(item)}` })),
    ...items.slice(0, cloneCount).map((item) => ({ item, clone: true, key: `c-${getKey(item)}` })),
  ];

  const button =
    'inline-flex items-center justify-center rounded-full bg-white text-dash-hero shadow-md transition-opacity hover:opacity-90 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const arrow = `${button} absolute z-10 size-9 opacity-0 group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 max-md:hidden ${controlsClassName}`;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="group/carousel relative"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <div
        ref={viewport}
        // Focusing a slide can make the browser scroll this clipped box; the transform is the only thing allowed to move the track.
        onScroll={(event) => {
          event.currentTarget.scrollLeft = 0;
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
        className="touch-pan-y overflow-hidden"
      >
        <ul
          aria-live={paused ? 'polite' : 'off'}
          onTransitionEnd={onTransitionEnd}
          className={`flex ${animate && !reducedMotion ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{ transform: `translateX(${-index * slide}px)` }}
        >
          {slides.map(({ item, clone, key }) => (
            <li key={key} aria-hidden={clone || undefined} className="shrink-0" style={{ width: slide || undefined }}>
              {renderItem(item, clone)}
            </li>
          ))}
        </ul>
      </div>

      <button type="button" onClick={previous} aria-label="Previous" className={`${arrow} left-1`}>
        <ChevronLeft size={18} aria-hidden />
      </button>
      <button type="button" onClick={next} aria-label="Next" className={`${arrow} right-1`}>
        <ChevronRight size={18} aria-hidden />
      </button>
      {autoplayMs !== false && !reducedMotion && count > 1 && (
        <button
          type="button"
          onClick={() => setUserPaused((current) => !current)}
          aria-pressed={userPaused}
          aria-label={userPaused ? 'Play carousel' : 'Pause carousel'}
          className={`${button} absolute -top-7 right-0 size-6 bg-white/20 text-white hover:bg-white/30`}
        >
          {userPaused ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
        </button>
      )}
    </div>
  );
}
