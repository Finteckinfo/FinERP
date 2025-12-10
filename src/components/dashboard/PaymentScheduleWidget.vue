<template>
  <v-card class="payment-schedule-widget" elevation="2">
    <v-card-title class="pa-4 d-flex align-items-center justify-space-between">
      <div class="d-flex align-items-center">
        <v-icon size="28" color="primary" class="mr-2">mdi-calendar-clock</v-icon>
        <span class="text-h6 font-weight-bold">Upcoming Payments</span>
      </div>
      <v-btn icon size="small" variant="text" @click="refresh" :loading="loading">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="pa-4">
      <!-- Time Range Selector -->
      <v-tabs v-model="selectedRange" density="compact" color="primary" class="mb-4">
        <v-tab value="7days">Next 7 Days</v-tab>
        <v-tab value="30days">Next 30 Days</v-tab>
        <v-tab value="90days">Next 90 Days</v-tab>
      </v-tabs>

      <!-- Loading State -->
      <div v-if="loading && !payments" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="text-caption mt-4">Loading payment schedule...</p>
      </div>

      <!-- Payments List -->
      <div v-else-if="payments && payments.length > 0" class="payments-content">
        <!-- Summary Stats -->
        <v-row class="mb-4">
          <v-col cols="12" sm="4">
            <v-card variant="tonal" color="info" class="pa-3 text-center">
              <div class="text-caption">Total Amount</div>
              <div class="text-h6 font-weight-bold">{{ formatAmount(totalAmount) }} SIZ</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card variant="tonal" color="warning" class="pa-3 text-center">
              <div class="text-caption">Payments Due</div>
              <div class="text-h6 font-weight-bold">{{ payments.length }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card variant="tonal" color="success" class="pa-3 text-center">
              <div class="text-caption">Next Payment</div>
              <div class="text-h6 font-weight-bold">{{ formatDate(nextPaymentDate) }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Payment Timeline -->
        <v-timeline side="end" density="compact" class="payment-timeline">
          <v-timeline-item
            v-for="payment in payments"
            :key="payment.id"
            :dot-color="getPaymentColor(payment)"
            size="small"
          >
            <template v-slot:icon>
              <v-icon color="white" size="16">{{ getPaymentIcon(payment.type) }}</v-icon>
            </template>

            <v-card variant="outlined" class="payment-card pa-3">
              <div class="d-flex align-items-start justify-space-between">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center mb-1">
                    <v-chip :color="getPaymentColor(payment)" size="x-small" class="mr-2">
                      {{ payment.type }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">{{ formatDate(payment.date) }}</span>
                  </div>
                  <h4 class="text-subtitle-2 font-weight-bold mb-1">{{ payment.recipient }}</h4>
                  <p class="text-caption text-medium-emphasis mb-0">{{ payment.description }}</p>
                </div>
                <div class="payment-amount text-right ml-3">
                  <div class="text-h6 font-weight-bold">{{ formatAmount(payment.amount) }}</div>
                  <div class="text-caption">SIZ</div>
                </div>
              </div>

              <!-- Progress for recurring payments -->
              <div v-if="payment.type === 'SALARY' && payment.progress !== undefined" class="mt-2">
                <v-progress-linear
                  :model-value="payment.progress"
                  :color="getPaymentColor(payment)"
                  height="4"
                  rounded
                ></v-progress-linear>
                <div class="text-caption text-medium-emphasis mt-1">
                  Payment {{ payment.paymentNumber }} of {{ payment.totalPayments }}
                </div>
              </div>
            </v-card>
          </v-timeline-item>
        </v-timeline>

        <!-- Load More Button -->
        <div v-if="hasMore" class="text-center mt-4">
          <v-btn variant="outlined" size="small" @click="loadMore">
            Load More Payments
          </v-btn>
        </div>
      </div>

      <!-- No Payments State -->
      <div v-else class="text-center py-8">
        <v-icon size="64" color="grey">mdi-calendar-check</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-4">No upcoming payments scheduled</p>
        <v-btn variant="outlined" size="small" class="mt-2" @click="viewAllPayments">
          View All Payments
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getRecurringPayments } from '@/services/paymentService'

interface Props {
  projectId?: string
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10
})

const router = useRouter()

const loading = ref(false)
const payments = ref<any[]>([])
const selectedRange = ref('30days')
const hasMore = ref(false)

const totalAmount = computed(() => {
  return payments.value.reduce((sum, p) => sum + p.amount, 0)
})

const nextPaymentDate = computed(() => {
  if (payments.value.length === 0) return null
  return payments.value[0].date
})

const getPaymentColor = (payment: any): string => {
  const colors: Record<string, string> = {
    'SALARY': 'success',
    'TASK': 'primary',
    'MILESTONE': 'warning',
    'OVERSIGHT': 'info'
  }
  return colors[payment.type] || 'grey'
}

const getPaymentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'SALARY': 'mdi-cash-multiple',
    'TASK': 'mdi-check-circle',
    'MILESTONE': 'mdi-flag-checkered',
    'OVERSIGHT': 'mdi-eye-check'
  }
  return icons[type] || 'mdi-cash'
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'TBD'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `in ${diffDays} days`
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }).format(date)
}

const loadPayments = async () => {
  if (!props.projectId) return

  loading.value = true
  try {
    const data = await getRecurringPayments(props.projectId, { status: 'ACTIVE' })
    
    // Mock upcoming payments from recurring payment data
    // In real implementation, this would come from backend
    const upcomingPayments: any[] = []
    const now = new Date()
    
    if (data.payments && data.payments.length > 0) {
      data.payments.forEach((payment: any) => {
        const nextDate = new Date(payment.nextPaymentDate)
        const daysRange = selectedRange.value === '7days' ? 7 : selectedRange.value === '30days' ? 30 : 90
        const rangeDate = new Date(now.getTime() + daysRange * 24 * 60 * 60 * 1000)
        
        if (nextDate <= rangeDate) {
          upcomingPayments.push({
            id: payment.id,
            type: 'SALARY',
            date: payment.nextPaymentDate,
            recipient: `${payment.userRole.user.firstName} ${payment.userRole.user.lastName}`,
            description: `${payment.frequency} salary payment`,
            amount: payment.amount,
            paymentNumber: payment.paymentCount + 1,
            totalPayments: payment.totalPayments || 12,
            progress: payment.totalPayments ? ((payment.paymentCount + 1) / payment.totalPayments) * 100 : undefined
          })
        }
      })
    }
    
    payments.value = upcomingPayments.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ).slice(0, props.limit)
    
    hasMore.value = upcomingPayments.length > props.limit
  } catch (error) {
    console.error('Failed to load payment schedule:', error)
    payments.value = []
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await loadPayments()
}

const loadMore = () => {
  // Implementation for loading more payments
  console.log('Load more payments')
}

const viewAllPayments = () => {
  if (props.projectId) {
    router.push(`/projects/${props.projectId}/payments`)
  }
}

watch(() => props.projectId, async (newId) => {
  if (newId) {
    await loadPayments()
  } else {
    payments.value = []
  }
})

watch(selectedRange, () => {
  loadPayments()
})

onMounted(async () => {
  if (props.projectId) {
    await loadPayments()
  }
})
</script>

<style scoped>
.payment-schedule-widget {
  border-radius: 12px;
  overflow: hidden;
}

.payments-content {
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

.payment-timeline {
  max-height: 500px;
  overflow-y: auto;
}

.payment-card {
  transition: all 0.2s ease;
  border-radius: 8px;
}

.payment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(4px);
}

.payment-amount {
  min-width: 80px;
}
</style>
