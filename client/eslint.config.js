import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

/**
 * Lint rules for the client: ESLint's recommended set, TypeScript's recommended set, the Rules of Hooks, and the Vite fast-refresh
 * check. Run with `npm run lint` (from the repo root); CI runs the same command.
 */
export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // `const { terms: _terms, ...payload } = values` drops fields on purpose: rest siblings and `_names` are not "unused".
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      // React-Compiler-style rules from eslint-plugin-react-hooks v7: they flag patterns this app uses on purpose and that work
      // (reset-on-navigation effects, the `useAsync` loading flag, the latest-value ref in RegistrationForm). Kept as warnings so they
      // stay visible without failing CI; revisit them when those screens are next refactored.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
);
