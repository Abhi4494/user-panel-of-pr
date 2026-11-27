const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "2026-02-27T10:00:00Z" -> "8 months ago" (largest whole unit; "just now" under a minute). */
export function timeAgo(isoTimestamp: string, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - Date.parse(isoTimestamp)) / 1000));
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return formatter.format(-Math.floor(seconds / size), unit);
  }
  return 'just now';
}
