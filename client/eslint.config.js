import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

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
    // shadcn/ui files export variants (buttonVariants, badgeVariants) next to the component on purpose,
    // and FormField exports its describe() helper. Fast refresh still works; it just reloads these files fully.
    files: ['src/components/ui/**', 'src/components/FormField.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])