const full = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
const short = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** "2020-07-08" -> "Jul 08, 2020" (UTC, so the day never shifts with the viewer's time zone). */
export const formatDay = (isoDay: string) => full.format(Date.parse(isoDay));

/** "2025-11-12" -> "Nov 12" (no year: for compact lists of recent items). */
export const formatShortDay = (isoDay: string) => short.format(Date.parse(isoDay));
