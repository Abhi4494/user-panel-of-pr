import { X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Heading } from '@/components/ui/Heading';
import { saveGraph } from '@/features/product-graph/api/saveGraph';
import type { ExtraSeriesEntry } from '@/features/product-graph/components/PriceChart';
import type { ProductGraph, ProductInfo } from '@/features/product-graph/types';

const field =
  'w-full rounded-lg border border-dash-control-border bg-dash-surface px-3.5 text-sm text-dash-ink placeholder:text-dash-placeholder focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-dash-accent';
const button = 'h-11 rounded-full px-9 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';

/**
 * "Add this graph to your dashboard" dialog (the folder button of the chart toolbar): a title and a summary, "Save" stores the graph
 * with the filters it is showing now, then the dialog confirms it. Cancel, the X, Esc and the dimmed area close it.
 */
export function SaveGraphDialog({ graph, info, extraSeries = [], onClose }: { graph: ProductGraph; info: ProductInfo; extraSeries?: ExtraSeriesEntry[]; onClose: () => void }) {
  const first = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    first.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Enter a title.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveGraph(title.trim(), summary.trim(), graph, info, extraSeries);
      setDone(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'We could not add this graph to your dashboard right now. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Portalled to <body>: inside the page's container-query wrapper a `fixed` box would be placed and clipped by that wrapper.
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form role="dialog" aria-modal="true" aria-labelledby="save-graph-title" onSubmit={submit} noValidate className="w-full max-w-162.5 rounded-lg bg-dash-surface shadow-dash-card">
        <header className="flex items-center justify-between border-b border-dash-hairline px-6 py-5">
          <Heading id="save-graph-title" level={2} size="section" className="text-dash-ink">
            Add this graph to your dashboard
          </Heading>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-8 items-center justify-center rounded text-dash-subtle hover:text-dash-ink focus-visible:outline-2 focus-visible:outline-dash-accent">
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="px-6 py-6">
          <p className="text-base text-dash-ink">{graph.name}</p>
          {done ? (
            <p role="status" className="mt-4 text-base text-dash-ink">
              The graph was added to your dashboard.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <label className="block">
                <span className="sr-only">Title</span>
                <input ref={first} type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" maxLength={200} className={`${field} h-12`} />
              </label>
              <label className="block">
                <span className="sr-only">Summary</span>
                <textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Summary" rows={4} maxLength={1000} className={`${field} resize-y py-3`} />
              </label>
              {error && (
                <p role="alert" className="text-sm text-alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-dash-hairline px-6 py-5">
          {done ? (
            <button type="button" onClick={onClose} className={`${button} bg-dash-outline font-semibold text-dash-surface hover:opacity-90`}>
              Ok
            </button>
          ) : (
            <>
              <button type="button" onClick={onClose} className={`${button} border border-dash-control-border font-medium text-dash-ink hover:bg-dash-hover`}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={`${button} bg-dash-outline px-10 font-semibold text-dash-surface transition-opacity hover:opacity-90 disabled:opacity-60`}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </footer>
      </form>
    </div>,
    document.body,
  );
}
