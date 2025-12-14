// src/types/shims.d.ts
declare module 'util';
declare module 'events';
declare module '@blockshake/defly-connect';
declare module '@perawallet/connect';
declare module '@walletconnect/web3-provider';
declare module '@walletconnect/client';
declare module '@walletconnect/sign-client';
declare module '@walletconnect/modal';
declare module '@walletconnect/utils';
declare module '@walletconnect/core';
declare module '@txnlab/use-wallet-vue';

// If you used any other packages that lack types, add them above.
// Also make `global` exist on window (TypeScript typing)
interface Window {
  global?: any;
  Buffer?: any;
}
declare const global: any;
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
  export default component;
}