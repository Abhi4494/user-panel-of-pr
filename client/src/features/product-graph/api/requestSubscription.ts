import { apiFetch } from '@/lib/api';

const ERROR = 'We could not send your request right now. Please try again.';

export interface RequestStatus {
  /** True while the latest request is still being handled (New, Processing or Pending for payment). */
  isOpen: boolean;
  statusLabel: string | null;
}

/** The user's latest request for this product (+ location). Never throws: when it cannot be read the button simply stays available. */
export async function getRequestStatus(productId: number, locationId?: number): Promise<RequestStatus> {
  const params = new URLSearchParams({ productId: String(productId) });
  if (locationId) params.set('locationId', String(locationId));
  try {
    const response = await apiFetch(`/api/v1/user-panel/request-subscription/status?${params.toString()}`);
    const body: unknown = await response.json().catch(() => null);
    const data = (typeof body === 'object' && body !== null ? (body as Record<string, unknown>).data : null) as Record<string, unknown> | null;
    if (!response.ok || !data) return { isOpen: false, statusLabel: null };
    return { isOpen: data.isOpen === true, statusLabel: typeof data.statusLabel === 'string' ? data.statusLabel : null };
  } catch {
    return { isOpen: false, statusLabel: null };
  }
}

/** Raises a subscription request for a product, with a location or without one (same as the .NET "Request Subscription" button). Returns the API's confirmation message. */
export async function requestSubscription(productId: number, locationId?: number): Promise<string> {
  let response: Response;
  try {
    response = await apiFetch('/api/v1/user-panel/request-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationId ? { productId, locationId } : { productId }),
    });
  } catch {
    throw new Error(ERROR);
  }
  const body: unknown = await response.json().catch(() => null);
  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const message = typeof record.message === 'string' && record.message ? record.message : '';
  if (!response.ok) throw new Error(message || ERROR);
  return message || 'Your request has been received.';
}
