/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API location; empty = same origin. See `src/lib/api.ts`. */
  readonly VITE_API_BASE_URL?: string;
  /** Value of the `x-auth-token` header the API requires. */
  readonly VITE_API_AUTH_TOKEN?: string;
  /** The public website; report and news links point there. See `src/lib/websiteUrl.ts`. */
  readonly VITE_WEBSITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
