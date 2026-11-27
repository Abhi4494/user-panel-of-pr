import { CircleMinus, CirclePlus, Menu } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';

interface ChartHeaderProps {
  title: string;
  /** Parts joined with " | " (name, unit, region). */
  subtitle: string[];
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const iconButton =
  'inline-flex size-6 items-center justify-center rounded-full text-dash-chart-icon transition-colors hover:text-dash-ink focus-visible:outline-2 focus-visible:outline-dash-accent';

/** Chart title + subtitle on the left; zoom in/out and the chart menu on the right. */
export function ChartHeader({ title, subtitle, onZoomIn, onZoomOut }: ChartHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Heading level={2} size="section" className="text-dash-outline">
          {title}
        </Heading>
        <p className="mt-1.5 text-eyebrow text-dash-subtle">{subtitle.join(' | ')}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in" className={iconButton}>
          <CirclePlus size={18} aria-hidden />
        </button>
        <button type="button" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out" className={iconButton}>
          <CircleMinus size={18} aria-hidden />
        </button>
        {/* TODO(backend): chart menu (print / download as image) once export options are decided. */}
        <button type="button" aria-label="Chart menu" title="Chart menu" className={iconButton}>
          <Menu size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
