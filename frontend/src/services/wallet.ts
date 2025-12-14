// src/services/wallet.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue';

// Try imports but don't crash at build-time if package API differs.
// Use dynamic import via try-catch.
let TxnLabWalletManager: any = null;
let WalletId: any = null;
let PeraWalletConnect: any = null;

const connected = ref(false);
const address = ref<string | null>(null);
let managerInstance: any = null;
let peraConnector: any = null;

async function initTxnLab() {
  if (!TxnLabWalletManager) {
    try {
      const t: any = await import('@txnlab/use-wallet-vue');
      TxnLabWalletManager = t?.WalletManager ?? t?.default ?? null;
      WalletId = t?.WalletId ?? null;
    } catch {
      // not present or different API — ignore
    }
  }
  if (!TxnLabWalletManager) return null;
  try {
    managerInstance = new TxnLabWalletManager({
      wallets: WalletId ? [WalletId.PERA, WalletId.WALLETCONNECT] : [],
      defaultNetwork: 'testnet',
      options: { debug: false },
    });
    return managerInstance;
  } catch (e) {
    console.warn('[WalletService] TxnLab init failed', e);
    managerInstance = null;
    return null;
  }
}

async function initPera() {
  if (!PeraWalletConnect) {
    try {
      const mod: any = await import('@perawallet/connect');
      PeraWalletConnect = mod?.default ?? mod;
    } catch {
      // not present
    }
  }
  if (!PeraWalletConnect) return null;
  try {
    peraConnector = new PeraWalletConnect();
    return peraConnector;
  } catch (e) {
    console.warn('[WalletService] Pera init failed', e);
    peraConnector = null;
    return null;
  }
}

const WalletService = {
  connected,
  address,

  async init() {
    await initTxnLab();
    await initPera();
    // If there is a persisted connection you can check it here and set state.
    return;
  },

  // Generic connect method, provider: 'PERA' | 'WALLETCONNECT' | 'AUTO'
  async connect(provider = 'AUTO') {
    // prefer TxnLab manager if available
    if (managerInstance && provider !== 'PERA_ONLY') {
      try {
        // manager API may vary; try a couple of common call names
        const connectFn = managerInstance.connect ?? managerInstance.connectWallet ?? managerInstance.open;
        if (typeof connectFn === 'function') {
          const result: any = await connectFn(provider === 'AUTO' ? undefined : provider);
          // try to read returned address
          const addr = result?.address ?? result?.accounts?.[0]?.address ?? result?.[0]?.address;
          if (addr) {
            address.value = addr;
            connected.value = true;
            return { provider: 'TXNLAB', address: addr, raw: result };
          }
        }
      } catch (e) {
        console.warn('[WalletService] TxnLab connect failed, falling back', e);
      }
    }

    // fallback to Pera
    if (peraConnector && (provider === 'PERA' || provider === 'AUTO')) {
      try {
        const newAccounts = await peraConnector.connect();
        const addr = newAccounts?.[0]?.address ?? newAccounts?.[0]?.accounts?.[0]?.address;
        if (addr) {
          address.value = addr;
          connected.value = true;
          return { provider: 'PERA', address: addr, raw: newAccounts };
        }
      } catch (e) {
        console.warn('[WalletService] Pera connect failed', e);
        throw e;
      }
    }

    throw new Error('No wallet provider available to connect');
  },

  async disconnect() {
    // TxnLab disconnect
    try {
      if (managerInstance && typeof managerInstance.disconnect === 'function') {
        await managerInstance.disconnect();
      }
    } catch (e) {
      // ignore
    }

    // Pera disconnect
    try {
      if (peraConnector && typeof peraConnector.disconnect === 'function') {
        await peraConnector.disconnect();
      }
    } catch (e) {
      // ignore
    }

    address.value = null;
    connected.value = false;
  },

  async getAddress() {
    return address.value;
  }
};

export default WalletService;
