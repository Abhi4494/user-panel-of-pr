import { apiFetch } from '@/lib/api';

/** A failed API call that got an answer: the HTTP status and the API's own message (if any). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly apiMessage: string,
    /** The body's `data`, when the API sent some with the error (e.g. the product/location behind a 403). */
    readonly data?: Record<string, unknown>,
  ) {
    super(message);
  }
}

/** Calls an API endpoint (GET unless `init` says otherwise) and returns the body's `data` object; throws `message` on any failure. */
export async function getApiData(path: string, message: string, init?: RequestInit): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch {
    throw new Error(message);
  }
  const body: unknown = await response.json().catch(() => null);
  const record = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const status = response.ok && typeof record.statusCode === 'number' ? record.statusCode : response.status; // some answers are 200 with an error `statusCode`
  const data = record.data;
  if (!response.ok || status >= 400) {
    const errorData = typeof data === 'object' && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : undefined;
    throw new ApiError(message, status, typeof record.message === 'string' ? record.message : '', errorData);
  }
  if (typeof data !== 'object' || data === null) throw new Error(message);
  return data as Record<string, unknown>;
}

/** The record's string field, or '' when it is missing or not a string. */
export const text = (record: Record<string, unknown>, key: string) => (typeof record[key] === 'string' ? (record[key] as string) : '');

/** The items of an API list, keeping only the object entries. */
export const records = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null) : [];

/** `POST`s a JSON body to an API endpoint whose answer carries no data worth reading; throws an `Error` with the API's own message (or `message`) on any failure. */
export async function postApi(path: string, body: Record<string, unknown>, message: string): Promise<void> {
  let response: Response;
  try {
    response = await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error(message);
  }
  const answer: unknown = await response.json().catch(() => null);
  const record = typeof answer === 'object' && answer !== null ? (answer as Record<string, unknown>) : {};
  const status = response.ok && typeof record.statusCode === 'number' ? record.statusCode : response.status;
  if (!response.ok || status >= 400) throw new Error(typeof record.message === 'string' && record.message ? record.message : message);
}
