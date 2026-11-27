import { describe, expect, it } from 'vitest';
import { timeAgo } from '@/lib/timeAgo';

const NOW = Date.parse('2026-10-28T12:00:00Z');
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe('timeAgo', () => {
  it('says "just now" under a minute', () => {
    expect(timeAgo(ago(20), NOW)).toBe('just now');
    expect(timeAgo(ago(0), NOW)).toBe('just now');
  });

  it('never goes negative for a time in the future', () => {
    expect(timeAgo(ago(-3600), NOW)).toBe('just now');
  });

  it('uses the largest whole unit', () => {
    expect(timeAgo(ago(5 * 60), NOW)).toBe('5 minutes ago');
    expect(timeAgo(ago(3 * 3600), NOW)).toBe('3 hours ago');
    expect(timeAgo(ago(2 * 86400), NOW)).toBe('2 days ago');
    expect(timeAgo(ago(2 * 7 * 86400), NOW)).toBe('2 weeks ago');
    expect(timeAgo(ago(8 * 30 * 86400), NOW)).toBe('8 months ago');
    expect(timeAgo(ago(2 * 365 * 86400), NOW)).toBe('2 years ago');
  });

  it('uses singular for one', () => {
    expect(timeAgo(ago(3600), NOW)).toBe('1 hour ago');
  });
});
