import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/components/ui/Link';
import { deletePriceAlert } from '@/features/alerts/api/deletePriceAlert';
import type { PriceAlert } from '@/features/alerts/types';

const head = 'px-4 py-3 text-left text-eyebrow font-semibold uppercase tracking-wide text-dash-subtle';
const cell = 'px-4 py-4 align-middle text-sm text-dash-ink';
const price = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const focus = 'focus-visible:outline-2 focus-visible:outline-dash-accent';

/** The user's price alerts as a table (product, category, location, alert price) with a delete button per row (asks once before deleting). */
export function AlertsList({ alerts, onDeleted }: { alerts: PriceAlert[]; onDeleted: (id: string) => void }) {
  const [confirming, setConfirming] = useState<string>();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState('');

  async function remove(alert: PriceAlert) {
    setBusy(alert.id);
    setError('');
    try {
      await deletePriceAlert(alert.id);
      onDeleted(alert.id);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'We could not delete this alert right now. Please try again.');
    } finally {
      setBusy(undefined);
      setConfirming(undefined);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-alert">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 border-collapse">
          <thead>
            <tr className="border-b border-dash-hairline">
              <th scope="col" className={head}>
                Product
              </th>
              <th scope="col" className={head}>
                Category
              </th>
              <th scope="col" className={head}>
                Location
              </th>
              <th scope="col" className={`${head} text-right`}>
                Alert Price
              </th>
              <th scope="col" className={`${head} text-right`}>
                <span className="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dash-hairline">
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td className={`${cell} font-semibold`}>
                  {alert.href ? (
                    <Link href={alert.href} className={`hover:underline ${focus}`}>
                      {alert.productName}
                    </Link>
                  ) : (
                    alert.productName
                  )}
                </td>
                <td className={cell}>{alert.categoryName}</td>
                <td className={cell}>{alert.locationName}</td>
                <td className={`${cell} text-right tabular-nums`}>{Number.isFinite(alert.price) ? price.format(alert.price) : '-'}</td>
                <td className={`${cell} text-right`}>
                  {confirming === alert.id ? (
                    <span className="inline-flex items-center gap-3 text-sm">
                      <span className="text-dash-subtle">Delete this alert?</span>
                      <button type="button" disabled={busy === alert.id} onClick={() => remove(alert)} className={`font-semibold text-alert hover:underline disabled:opacity-60 ${focus}`}>
                        {busy === alert.id ? 'Deleting...' : 'Yes'}
                      </button>
                      <button type="button" disabled={busy === alert.id} onClick={() => setConfirming(undefined)} className={`font-semibold text-dash-outline hover:underline ${focus}`}>
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Delete alert for ${alert.productName} in ${alert.locationName}`}
                      title="Delete alert"
                      onClick={() => setConfirming(alert.id)}
                      className={`inline-flex size-9 items-center justify-center rounded-lg text-dash-subtle hover:bg-dash-hover hover:text-alert ${focus}`}
                    >
                      <Trash2 size={18} aria-hidden />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
