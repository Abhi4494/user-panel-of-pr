const site = (import.meta.env.VITE_WEBSITE_URL ?? '').replace(/\/+$/, '');

/** The public website's home page. Empty VITE_WEBSITE_URL = same origin, i.e. `/` (panel served under the website's domain). */
export const WEBSITE_HOME_URL = `${site}/`;

/** A report's page on the public website: `{site}/reports/{url}`. */
export const reportUrl = (url: string) => `${site}/reports/${url}`;

/** A production cost report's page on the public website: `{site}/cost-analysis/{url}`. */
export const pcrUrl = (url: string) => `${site}/cost-analysis/${url}`;

/** An industry's page on the public website: `{site}/industries/{url}`. */
export const industryUrl = (url: string) => `${site}/industries/${url}`;

/** The news list on the public website: `{site}/news-and-articles`. */
export const NEWS_LIST_URL = `${site}/news-and-articles`;

/** A news article's page on the public website: `{site}/news-and-articles/{url}`. */
export const newsUrl = (url: string) => `${site}/news-and-articles/${url}`;
