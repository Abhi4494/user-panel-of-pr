import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Heading } from '@/components/ui/Heading';
import { formatPrice } from '@/features/product-graph/lib/format';
import type { ProductInfo } from '@/features/product-graph/types';

/** Looks of the editor's HTML (headings, lists, links, tables) inside the dialog. */
const richText =
  'text-base leading-relaxed text-dash-ink [&_a]:text-dash-outline [&_a]:underline [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-dash-ink [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-dash-ink [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-2 [&_strong]:font-semibold [&_strong]:text-dash-ink [&_ul]:list-disc [&_ul]:pl-6';

const cell = 'border border-dash-ink/70 px-2 py-1 align-top text-left';

/**
 * "Chart Info" dialog (the "i" button of the chart toolbar): product, current price, category and the product description. The
 * "<product> Product Details" table is shown where the description asks for it (only when the product has details); Ok, the X, Esc and the
 * dimmed area close it.
 */
export function ChartInfoDialog({ info, onClose }: { info: ProductInfo; onClose: () => void }) {
  const ok = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    ok.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const lines = [
    ['Category', info.category],
    ['Sub Category', info.subCategory],
    ['Description', info.description],
  ].filter(([, value]) => value);

  // Portalled to <body>: inside the page's container-query wrapper a `fixed` box would be placed and clipped by that wrapper.
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 sm:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="chart-info-title" className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-dash-surface shadow-dash-card">
        <header className="flex shrink-0 items-center justify-between border-b border-dash-hairline px-6 py-5">
          <Heading id="chart-info-title" level={2} size="section" className="text-dash-ink">
            Chart Info
          </Heading>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-8 items-center justify-center rounded text-dash-subtle hover:text-dash-ink focus-visible:outline-2 focus-visible:outline-dash-accent">
            <X size={20} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <p className="text-base text-dash-ink">{info.name}</p>
          <p className="mt-1 text-base text-dash-subtle">
            Current Price : {formatPrice(info.price)} {info.unit}
          </p>
          {lines.map(([label, value]) => (
            <p key={label} className="mt-1 text-base text-dash-subtle">
              {label} : {value}
            </p>
          ))}

          <div className={richText}>
            {info.before && <div dangerouslySetInnerHTML={{ __html: info.before }} />}
            {info.details.length > 0 && (
              <>
                <h3>{info.name} Product Details</h3>
                <table className="mt-2 w-full border-collapse text-sm text-dash-ink">
                  <thead>
                    <tr>
                      <th className={`${cell} w-1/5 font-semibold`}>Report Features</th>
                      <th className={`${cell} font-semibold`}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.details.map((row) => (
                      <tr key={row.label}>
                        <th scope="row" className={`${cell} font-semibold`}>
                          {row.label}
                        </th>
                        <td className={`${cell} font-normal text-dash-ink`} dangerouslySetInnerHTML={{ __html: row.html }} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {info.after && <div dangerouslySetInnerHTML={{ __html: info.after }} />}
          </div>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-dash-hairline px-6 py-5">
          <button
            ref={ok}
            type="button"
            onClick={onClose}
            className="h-11 rounded-full bg-dash-outline px-10 text-sm font-semibold text-dash-surface transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
          >
            Ok
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
