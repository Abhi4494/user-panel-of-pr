import { describe, expect, it } from 'vitest';
import { formatDay, formatShortDay } from '@/lib/formatDay';

describe('formatDay', () => {
  it('formats an ISO day with a two-digit day and the year', () => {
    expect(formatDay('2020-07-08')).toBe('Jul 08, 2020');
    expect(formatDay('2022-06-30')).toBe('Jun 30, 2022');
  });

  it('does not shift the day with the time zone', () => {
    expect(formatDay('2026-01-01')).toBe('Jan 01, 2026');
    expect(formatDay('2026-12-31')).toBe('Dec 31, 2026');
  });
});

describe('formatShortDay', () => {
  it('drops the year and the leading zero', () => {
    expect(formatShortDay('2025-11-12')).toBe('Nov 12');
    expect(formatShortDay('2022-03-05')).toBe('Mar 5');
  });
});
