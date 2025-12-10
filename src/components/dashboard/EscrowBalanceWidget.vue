<template>
  <v-card class="escrow-widget" elevation="2">
    <v-card-title class="pa-4 d-flex align-items-center justify-space-between">
      <div class="d-flex align-items-center">
        <v-icon size="28" color="success" class="mr-2">mdi-shield-lock</v-icon>
        <span class="text-h6 font-weight-bold">Escrow Balance</span>
      </div>
      <v-btn icon size="small" variant="text" @click="refresh" :loading="loading">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading && !balance" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="text-caption mt-4">Loading escrow data...</p>
      </div>

      <!-- Balance Display -->
      <div v-else-if="balance" class="balance-content">
        <!-- Total Balance -->
        <div class="balance-section mb-4">
          <div class="balance-label text-caption text-medium-emphasis">Total in Escrow</div>
          <div class="balance-amount d-flex align-items-center">
            <v-icon size="32" color="warning" class="mr-2">mdi-currency-usd</v-icon>
            <span class="text-h3 font-weight-bold">{{ formatAmount(balance.currentBalance) }}</span>
            <span class="text-h6 ml-1 text-medium-emphasis">SIZ</span>
          </div>
        </div>

        <!-- Balance Breakdown -->
        <v-row class="mt-4">
          <v-col cols="12" sm="4">
            <v-card variant="tonal" color="success" class="pa-3">
              <div class="text-caption">Available</div>
              <div class="text-h6 font-weight-bold">{{ formatAmount(balance.available) }} SIZ</div>
              <v-progress-linear
                :model-value="availablePercent"
                color="success"
                height="4"
                class="mt-2"
                rounded
              ></v-progress-linear>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card variant="tonal" color="warning" class="pa-3">
              <div class="text-caption">Allocated</div>
              <div class="text-h6 font-weight-bold">{{ formatAmount(balance.allocated) }} SIZ</div>
              <v-progress-linear
                :model-value="allocatedPercent"
                color="warning"
                height="4"
                class="mt-2"
                rounded
              ></v-progress-linear>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card variant="tonal" color="primary" class="pa-3">
              <div class="text-caption">Released</div>
              <div class="text-h6 font-weight-bold">{{ formatAmount(balance.released) }} SIZ</div>
              <v-progress-linear
                :model-value="releasedPercent"
                color="primary"
                height="4"
                class="mt-2"
                rounded
              ></v-progress-linear>
            </v-card>
          </v-col>
        </v-row>

        <!-- Visual Distribution -->
        <div class="distribution-chart mt-4">
          <div class="chart-label text-caption text-medium-emphasis mb-2">Fund Distribution</div>
          <div class="distribution-bar">
            <div 
              class="bar-segment available" 
              :style="{ width: availablePercent + '%' }"
              v-if="availablePercent > 0"
            >
              <span v-if="availablePercent > 15" class="segment-label">{{ availablePercent.toFixed(0) }}%</span>
            </div>
            <div 
              class="bar-segment allocated" 
              :style="{ width: allocatedPercent + '%' }"
              v-if="allocatedPercent > 0"
            >
              <span v-if="allocatedPercent > 15" class="segment-label">{{ allocatedPercent.toFixed(0) }}%</span>
            </div>
            <div 
              class="bar-segment released" 
              :style="{ width: releasedPercent + '%' }"
              v-if="releasedPercent > 0"
            >
              <span v-if="releasedPercent > 15" class="segment-label">{{ releasedPercent.toFixed(0) }}%</span>
            </div>
          </div>
        </div>

        <!-- Warning if low balance -->
        <v-alert
          v-if="balance.available < 100 && balance.allocated > 0"
          type="warning"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <v-icon slot="prepend" size="20">mdi-alert</v-icon>
          <span class="text-caption">
            Low available balance. Consider adding more funds to cover upcoming payments.
          </span>
        </v-alert>

        <!-- Quick Actions -->
        <div class="quick-actions mt-4">
          <v-btn
            color="primary"
            variant="elevated"
            size="small"
            block
            @click="fundEscrow"
          >
            <v-icon start size="18">mdi-plus-circle</v-icon>
            Add Funds
          </v-btn>
          <v-btn
            variant="outlined"
            size="small"
            block
            class="mt-2"
            @click="viewTransactions"
          >
            <v-icon start size="18">mdi-history</v-icon>
            View Transactions
          </v-btn>
        </div>

        <!-- Last Updated -->
        <div class="text-caption text-medium-emphasis text-center mt-4">
          <v-icon size="14">mdi-clock-outline</v-icon>
          Last updated: {{ formatTime(lastUpdated) }}
        </div>
      </div>

      <!-- No Project State -->
      <div v-else class="text-center py-8">
        <v-icon size="64" color="grey">mdi-briefcase-off</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-4">No active project selected</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getEscrowBalance } from '@/services/paymentService'

interface Props {
  projectId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true,
  refreshInterval: 30000 // 30 seconds
})

const router = useRouter()

const loading = ref(false)
const balance = ref<any>(null)
const lastUpdated = ref<Date>(new Date())
let refreshTimer: NodeJS.Timeout | null = null

const availablePercent = computed(() => {
  if (!balance.value || balance.value.currentBalance === 0) return 0
  return (balance.value.available / balance.value.currentBalance) * 100
})

const allocatedPercent = computed(() => {
  if (!balance.value || balance.value.currentBalance === 0) return 0
  return (balance.value.allocated / balance.value.currentBalance) * 100
})

const releasedPercent = computed(() => {
  if (!balance.value || balance.value.currentBalance === 0) return 0
  return (balance.value.released / balance.value.currentBalance) * 100
})

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

const loadBalance = async () => {
  if (!props.projectId) return

  loading.value = true
  try {
    const data = await getEscrowBalance(props.projectId)
    balance.value = data
    lastUpdated.value = new Date()
  } catch (error) {
    console.error('Failed to load escrow balance:', error)
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await loadBalance()
}

const fundEscrow = () => {
  if (props.projectId) {
    router.push(`/projects/${props.projectId}/fund-escrow`)
  }
}

const viewTransactions = () => {
  if (props.projectId) {
    router.push(`/projects/${props.projectId}/transactions`)
  }
}

const startAutoRefresh = () => {
  if (props.autoRefresh && props.projectId) {
    refreshTimer = setInterval(loadBalance, props.refreshInterval)
  }
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

watch(() => props.projectId, async (newId) => {
  if (newId) {
    await loadBalance()
    stopAutoRefresh()
    startAutoRefresh()
  } else {
    balance.value = null
    stopAutoRefresh()
  }
})

onMounted(async () => {
  if (props.projectId) {
    await loadBalance()
    startAutoRefresh()
  }
})
</script>

<style scoped>
.escrow-widget {
  border-radius: 12px;
  overflow: hidden;
}

.balance-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.balance-section {
  text-align: center;
  padding: 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 12px;
}

.balance-amount {
  justify-content: center;
  margin-top: 8px;
}

.distribution-chart {
  padding: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 8px;
}

.distribution-bar {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.bar-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease;
  position: relative;
}

.bar-segment.available {
  background: rgb(var(--v-theme-success));
}

.bar-segment.allocated {
  background: rgb(var(--v-theme-warning));
}

.bar-segment.released {
  background: rgb(var(--v-theme-primary));
}

.segment-label {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
