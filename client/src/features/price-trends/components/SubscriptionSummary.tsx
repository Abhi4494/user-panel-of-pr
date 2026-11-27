import { Link } from '@/components/ui/Link';
import illustrationUrl from '@/assets/books-reading.png';
import type { PriceTrendsDashboard } from '@/features/price-trends/types';

/**
 * Peach summary card: subscribed count, a sentence with the first few product chips, and (right) the illustration
 * with the "Manage" button. The layout follows the card's own width (container queries), because the available
 * width changes with the sidebar menu: stacked when narrow, three columns from @xl. Gap and padding are fluid
 * (`cqw`, clamped) rather than stepped, so the card does not jump while the sidebar menu animates open/closed.
 * Product chips link to that product's graph (same as the list rows).
 * "click here" and "Manage" both open the Manage Subscriptions page (`/dashboard/managesubscription`), like the .NET site.
 */
export function SubscriptionSummary({ subscription }: { subscription: PriceTrendsDashboard['subscription'] }) {
  return (
    <section aria-label="Your subscription" className="@container">
      <div className="flex flex-col gap-8 rounded-xl bg-dash-tint-peach p-8 @xl:flex-row @xl:items-stretch @xl:gap-[clamp(2rem,7cqw,3rem)] @xl:p-[clamp(2rem,6cqw,2.5rem)]">
        <div className="flex flex-col justify-center @xl:w-28 @xl:shrink-0">
          <p className="text-display leading-none font-light text-dash-ink tabular-nums">{subscription.count}</p>
          <p className="mt-3 max-w-36 text-lg leading-snug font-bold text-dash-strong">Subscribed Products</p>
        </div>

        <div className="min-w-0 flex-1 text-sm leading-snug text-dash-ink">
          <p>Procurement Resource enables you to keep a track of price trends of various products. Currently, you are subscribed to</p>
          <ul className="my-2.5 flex flex-wrap gap-x-2 gap-y-1">
            {subscription.highlighted.map((product) => (
              <li key={product.id}>
                <Link
                  href={product.href}
                  className="block rounded bg-dash-chip px-2.5 py-0.5 text-eyebrow leading-3.5 font-semibold text-dash-chip-text transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
                >
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            To view other products,{' '}
            <Link href="/dashboard/managesubscription" className="font-bold hover:underline focus-visible:outline-2 focus-visible:outline-dash-accent">
              click here
            </Link>
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-dash-accent-line pt-8 @xl:w-36 @xl:shrink-0 @xl:border-t-0 @xl:border-l @xl:pt-0 @xl:pl-6">
          <img src={illustrationUrl} alt="" width={158} height={80} className="h-auto w-full max-w-40" />
          <Link
            href="/dashboard/managesubscription"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-dash-chip text-sm font-semibold text-dash-chip-text transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
          >
            Manage
          </Link>
        </div>
      </div>
    </section>
  );
}
