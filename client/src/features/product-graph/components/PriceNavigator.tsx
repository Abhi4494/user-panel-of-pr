import { useId, useMemo, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { ChartRow } from '@/features/product-graph/lib/chartRows';
import { formatDate } from '@/features/product-graph/lib/format';
import { buildNavigatorPaths } from '@/features/product-graph/lib/navigatorPaths';
import { DAY_MS, MIN_SPAN, clampWindow, type Extent, type TimeWindow } from '@/features/product-graph/lib/priceWindow';

interface PriceNavigatorProps {
  rows: ChartRow[];
  extent: Extent;
  window: TimeWindow;
  onChange: (next: TimeWindow) => void;
}

type DragMode = 'move' | 'left' | 'right';
interface Drag {
  mode: DragMode;
  startX: number;
  start: TimeWindow;
  trackWidth: number;
}

const KEY_STEP = 30 * DAY_MS;

/**
 * Overview of the whole history with a draggable selection window (the "navigator" of the reference chart).
 * Drag the body to pan, the edge handles to resize; arrow keys on a handle move it (Shift = 6x). The overview is a plain
 * SVG on the same time scale as the window, so the window is just a percentage-positioned overlay.
 */
export function PriceNavigator({ rows, extent, window, onChange }: PriceNavigatorProps) {
  const gradientId = `nav-${useId().replace(/:/g, '')}`;
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const paths = useMemo(() => buildNavigatorPaths(rows, extent), [rows, extent]);
  const total = extent.max - extent.min;
  const pct = (time: number) => ((time - extent.min) / total) * 100;

  function begin(mode: DragMode, event: PointerEvent<HTMLElement>) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { mode, startX: event.clientX, start: window, trackWidth: trackRef.current?.getBoundingClientRect().width ?? 1 };
  }

  function move(event: PointerEvent<HTMLElement>) {
    const active = drag.current;
    if (!active) return;
    const delta = ((event.clientX - active.startX) / active.trackWidth) * total;
    const { start } = active;
    if (active.mode === 'move') onChange(clampWindow({ from: start.from + delta, to: start.to + delta }, extent));
    else if (active.mode === 'left') onChange({ from: Math.max(extent.min, Math.min(start.from + delta, start.to - MIN_SPAN)), to: start.to });
    else onChange({ from: start.from, to: Math.min(extent.max, Math.max(start.to + delta, start.from + MIN_SPAN)) });
  }

  const end = () => {
    drag.current = null;
  };

  function nudge(side: 'left' | 'right', event: KeyboardEvent<HTMLElement>) {
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const step = direction * KEY_STEP * (event.shiftKey ? 6 : 1);
    if (side === 'left') onChange({ from: Math.max(extent.min, Math.min(window.from + step, window.to - MIN_SPAN)), to: window.to });
    else onChange({ from: window.from, to: Math.min(extent.max, Math.max(window.to + step, window.from + MIN_SPAN)) });
  }

  const handle =
    'absolute top-1/2 z-10 h-4 w-2 -translate-y-1/2 cursor-ew-resize touch-none rounded-sm border border-dash-window-line bg-dash-surface focus-visible:outline-2 focus-visible:outline-dash-accent';

  return (
    <div ref={trackRef} className="relative h-14 select-none">
      <svg aria-hidden viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--dash-chart-line)', stopOpacity: 0.55 }} />
            <stop offset="100%" style={{ stopColor: 'var(--dash-chart-line)', stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        <path d={paths.area} fill={`url(#${gradientId})`} />
        <path d={paths.line} fill="none" stroke="var(--dash-chart-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>

      <div
        onPointerDown={(event) => begin('move', event)}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="absolute inset-y-0 cursor-grab touch-none border border-dashed border-dash-window-line bg-dash-window-fill/40 active:cursor-grabbing"
        style={{ left: `${pct(window.from)}%`, width: `${pct(window.to) - pct(window.from)}%` }}
      >
        {(['left', 'right'] as const).map((side) => (
          <span
            key={side}
            role="slider"
            tabIndex={0}
            aria-label={side === 'left' ? 'Start of visible range' : 'End of visible range'}
            aria-valuemin={extent.min}
            aria-valuemax={extent.max}
            aria-valuenow={side === 'left' ? window.from : window.to}
            aria-valuetext={formatDate(side === 'left' ? window.from : window.to)}
            onPointerDown={(event) => begin(side, event)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onKeyDown={(event) => nudge(side, event)}
            className={`${handle} ${side === 'left' ? '-left-1' : '-right-1'}`}
          />
        ))}
      </div>
    </div>
  );
}
