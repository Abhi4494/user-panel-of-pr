/** The product graph for one product in one place: `/price-trend-dashboard/{product Url}/{CountryShortName}`, e.g. `.../butter/USA`. */
export const productGraphPath = (productSlug: string, locationSlug: string) => `/price-trend-dashboard/${productSlug}/${encodeURIComponent(locationSlug)}`;
