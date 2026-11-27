import { describe, expect, it } from 'vitest';
import { listUrl, parseCategoryId } from '@/features/report-list/lib/listUrl';

describe('listUrl', () => {
  const base = '/dashboard/loadallpcrreport';

  it('returns the bare path when there are no filters', () => {
    expect(listUrl(base)).toBe(base);
    expect(listUrl(base, {})).toBe(base);
  });

  it('adds the category', () => {
    expect(listUrl(base, { categoryId: 1 })).toBe(`${base}?categoryId=1`);
  });

  it('adds the search text, trimmed and encoded', () => {
    expect(listUrl(base, { search: '  whey protein ' })).toBe(`${base}?search=whey+protein`);
  });

  it('adds both, and ignores empty values', () => {
    expect(listUrl(base, { categoryId: 4, search: 'milk' })).toBe(`${base}?categoryId=4&search=milk`);
    expect(listUrl(base, { categoryId: null, search: '   ' })).toBe(base);
  });
});

describe('parseCategoryId', () => {
  it('accepts a positive whole number', () => {
    expect(parseCategoryId('7')).toBe(7);
    expect(parseCategoryId('123456')).toBe(123456);
  });

  it('rejects missing, zero, negative, decimal and non-numeric values', () => {
    for (const value of [null, '', '0', '-1', '1.5', 'abc', '1e3', '1234567']) {
      expect(parseCategoryId(value)).toBeNull();
    }
  });
});
