import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vitest/config';
import vuetify from 'vite-plugin-vuetify';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['v-list-recognize-title'].includes(tag)
        }
      }
    }),
    vuetify({
      autoImport: true
    }),
    tailwindcss(),
    nodePolyfills({
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `global`
      protocolImports: true,
    })
  ],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 20000,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      // Hardhat tests live here; Vitest shouldn't try to run them.
      'contracts/**'
    ],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Additional polyfills for problematic libraries
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      'util': 'util',
      'buffer': 'buffer',
      'process': 'process/browser',
    }
  },
  define: {
    // Global polyfills for Node.js compatibility
    global: 'globalThis',
    'process.env': {},
    'process.platform': '"browser"',
    'process.version': '"v16.0.0"',
    'process.browser': true,
    'process.node': false,
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  build: {
    chunkSizeWarningLimit: 1024 * 1024, // Set the limit to 1 MB
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    }
  },
  optimizeDeps: {
    exclude: ['vuetify'],
    entries: ['./src/**/*.vue'],
    include: [
      'buffer',
      'events',
      'util',
      'process',
      'crypto-browserify',
      'stream-browserify',
      // Keep this list limited to actual dependencies to avoid optimize errors.
    ]
  },
  esbuild: {
    target: 'es2020',
    supported: {
      'top-level-await': true
    },
    legalComments: 'none',
  }
});
