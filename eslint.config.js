import js from '@eslint/js';
import globals from 'globals';
import checkFile from 'eslint-plugin-check-file';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Enforces the kebab-case convention already used consistently across
    // src/ — catches drift like PascalCase or suffix-mismatched filenames
    // before it accumulates (e.g. task-management's `TeamMember.tsx`
    // exporting `TeamMemberDashboard`, or its mixed Page/no-Page suffixing).
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/vite-env.d.ts'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx}': 'KEBAB_CASE' },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { 'src/**/': 'KEBAB_CASE' },
      ],
    },
  },
  {
    // shadcn/ui primitives intentionally co-export a cva variants helper
    // alongside the component; that's what trips this rule, and it's safe
    // here since these files aren't app components subject to fast refresh.
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Route-definition files export a router config object (built from
    // React.lazy() component references), not a component themselves —
    // Fast Refresh never applied to this file to begin with.
    files: ['src/app/router.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
