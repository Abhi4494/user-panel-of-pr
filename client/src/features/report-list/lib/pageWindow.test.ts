import { describe, expect, it } from 'vitest';
import { pageWindow } from '@/features/report-list/lib/pageWindow';

describe('pageWindow', () => {
  it('shows every page when there are only a few', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it('shows just page 1 when there is a single page', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
  });

  it('starts with the first pages and a gap before the last one', () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, '…', 20]);
  });

  it('puts a gap on both sides of a middle page', () => {
    expect(pageWindow(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20]);
  });

  it('ends with a gap after the first page and the last pages', () => {
    expect(pageWindow(20, 20)).toEqual([1, '…', 19, 20]);
  });

  it('does not add a gap when the neighbour touches the first page', () => {
    expect(pageWindow(3, 20)).toEqual([1, 2, 3, 4, '…', 20]);
  });
});
