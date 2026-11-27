import { Bell, CircleAlert, Download, FileText, Filter, FolderPlus, Plus, type LucideIcon } from 'lucide-react';
import { toolbarButton, toolbarIdle } from '@/components/ui/controlButtonStyles';

interface ChartActionsProps {
  /** Saves the visible range as CSV (calls the backend export API). */
  onDownload: () => void;
  /** Opens the "Filter Chart" dialog. */
  onFilter: () => void;
  /** Opens the "Chart Info" dialog. */
  onInfo: () => void;
  /** Opens the "Create Price Alert" dialog. */
  onAlert: () => void;
  /** Opens the "Add this graph to your dashboard" dialog. */
  onSave: () => void;
  /** Opens the "Add a Product" dialog. */
  onAdd: () => void;
}

interface Action {
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The seven icon buttons on the right of the toolbar, in the reference's order. Download, Alert, Save (folder), Info and Filters are wired;
 * the others are placeholders until the backend features behind them exist.
 * TODO(backend): add to dashboard, report.
 */
const ACTIONS: Action[] = [
  { id: 'download', label: 'Download data', icon: Download },
  { id: 'alert', label: 'Set price alert', icon: Bell },
  { id: 'add', label: 'Add to my dashboard', icon: Plus },
  { id: 'folder', label: 'Add to folder', icon: FolderPlus },
  { id: 'info', label: 'About this price', icon: CircleAlert },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'filter', label: 'Filters', icon: Filter },
];

export function ChartActions({ onDownload, onFilter, onInfo, onAlert, onSave, onAdd }: ChartActionsProps) {
  const handlers: Record<string, () => void> = { download: onDownload, filter: onFilter, info: onInfo, alert: onAlert, folder: onSave, add: onAdd };
  return (
    <div role="group" aria-label="Chart actions" className="flex items-center gap-0.75">
      {ACTIONS.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" aria-label={label} title={label} onClick={handlers[id]} className={`${toolbarButton} ${toolbarIdle}`}>
          <Icon size={16} aria-hidden />
        </button>
      ))}
    </div>
  );
}
