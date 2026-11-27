import { CircleDollarSign, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { setPriceAlert } from '@/features/product-graph/api/setPriceAlert';
import { formatPrice } from '@/features/product-graph/lib/format';
import type { ProductInfo } from '@/features/product-graph/types';

/**
 * "Create Price Alert" dialog (the bell of the chart toolbar): one price field; "Set" stores the alert for this product and location,
 * then the dialog confirms it. Cancel, the X, Esc and the dimmed area close it.
 */
export function PriceAlertDialog({ info, onClose }: { info: ProductInfo; onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(price);
    if (!price.trim() || !Number.isFinite(value) || value <= 0) {
      setError('Enter a price greater than 0.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await setPriceAlert(info.productId, info.locationId, value);
      setDone(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'We couldn’t set the alert right now. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const button = 'h-11 rounded-full px-9 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';

  // Portalled to <body>: inside the page's container-query wrapper a `fixed` box would be placed and clipped by that wrapper.
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form role="dialog" aria-modal="true" aria-labelledby="price-alert-title" onSubmit={submit} noValidate className="w-full max-w-162.5 rounded-lg bg-dash-surface shadow-dash-card">
        <header className="flex items-center justify-between border-b border-dash-hairline px-6 py-5">
          <Heading id="price-alert-title" level={2} size="section" className="text-dash-ink">
            Create Price Alert
          </Heading>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-8 items-center justify-center rounded text-dash-subtle hover:text-dash-ink focus-visible:outline-2 focus-visible:outline-dash-accent">
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="px-6 py-10 text-center">
          <Heading level={3} size="section" className="text-dash-ink">
            {done ? 'Alert set' : 'Get Notified, stay updated'}
          </Heading>
          <p className="mt-1 text-base text-dash-subtle">
            {info.name} | Current Price : {formatPrice(info.price)} {info.unit}
          </p>

          {done ? (
            <p role="status" className="mt-6 text-base text-dash-ink">
              We&apos;ll notify you when the price reaches {price}.
            </p>
          ) : (
            <div className="mx-auto mt-6 max-w-87.5">
              <label className="relative block">
                <span className="sr-only">Price</span>
                <CircleDollarSign size={18} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-dash-placeholder" />
                <input
                  ref={input}
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Price"
                  aria-invalid={error ? true : undefined}
                  className="h-12 w-full rounded-lg border border-dash-control-border bg-dash-surface pr-3 pl-11 text-left text-sm text-dash-ink placeholder:text-dash-placeholder focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-dash-accent"
                />
              </label>
              {error && (
                <p role="alert" className="mt-3 text-sm text-alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-dash-hairline px-6 py-5">
          {done ? (
            <>
              <Link
                href="/dashboard/my-alerts"
                onClick={onClose}
                className={`${button} inline-flex items-center border border-dash-control-border font-medium text-dash-ink hover:bg-dash-hover`}
              >
                View all alerts
              </Link>
              <button type="button" onClick={onClose} className={`${button} bg-dash-outline font-semibold text-dash-surface hover:opacity-90`}>
                Ok
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onClose} className={`${button} border border-dash-control-border font-medium text-dash-ink hover:bg-dash-hover`}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={`${button} bg-dash-outline px-10 font-semibold text-dash-surface transition-opacity hover:opacity-90 disabled:opacity-60`}>
                {saving ? 'Setting…' : 'Set'}
              </button>
            </>
          )}
        </footer>
      </form>
    </div>,
    document.body,
  );
}
