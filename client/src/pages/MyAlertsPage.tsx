import { useState } from 'react';
import { Link } from '@/components/ui/Link';
import { getPriceAlerts } from '@/features/alerts/api/getPriceAlerts';
import { AlertsList } from '@/features/alerts/components/AlertsList';
import { useAsync } from '@/hooks/useAsync';

/** My Alerts (`/dashboard/my-alerts`): the price alerts the user set from a product graph, with delete. */
export function MyAlertsPage() {
  const alerts = useAsync(getPriceAlerts);
  const [deleted, setDeleted] = useState<string[]>([]);
  const visible = (alerts.data ?? []).filter((alert) => !deleted.includes(alert.id));

  return (
    <section aria-label="My alerts" className="mx-auto max-w-280 rounded-xl bg-dash-surface p-6 shadow-dash-card">
      {alerts.error ? (
        <p role="alert" className="py-10 text-center text-sm text-dash-ink">
          We couldn&apos;t load your alerts right now.
        </p>
      ) : !alerts.data ? (
        <div aria-busy="true" aria-label="Loading alerts" className="h-48 animate-pulse rounded-lg bg-dash-hover motion-reduce:animate-none" />
      ) : visible.length === 0 ? (
        <div className="py-10 text-center text-sm text-dash-ink">
          <p>You have no price alerts yet.</p>
          <p className="mt-2 text-dash-subtle">Open a product in Price Trends and tap the bell to be notified when its price reaches your target.</p>
          <Link href="/dashboard/pricetrend" className="mt-3 inline-block font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
            Go to Price Trends
          </Link>
        </div>
      ) : (
        <AlertsList alerts={visible} onDeleted={(id) => setDeleted((current) => [...current, id])} />
      )}
    </section>
  );
}
