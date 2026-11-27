/** Page numbers to show in a pager: first, last, and the current page with one neighbour each side; gaps become "…". */
export function pageWindow(page: number, pages: number): Array<number | '…'> {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, index) => (index > 0 && n - sorted[index - 1] > 1 ? ['…' as const, n] : [n]));
}
