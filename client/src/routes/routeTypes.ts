/** Values captured from a dynamic path, e.g. `/price-trend-dashboard/:slug` -> `{ slug: 'green-electricity' }`. */
export type RouteParams = Record<string, string>;

/** What every dashboard page component receives from the route table (pages may declare only the part they use). */
export interface RouteProps {
  params: RouteParams;
  /** The URL's query string, e.g. `?categoryId=1`. Pages read filters from here so links are shareable. */
  query: URLSearchParams;
}
