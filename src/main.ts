import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import '@/assets/css/theme.css';
import '@/index.css';
import { PerfectScrollbarPlugin } from 'vue3-perfect-scrollbar';
import VueTablerIcons from 'vue-tabler-icons';
import print from 'vue3-print-nb';
import VueApexCharts from 'vue3-apexcharts';
import { useSSOWallet } from '@/composables/useSSOWallet';
import { EventEmitter } from 'events';

// ---- Node.js polyfills for browser ----
import { Buffer } from 'buffer';

// Polyfill global objects for browser
(window as any).Buffer = Buffer;
(window as any).EventEmitter = EventEmitter;

// Ensure process is defined globally
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Ensure global is defined
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// ---- Wallet Manager ----
import { WalletManagerPlugin } from '@txnlab/use-wallet-vue';
import { networks, wallets } from './lib/walletManager';
import type { NetworkConfig } from '@txnlab/use-wallet';

const app = createApp(App);

// ---- NextAuth Session Management ----
console.log('[main.ts] NextAuth session will be managed via SSO cookies from siz.land');

// ---- Standard Plugins ----
console.log('[main.ts] Registering router, pinia, and other plugins');
app.use(router);
app.use(createPinia());
app.use(PerfectScrollbarPlugin);
app.use(VueTablerIcons);
app.use(print);
app.use(VueApexCharts);

// ---- Vuetify ----
app.use(vuetify);

// ---- WalletManagerPlugin for network management ONLY ----
console.log('[main.ts] Registering WalletManagerPlugin with networks:', Object.keys(networks));
console.log('[main.ts] Registering WalletManagerPlugin with wallets:', wallets.length);
app.use(WalletManagerPlugin, {
  wallets: wallets,
  networks: networks as Record<string, NetworkConfig>,
  defaultNetwork: 'mainnet',
});

app.mount('#app');
console.log('[main.ts] App mounted');
