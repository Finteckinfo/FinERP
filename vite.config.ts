import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
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
  base: process.env.NODE_ENV === 'production' ? '/FinERP/' : '/',
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
      '@walletconnect/web3-provider',
      '@blockshake/defly-connect',
      '@perawallet/connect',
      'algosdk'
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
