/**
 * The API sends display dates ("August, 2026", "May 28, 2026"); the screens want an ISO day. A month-only date maps to the
 * 1st of that month. Returns '' when the text isn't a date.
 */
export function parseApiDay(text: unknown): string {
  if (typeof text !== 'string') return '';
  const normalized = text.trim().replace(/^([A-Za-z]+),\s*(\d{4})$/, '$1 1, $2');
  const time = Date.parse(`${normalized} UTC`);
  return Number.isNaN(time) ? '' : new Date(time).toISOString().slice(0, 10);
}
