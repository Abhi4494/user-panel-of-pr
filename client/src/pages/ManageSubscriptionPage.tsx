import { Mail, PackagePlus, Phone } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Link } from '@/components/ui/Link';
import { useCurrentUser } from '@/features/dashboard/CurrentUserContext';
import { ReportsPager } from '@/features/report-list/components/ReportsPager';
import { getMySubscriptionRequests, getMySubscriptions, getSubscriptionSummary } from '@/features/subscription/api/manageSubscription';
import { RequestProductDialog } from '@/features/subscription/components/RequestProductDialog';
import { formatDate } from '@/features/product-graph/lib/format';
import { useAsync } from '@/hooks/useAsync';

const SALES_EMAIL = 'sales@procurementresource.com';
const SALES_PHONE = '+1-415-325-5166';
const PAGE_SIZES = [20, 50, 100];

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dash-accent';
const card = 'rounded-xl bg-dash-surface shadow-dash-card';

const day = (iso: string) => {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? '' : formatDate(time);
};

function StatusTag({ active }: { active: boolean }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-emerald-500/15 text-emerald-700' : 'bg-rose-500/15 text-rose-700'}`}>
      {active ? 'Active' : 'Expired'}
    </span>
  );
}

/** "Hi {name}" card: how many subscriptions are active / expired and how to reach the sales team. */
function SummaryCard({ activeCount, expiredCount, loading }: { activeCount: number; expiredCount: number; loading: boolean }) {
  const { data: user } = useCurrentUser();
  return (
    <section aria-label="Your subscriptions" className={`${card} p-6`}>
      <Heading level={2} size="section" className="text-dash-outline">
        Hi {user?.name ?? ''}
      </Heading>
      <p className="mt-3 text-sm text-dash-subtle" aria-busy={loading}>
        You have <strong className="text-dash-ink">{loading ? '…' : activeCount}</strong> active subscription{activeCount === 1 ? '' : 's'}. You can request for more by
        filling the form or by just contacting us at below details.
      </p>
      <div className="mt-4 flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-dash-hover text-dash-outline">
          <Mail size={20} aria-hidden />
        </span>
        <div className="min-w-0 text-sm text-dash-ink">
          <a href={`mailto:${SALES_EMAIL}`} className={`block truncate hover:underline ${focus}`}>
            {SALES_EMAIL}
          </a>
          <a href={`tel:${SALES_PHONE}`} className={`mt-1 flex items-center gap-1.5 hover:underline ${focus}`}>
            <Phone size={14} aria-hidden />
            {SALES_PHONE}
          </a>
        </div>
      </div>
      <p className="mt-4 text-sm text-dash-subtle">
        You have <strong className="text-dash-ink">{loading ? '…' : expiredCount}</strong> expired subscription{expiredCount === 1 ? '' : 's'}.
      </p>
    </section>
  );
}

/** "Request for new products": a button that opens the product + location search dialog. */
function RequestCard({ onRaised }: { onRaised: () => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <section aria-label="Request for new products" className="flex flex-col items-start rounded-xl bg-dash-hover p-6 shadow-dash-card">
      <span className="flex size-12 items-center justify-center rounded-lg bg-dash-surface text-dash-outline">
        <PackagePlus size={22} aria-hidden />
      </span>
      <Heading level={2} size="section" className="mt-4 text-dash-outline">
        Request for new products
      </Heading>
      <p className="mt-2 max-w-xl text-sm text-dash-subtle">
        Search the product you need and, if you like, a location. Our team will take it from there and get back to you.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-auto inline-flex h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong ${focus}`}
      >
        Request a product
      </button>
      {open && <RequestProductDialog onClose={close} onRaised={onRaised} />}
    </section>
  );
}

/** "Subscribed" tab: the user's subscriptions with search ("active", "expired" or a product name) and paging. */
function SubscribedList() {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');

  // Wait a moment after typing before asking the API, and go back to page 1 for a new search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const load = useCallback(() => getMySubscriptions(page, pageSize, search), [page, pageSize, search]);
  const list = useAsync(load, { pageLoader: 'first' });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-dash-subtle">
          Show
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className={`h-9 rounded-md border border-dash-control-border bg-dash-surface px-2 text-dash-ink ${focus}`}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          entries
        </label>
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search product, active or expired"
          aria-label="Search subscriptions"
          className={`h-9 w-full max-w-xs rounded-md border border-dash-control-border bg-dash-surface px-3 text-sm text-dash-ink ${focus}`}
        />
      </div>

      {list.error ? (
        <p role="alert" className="py-10 text-center text-sm text-alert">
          We couldn&apos;t load your subscriptions right now.
        </p>
      ) : !list.data ? (
        <div aria-busy="true" aria-label="Loading subscriptions" className="mt-4 h-48 animate-pulse rounded-lg bg-dash-hover motion-reduce:animate-none" />
      ) : list.data.items.length === 0 ? (
        <p className="py-10 text-center text-sm text-dash-subtle">
          {search ? "We couldn't find any matching results. Please try different search terms." : 'You have no subscriptions yet. Use the form above to request products.'}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto" aria-busy={list.isLoading}>
          <table className="w-full min-w-160 border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs font-semibold tracking-wide text-dash-subtle uppercase">
              <tr>
                <th scope="col" className="px-4 py-2">Product</th>
                <th scope="col" className="px-4 py-2">Location</th>
                <th scope="col" className="px-4 py-2">Status</th>
                <th scope="col" className="px-4 py-2">Start date</th>
                <th scope="col" className="px-4 py-2">Expiry date</th>
              </tr>
            </thead>
            <tbody>
              {list.data.items.map((item) => (
                <tr key={item.id} className="bg-dash-surface shadow-dash-card *:first:rounded-l-lg *:last:rounded-r-lg">
                  <td className="px-4 py-3">
                    {item.href ? (
                      <Link href={item.href} className={`font-semibold text-dash-ink hover:underline ${focus}`}>
                        {item.productName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-dash-ink">{item.productName}</span>
                    )}
                    {item.categoryName && <span className="block text-xs text-dash-subtle">{item.categoryName}</span>}
                  </td>
                  <td className="px-4 py-3 text-dash-subtle">{item.locationName}</td>
                  <td className="px-4 py-3"><StatusTag active={item.isActive} /></td>
                  <td className="px-4 py-3 text-dash-subtle">{day(item.startDate)}</td>
                  <td className="px-4 py-3 text-dash-subtle">{day(item.endDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {list.data && list.data.total > 0 && <ReportsPager page={page} pageSize={pageSize} total={list.data.total} onPageChange={setPage} />}
    </div>
  );
}

/** "Pending Requests" tab: every request the user raised, with its status. */
function RequestsList({ version }: { version: number }) {
  // `version` only changes the identity of `load`, so a new request shows up without leaving the page.
  const load = useCallback(() => getMySubscriptionRequests(), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const requests = useAsync(load, { pageLoader: false });

  if (requests.error) {
    return (
      <p role="alert" className="py-10 text-center text-sm text-alert">
        We couldn&apos;t load your requests right now.
      </p>
    );
  }
  if (!requests.data) {
    return <div aria-busy="true" aria-label="Loading requests" className="h-32 animate-pulse rounded-lg bg-dash-hover motion-reduce:animate-none" />;
  }
  if (requests.data.length === 0) {
    return <p className="py-10 text-center text-sm text-dash-subtle">You have not raised any subscription requests yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-120 border-separate border-spacing-y-2 text-left text-sm">
        <thead className="text-xs font-semibold tracking-wide text-dash-subtle uppercase">
          <tr>
            <th scope="col" className="px-4 py-2">Message</th>
            <th scope="col" className="px-4 py-2">Status</th>
            <th scope="col" className="px-4 py-2">Request date</th>
          </tr>
        </thead>
        <tbody>
          {requests.data.map((request) => (
            <tr key={request.id} className="bg-dash-surface shadow-dash-card *:first:rounded-l-lg *:last:rounded-r-lg">
              <td className="px-4 py-3 whitespace-pre-line text-dash-ink">{request.message}</td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full bg-dash-hover px-3 py-1 text-xs font-semibold text-dash-outline">{request.statusLabel}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-dash-subtle">{day(request.createdDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Manage Subscriptions (`/dashboard/managesubscription`): the same screen as the .NET page. A summary card, the free-text
 * "Request for new products" form, and the Subscribed / Pending Requests lists.
 */
export function ManageSubscriptionPage() {
  const summary = useAsync(getSubscriptionSummary, { pageLoader: false });
  const [tab, setTab] = useState<'subscribed' | 'requests'>('subscribed');
  const [requestsVersion, setRequestsVersion] = useState(0);

  const tabButton = (active: boolean) =>
    `rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${focus} ${
      active ? 'border-accent bg-accent text-white' : 'border-dash-control-border bg-dash-surface text-dash-ink hover:bg-dash-hover'
    }`;

  return (
    <div className="@container mx-auto flex max-w-280 flex-col gap-6">
      <div className="grid gap-5 @3xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <SummaryCard activeCount={summary.data?.activeCount ?? 0} expiredCount={summary.data?.expiredCount ?? 0} loading={!summary.data && !summary.error} />
        <RequestCard
          onRaised={() => {
            setRequestsVersion((current) => current + 1);
            setTab('requests');
          }}
        />
      </div>

      <section aria-label="Subscription lists" className={`${card} p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Heading level={2} size="section" className="text-dash-outline">
            Subscription Lists
          </Heading>
          <div className="flex gap-2" role="group" aria-label="Choose a list">
            <button type="button" aria-pressed={tab === 'subscribed'} onClick={() => setTab('subscribed')} className={tabButton(tab === 'subscribed')}>
              Subscribed
            </button>
            <button type="button" aria-pressed={tab === 'requests'} onClick={() => setTab('requests')} className={tabButton(tab === 'requests')}>
              Pending Requests
            </button>
          </div>
        </div>
        <div className="mt-5">{tab === 'subscribed' ? <SubscribedList /> : <RequestsList version={requestsVersion} />}</div>
      </section>
    </div>
  );
}
