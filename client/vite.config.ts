import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * All environment settings live in the `.env*` files next to this config (see `.env.example`); nothing about the API
 * location is written in code. Vite picks the files by mode: `npm run dev` reads `.env.development`, `npm run build`
 * reads `.env.production`, and `.env.local` (this machine only) overrides both.
 */
export default defineConfig(({ command, mode }) => {
  // API_PROXY_TARGET has no VITE_ prefix: it is only used by this dev server and never reaches the browser bundle.
  const { API_PROXY_TARGET, PANEL_BEHIND_NEXT } = loadEnv(mode, process.cwd(), '');
  // Dev only: when the panel is proxied through the Next site (same origin), its assets live under /panel-assets/ so they
  // can't collide with Next's own URLs. Enabled by PANEL_BEHIND_NEXT=1 in client/.env.local; unset = plain localhost:5173.
  const behindNext = command === 'serve' && PANEL_BEHIND_NEXT === '1';
  if (command === 'serve' && !API_PROXY_TARGET) {
    throw new Error('API_PROXY_TARGET is not set. Add it to client/.env.development (see client/.env.example).');
  }

  const apiProxy = {
    // May include a path prefix (e.g. https://api.claight.net/procurement_resource_api): it is put in front of every request path.
    target: API_PROXY_TARGET,
    // A remote API is routed by its host name, so send that instead of localhost:5173.
    changeOrigin: true,
    // Session cookies are issued for the API's host and path; re-issue them for localhost so the browser keeps them.
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
  };

  return {
    // Production builds also use /panel-assets/ so the panel can be served under the website's domain (the website forwards
    // /panel-assets/* to this deployment) without its files clashing with the website's own URLs.
    base: behindNext || command === 'build' ? '/panel-assets/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      // Keep in sync with `paths` in tsconfig.app.json.
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Behind Next the page origin is :3000, but HMR's websocket must connect straight to Vite.
      ...(behindNext ? { hmr: { host: 'localhost', clientPort: 5173 } } : {}),
      proxy: {
        // Forward API calls to the API server during development (used when VITE_API_BASE_URL is empty).
        '/api': apiProxy,
        // Uploaded profile photos are static files served from the API's web root.
        '/uploaded-files': apiProxy,
        // News article card images.
        '/newsarticles/files': apiProxy,
      },
    },
  };
});
