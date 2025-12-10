<template>
  <v-dialog v-model="isOpen" max-width="500" z-index="2000">
    <v-card class="rounded-xl elevation-3">
      <v-card-title class="headline text-primary font-weight-bold d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-wallet</v-icon>
          Connect Wallet
        </div>
        <v-btn icon variant="text" @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <v-card-text class="pa-4">
        <div v-if="connecting" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          <p class="text-body-2 text-medium-emphasis mt-4">Connecting wallet...</p>
        </div>

        <div v-else class="wallet-options">
          <p class="text-body-2 text-medium-emphasis mb-4 text-center">
            Choose a wallet to connect to FinERP
          </p>

          <!-- MetaMask -->
          <v-btn
            v-if="availableWallets.includes('metamask')"
            block
            size="large"
            variant="outlined"
            class="mb-3 wallet-option"
            @click="connectWallet('metamask')"
            :disabled="connecting"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-3" size="24">mdi-wallet</v-icon>
                <div class="text-left">
                  <div class="font-weight-bold">MetaMask</div>
                  <div class="text-caption text-medium-emphasis">Browser extension</div>
                </div>
              </div>
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </v-btn>

          <!-- Coinbase Wallet -->
          <v-btn
            v-if="availableWallets.includes('coinbase')"
            block
            size="large"
            variant="outlined"
            class="mb-3 wallet-option"
            @click="connectWallet('coinbase')"
            :disabled="connecting"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-3" size="24">mdi-wallet</v-icon>
                <div class="text-left">
                  <div class="font-weight-bold">Coinbase Wallet</div>
                  <div class="text-caption text-medium-emphasis">Browser extension</div>
                </div>
              </div>
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </v-btn>

          <!-- Other Injected Wallets -->
          <v-btn
            v-if="availableWallets.includes('injected')"
            block
            size="large"
            variant="outlined"
            class="mb-3 wallet-option"
            @click="connectWallet('injected')"
            :disabled="connecting"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-3" size="24">mdi-wallet-outline</v-icon>
                <div class="text-left">
                  <div class="font-weight-bold">Injected Wallet</div>
                  <div class="text-caption text-medium-emphasis">Other browser wallet</div>
                </div>
              </div>
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </v-btn>

          <!-- WalletConnect -->
          <v-btn
            block
            size="large"
            variant="outlined"
            class="mb-3 wallet-option"
            @click="connectWallet('walletconnect')"
            :disabled="connecting"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="mr-3" size="24">mdi-qrcode</v-icon>
                <div class="text-left">
                  <div class="font-weight-bold">WalletConnect</div>
                  <div class="text-caption text-medium-emphasis">Mobile & desktop wallets</div>
                </div>
              </div>
              <v-icon>mdi-chevron-right</v-icon>
            </div>
          </v-btn>

          <!-- Auto Connect -->
          <v-btn
            block
            size="large"
            variant="elevated"
            color="primary"
            class="mt-4"
            @click="connectWallet()"
            :disabled="connecting"
            :loading="connecting"
          >
            <v-icon start>mdi-auto-fix</v-icon>
            Auto Connect (Recommended)
          </v-btn>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mt-4" closable @click:close="error = null">
          {{ error }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useEVMWallet, type WalletType } from '@/composables/useEVMWallet';
import { isWalletModalOpen } from '@/stores/walletStore';

const { connect, connectMetaMask, connectWalletConnect, connectCoinbase, connectInjected, detectAvailableWallets, error: walletError } = useEVMWallet();

const isOpen = computed({
  get: () => isWalletModalOpen.value,
  set: (val) => isWalletModalOpen.value = val
});

const connecting = ref(false);
const error = ref<string | null>(null);
const availableWallets = ref<string[]>([]);

const connectWallet = async (type?: WalletType) => {
  connecting.value = true;
  error.value = null;
  
  try {
    let success = false;
    
    if (type === 'metamask') {
      success = await connectMetaMask();
    } else if (type === 'walletconnect') {
      success = await connectWalletConnect();
    } else if (type === 'coinbase') {
      success = await connectCoinbase();
    } else if (type === 'injected') {
      success = await connectInjected();
    } else {
      success = await connect();
    }
    
    if (success) {
      isOpen.value = false;
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('wallet-connected', {
        detail: { address: 'connected' }
      }));
    } else {
      error.value = walletError.value || 'Failed to connect wallet';
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to connect wallet';
  } finally {
    connecting.value = false;
  }
};

onMounted(async () => {
  const wallets = await detectAvailableWallets();
  availableWallets.value = wallets;
});

watch(walletError, (newError) => {
  if (newError) {
    error.value = newError;
  }
});
</script>

<style scoped>
.wallet-option {
  transition: all 0.2s ease;
}

.wallet-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

