import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      // Keep signal high during development; don't fail CI/local runs on these.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    // Final overrides (must come last to win against recommended presets)
    rules: {
      // TypeScript owns undefined identifiers/types; base rule produces false positives (e.g. NodeJS)
      'no-undef': 'off',
      // Prefer TS-aware rule (configured above)
      'no-unused-vars': 'off',
      // This codebase intentionally has several single-word components (Logo, World, etc.)
      'vue/multi-word-component-names': 'off',
      // Avoid failing local workflow on legacy ts-ignore usage
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
];
