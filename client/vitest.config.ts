import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Test settings. Deliberately separate from `vite.config.ts` (that one needs the dev API proxy settings and is for the app itself).
 * Tests cover plain logic (no DOM), so the default Node environment is used. `@/` must match the alias in `vite.config.ts` / tsconfig.
 */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['src/**/*.test.ts'] },
});
