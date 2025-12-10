<template>
  <v-card elevation="0" class="test-token-faucet">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-water-pump</v-icon>
      <span>Test Token Faucet</span>
    </v-card-title>
    
    <v-card-subtitle>
      Get test FIN tokens to try out the ERP system (like pool game tokens)
    </v-card-subtitle>

    <v-divider></v-divider>

    <v-card-text>
      <!-- Faucet Status -->
      <div v-if="faucetStatus" class="mb-4">
        <v-alert 
          :type="faucetStatus.canRequest ? 'success' : 'warning'" 
          variant="tonal"
          class="mb-3"
        >
          <div class="d-flex align-center justify-space-between">
            <div>
              <strong>{{ faucetStatus.canRequest ? 'Tokens Available' : 'Daily Limit Reached' }}</strong>
              <div class="text-caption mt-1">
                Daily Limit: {{ faucetStatus.dailyLimit }} FIN
                <span v-if="faucetStatus.timeUntilNextRequest">
                  | Next request in: {{ formatTimeUntil(faucetStatus.timeUntilNextRequest) }}
                </span>
              </div>
            </div>
          </div>
        </v-alert>
      </div>

      <!-- Token Packs (Pool Game Style) -->
      <div class="token-packs mb-4">
        <p class="text-body-2 text-medium-emphasis mb-3">Choose a token pack:</p>
        <div class="pack-grid">
          <v-card
            v-for="pack in tokenPacks"
            :key="pack.name"
            :class="['pack-card', { 'selected': selectedPack?.name === pack.name }]"
            @click="selectedPack = pack"
            variant="outlined"
          >
            <v-card-text class="text-center">
              <v-icon :size="32" color="primary" class="mb-2">{{ pack.icon }}</v-icon>
              <div class="text-h6 font-weight-bold">{{ pack.name }}</div>
              <div class="text-h5 text-primary mt-2">{{ pack.amount }} FIN</div>
              <div class="text-caption text-medium-emphasis mt-1">{{ pack.description }}</div>
            </v-card-text>
          </v-card>
        </div>
      </div>

      <!-- Request Button -->
      <v-btn
        block
        size="large"
        color="primary"
        variant="elevated"
        :loading="requesting"
        :disabled="!selectedPack || !canRequest || requesting"
        @click="requestTokens"
      >
        <v-icon start>mdi-water-pump</v-icon>
        Request {{ selectedPack?.amount || '0' }} FIN Tokens
      </v-btn>

      <!-- Result Message -->
      <v-alert
        v-if="resultMessage"
        :type="resultSuccess ? 'success' : 'error'"
        variant="tonal"
        class="mt-4"
        closable
        @click:close="resultMessage = null"
      >
        {{ resultMessage }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useEVMWallet } from '@/composables/useEVMWallet';
import { requestTestTokens, getFaucetStatus, getTestTokenPacks, type FaucetResponse } from '@/services/testTokenFaucet';

const { user, isConnected, chainId } = useEVMWallet();

const requesting = ref(false);
const resultMessage = ref<string | null>(null);
const resultSuccess = ref(false);
const selectedPack = ref(getTestTokenPacks()[1]); // Default to Standard Pack
const faucetStatus = ref<{
  canRequest: boolean;
  dailyLimit: string;
  lastRequestTime: number | null;
  timeUntilNextRequest: number | null;
} | null>(null);

const tokenPacks = getTestTokenPacks();

const canRequest = computed(() => {
  if (!isConnected.value || !user.value) return false;
  if (!faucetStatus.value) return true; // Assume can request if status not loaded
  return faucetStatus.value.canRequest;
});

const requestTokens = async () => {
  if (!selectedPack.value || !user.value) return;

  requesting.value = true;
  resultMessage.value = null;

  try {
    const response: FaucetResponse = await requestTestTokens(
      user.value.address,
      selectedPack.value.amount.replace(',', ''),
      chainId.value
    );

    if (response.success) {
      resultSuccess.value = true;
      resultMessage.value = response.message;
      // Refresh faucet status
      await loadFaucetStatus();
    } else {
      resultSuccess.value = false;
      resultMessage.value = response.message;
    }
  } catch (error: any) {
    resultSuccess.value = false;
    resultMessage.value = error.message || 'Failed to request test tokens';
  } finally {
    requesting.value = false;
  }
};

const loadFaucetStatus = async () => {
  if (!user.value || !chainId.value) return;

  try {
    const status = await getFaucetStatus(user.value.address, chainId.value);
    faucetStatus.value = status;
  } catch (error) {
    console.error('Failed to load faucet status:', error);
  }
};

const formatTimeUntil = (ms: number): string => {
  if (ms <= 0) return 'Now';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

onMounted(async () => {
  if (isConnected.value) {
    await loadFaucetStatus();
  }
});

// Watch for wallet connection
watch(isConnected, async (connected) => {
  if (connected) {
    await loadFaucetStatus();
  }
});
</script>

<style scoped>
.test-token-faucet {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
}

.pack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.pack-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.pack-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pack-card.selected {
  border-color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
}
</style>

