import { useCallback, useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { showToast } from '@/components/ui/Toaster';
import type { SubscriptionTarget } from '@/features/product-graph/api/getProductData';
import { getRequestStatus, requestSubscription } from '@/features/product-graph/api/requestSubscription';
import { useAsync } from '@/hooks/useAsync';

/** A flat-style person: head, body, legs and the arm pose given as `arm` path data. Colours are fixed (it is an illustration, not UI). */
function Person({ x, y, shirt, pants = '#1f2f6b', hair = '#2b2340', arm }: { x: number; y: number; shirt: string; pants?: string; hair?: string; arm?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-5" y="34" width="5" height="30" rx="2" fill={pants} />
      <rect x="1" y="34" width="5" height="30" rx="2" fill={pants} />
      <rect x="-8" y="12" width="16" height="26" rx="6" fill={shirt} />
      <circle cx="0" cy="4" r="7" fill="#f2b38b" />
      <path d="M-7 3 a7 7 0 0 1 14 0 q-7 -4 -14 0 z" fill={hair} />
      {arm && <path d={arm} fill="none" stroke={shirt} strokeWidth="5" strokeLinecap="round" />}
    </g>
  );
}

/** Illustration for the "not subscribed" screen (monitor with a big warning sign and a few people), drawn inline so it needs no image file. */
function WarningIllustration() {
  return (
    <svg viewBox="0 0 400 260" role="img" aria-label="A warning sign on a monitor" className="h-auto w-80 max-w-full">
      {/* soft background cloud + globe */}
      <path
        d="M70 190 C40 190 38 150 66 142 C60 108 98 92 124 108 C140 70 200 62 226 92 C250 70 306 84 308 126 C346 124 362 170 332 190 Z"
        fill="#e7eefc"
      />
      <circle cx="272" cy="112" r="34" fill="#cfdcf8" />
      <path d="M254 100 q10 -10 22 -2 q4 10 -8 14 q-10 4 -14 -12 z M280 120 q10 2 12 12 q-12 6 -14 -4 z" fill="#b6c9f3" />

      {/* monitor */}
      <rect x="118" y="84" width="164" height="104" rx="8" fill="#8aa4f2" />
      <rect x="128" y="94" width="144" height="84" rx="4" fill="#dfe8ff" />
      <rect x="128" y="94" width="144" height="10" rx="3" fill="#a9bdf6" />
      <circle cx="136" cy="99" r="1.8" fill="#ffffff" />
      <circle cx="142" cy="99" r="1.8" fill="#ffffff" />
      <rect x="190" y="188" width="20" height="14" fill="#6f87dc" />
      <rect x="170" y="200" width="60" height="7" rx="3.5" fill="#8aa4f2" />

      {/* warning triangle + lightning */}
      <path d="M200 104 L250 188 H150 Z" fill="#fff5ee" stroke="#f47b3c" strokeWidth="9" strokeLinejoin="round" />
      <rect x="196" y="130" width="8" height="30" rx="4" fill="#f47b3c" />
      <circle cx="200" cy="172" r="5" fill="#f47b3c" />
      <path d="M222 50 L206 92 H220 L210 124 L244 80 H228 Z" fill="#f47b3c" />

      {/* magnifier */}
      <circle cx="124" cy="150" r="20" fill="#ffffff" fillOpacity="0.55" stroke="#1f2f6b" strokeWidth="3.5" />
      <line x1="109" y1="165" x2="96" y2="180" stroke="#1f2f6b" strokeWidth="5" strokeLinecap="round" />

      {/* people */}
      <Person x={84} y={150} shirt="#f48a3a" arm="M-6 18 L14 26" />
      <Person x={176} y={176} shirt="#f4a04a" pants="#1f2f6b" arm="M6 20 L16 30" />
      <g transform="translate(318 148)">
        <Person x={0} y={0} shirt="#5b86e5" arm="M-6 18 L-22 8" />
        <path d="M-30 4 l-10 -4 v12 l10 -4 z" fill="#f47b3c" />
      </g>
      {/* person sitting on the monitor with a laptop */}
      <g transform="translate(146 60)">
        <rect x="-6" y="12" width="14" height="22" rx="6" fill="#f48a3a" />
        <circle cx="0" cy="4" r="7" fill="#f2b38b" />
        <path d="M-7 3 a7 7 0 0 1 14 0 q-7 -4 -14 0 z" fill="#2b2340" />
        <rect x="-8" y="32" width="28" height="6" rx="3" fill="#1f2f6b" />
        <rect x="6" y="22" width="16" height="10" rx="1.5" fill="#1f2f6b" />
      </g>

      {/* ground + plants */}
      <line x1="40" y1="224" x2="360" y2="224" stroke="#1f2f6b" strokeWidth="1.6" />
      <path d="M64 224 q-6 -14 2 -20 q2 12 -2 20 z M70 224 q4 -12 12 -14 q-4 10 -12 14 z" fill="#a8d5a0" />
      <path d="M336 224 q-6 -14 2 -20 q2 12 -2 20 z M342 224 q4 -12 12 -14 q-4 10 -12 14 z" fill="#a8d5a0" />
    </svg>
  );
}

const buttonBase =
  'inline-flex h-10 items-center justify-center rounded px-6 text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';

/**
 * Shown instead of the product graph when the user's subscription does not cover the product.
 * With a `target` (the product exists) it offers "Request Subscription" for the product and location, or for the product
 * alone when no location was named; without one it only says the product is not covered.
 */
export function NotSubscribedCard({ target }: { target?: SubscriptionTarget }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  // An earlier request that is still open: show "Request pending" instead of offering the button again.
  const productId = target?.productId;
  const locationId = target?.locationId;
  const loadStatus = useCallback(
    () => (productId ? getRequestStatus(productId, locationId) : Promise.resolve({ isOpen: false, statusLabel: null })),
    [productId, locationId],
  );
  const existing = useAsync(loadStatus, { pageLoader: false });
  const pending = status === 'idle' && existing.data?.isOpen === true;

  async function handleRequest() {
    if (!target) return;
    setStatus('sending');
    setError('');
    try {
      const message = await requestSubscription(target.productId, target.locationId);
      setConfirmation(message);
      setStatus('sent');
      showToast('success', message);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'We could not send your request right now. Please try again.';
      setError(message);
      setStatus('idle');
      showToast('error', message);
    }
  }

  return (
    <section
      aria-label={target ? 'Unauthorised access' : 'Data not available'}
      className="mx-auto flex max-w-280 flex-col items-center rounded-xl bg-dash-surface px-6 py-14 text-center shadow-dash-card"
    >
      <WarningIllustration />
      {target ? (
        <>
          <Heading level={2} size="section" className="mt-6 text-dash-outline">
            You do not have access to {target.productName}
            {target.locationName ? ` (${target.locationName})` : ''}
          </Heading>
          <p className="mt-2 max-w-xl text-sm text-dash-subtle">
            {status === 'sent'
              ? confirmation
              : pending
                ? `Your request is ${existing.data?.statusLabel?.toLowerCase() ?? 'with us'}. We will get back to you soon.`
                : 'Please contact administrator or request for subscription by clicking below.'}
          </p>
        </>
      ) : (
        <>
          <Heading level={2} size="section" className="mt-6 text-dash-outline">
            Thank you for your interest
          </Heading>
          <p className="mt-2 max-w-xl text-sm text-dash-subtle">The product is not covered in your current subscription. Please raise a request for the same</p>
        </>
      )}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard/index"
          className={`${buttonBase} ${target ? 'border border-dash-outline text-dash-outline' : 'bg-dash-outline text-dash-surface'}`}
        >
          Go to Dashboard
        </Link>
        {target && (
          <button
            type="button"
            onClick={handleRequest}
            disabled={status !== 'idle' || pending}
            className={`${buttonBase} bg-dash-outline text-dash-surface disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Request sent' : pending ? 'Request pending' : 'Request Subscription'}
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-alert">{error}</p>}
      {target && (
        <Link
          href="/dashboard/managesubscription"
          className="mt-5 text-sm font-semibold text-dash-outline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent"
        >
          {pending || status === 'sent' ? 'View my requests' : 'Manage my subscriptions'}
        </Link>
      )}
    </section>
  );
}
