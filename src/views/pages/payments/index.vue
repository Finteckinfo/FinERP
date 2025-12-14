<template>
  <div class="payments-page">
    <!-- Hero Section -->
    <div class="payments-hero">
      <RetroGrid />
      <div class="hero-content">
        <div class="hero-icon">
          <v-icon size="48">mdi-cash-multiple</v-icon>
        </div>
        <h1 class="hero-title">Payments & Earnings</h1>
        <p class="hero-subtitle">Manage your FIN token transactions and track earnings</p>
      </div>
    </div>

    <!-- Network Indicator -->
    <v-alert type="info" variant="tonal" class="mb-4">
      <div class="d-flex align-items-center">
        <v-icon class="mr-2">mdi-network</v-icon>
        <span>Current Network: <strong>{{ currentNetwork }}</strong></span>
      </div>
    </v-alert>

    <!-- Main Content -->
    <v-row>
      <!-- Earnings Overview -->
      <v-col cols="12" lg="8">
        <EarningsWidget />
      </v-col>

      <!-- Quick Actions -->
      <v-col cols="12" lg="4">
        <v-card elevation="0" class="payments-card quick-actions-card">
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <div class="quick-actions-grid">
              <v-btn
                color="primary"
                variant="outlined"
                block
                class="mb-2"
                @click="verifyWallet"
              >
                <v-icon start>mdi-shield-check</v-icon>
                Verify Wallet
              </v-btn>
              
              <v-btn
                color="success"
                variant="outlined"
                block
                class="mb-2"
                @click="viewTransactions"
              >
                <v-icon start>mdi-history</v-icon>
                Transaction History
              </v-btn>
              
              <v-btn
                color="info"
                variant="outlined"
                block
                @click="viewEscrows"
              >
                <v-icon start>mdi-shield-lock</v-icon>
                My Escrows
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Project Budgets (for managers/owners) -->
    <v-row v-if="userProjects.length > 0" class="mt-4">
      <v-col cols="12">
        <ProjectBudgetWidget :project-ids="userProjects" />
      </v-col>
    </v-row>

    <!-- Recent Transactions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="payments-card transactions-card">
          <v-card-title class="d-flex align-items-center">
            <v-icon class="mr-2" color="primary">mdi-history</v-icon>
            Recent Transactions
            <v-spacer />
            <v-btn
              variant="text"
              size="small"
              @click="refreshTransactions"
              :loading="loadingTransactions"
            >
              <v-icon start>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <!-- Loading State -->
            <div v-if="loadingTransactions" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
              <p class="text-body-2 mt-4">Loading transactions...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="transactions.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
              <p class="text-body-1 mt-4">No transactions yet</p>
            </div>

            <!-- Transactions Table -->
            <v-table v-else>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Task/Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in transactions" :key="tx.id">
                  <td>{{ formatDate(tx.submittedAt) }}</td>
                  <td>
                    <v-chip size="small" :color="getTypeColor(tx.type)">
                      {{ tx.type }}
                    </v-chip>
                  </td>
                  <td>{{ tx.taskTitle || 'N/A' }}</td>
                  <td class="font-weight-bold">
                    <span :class="tx.type === 'TASK_PAYMENT' ? 'text-success' : 'text-error'">
                      {{ tx.type === 'TASK_PAYMENT' ? '+' : '-' }}{{ tx.amount.toFixed(2) }} FIN
                    </span>
                  </td>
                  <td>
                    <v-chip 
                      size="small" 
                      :color="getStatusColor(tx.status)"
                    >
                      {{ tx.status }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      :href="getExplorerUrl(tx.txHash)"
                      target="_blank"
                      title="View on Algorand Explorer"
                    >
                      <v-icon size="18">mdi-open-in-new</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNextAuth } from '@/composables/useNextAuth';
import { RetroGrid } from '@/components/ui/retro-grid';
import EarningsWidget from '@/views/dashboards/default/components/EarningsWidget.vue';
import ProjectBudgetWidget from '@/views/dashboards/default/components/ProjectBudgetWidget.vue';
import { 
  getExplorerUrl, 
  type BlockchainTransaction 
} from '@/services/paymentService';

// Composables
const router = useRouter();
const { user } = useNextAuth();

// Reactive data
const currentNetwork = ref<string>('testnet');
const loadingTransactions = ref(true);
const transactions = ref<BlockchainTransaction[]>([]);
const userProjects = ref<string[]>([]);

// Load data
const loadPaymentsData = async () => {
  try {
    loadingTransactions.value = true;
    
    // Get current network
    currentNetwork.value = localStorage.getItem('algorand_network') || 'testnet';
    
    // TODO: Load user's transactions from API
    // const userTransactions = await getUserTransactions(user.value?.id);
    // transactions.value = userTransactions;
    
    // TODO: Load user's projects (where they are owner/manager)
    // const projects = await getUserProjects(user.value?.id);
    // userProjects.value = projects.map(p => p.id);
    
    // Mock data for now
    transactions.value = [];
    userProjects.value = [];
    
  } catch (error) {
    console.error('Failed to load payments data:', error);
  } finally {
    loadingTransactions.value = false;
  }
};

const refreshTransactions = () => {
  loadPaymentsData();
};

const verifyWallet = () => {
  // Navigate to wallet verification
  router.push('/settings?tab=wallet');
};

const viewTransactions = () => {
  // Scroll to transactions section
  const element = document.querySelector('.v-table');
  element?.scrollIntoView({ behavior: 'smooth' });
};

const viewEscrows = () => {
  // Navigate to projects page
  router.push('/projects');
};

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'TASK_PAYMENT': return 'success';
    case 'DEPOSIT': return 'info';
    case 'REFUND': return 'warning';
    case 'WITHDRAWAL': return 'error';
    default: return 'grey';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'error';
    default: return 'grey';
  }
};

// Lifecycle
onMounted(() => {
  loadPaymentsData();
});
</script>

<style scoped>
.payments-page {
  padding: 0;
}

.payments-hero {
  position: relative;
  background: transparent;
  padding: 3rem 2rem;
  text-align: center;
  overflow: hidden;
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  margin: 1rem 1.5rem;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1rem;
}

.hero-icon .v-icon {
  color: var(--erp-accent-green);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

.quick-actions-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payments-card {
  border: 1px solid color-mix(in srgb, var(--erp-border) 80%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--erp-surface) 95%, #ffffff);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.payments-card:hover {
  border-color: color-mix(in srgb, var(--erp-primary) 35%, transparent);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

:global(.dark-theme) .payments-card {
  background: rgba(9, 13, 24, 0.9);
  border-color: rgba(148, 163, 184, 0.25);
  box-shadow: 0 24px 45px rgba(0, 0, 0, 0.65);
}

:global(.dark-theme) .payments-card:hover {
  border-color: color-mix(in srgb, var(--erp-primary) 45%, transparent);
}

.quick-actions-card .v-btn {
  border-radius: 12px;
  border-color: color-mix(in srgb, currentColor 40%, transparent);
}

:global(.dark-theme) .quick-actions-card .v-btn {
  background: rgba(148, 163, 184, 0.1);
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.35);
}

.transactions-card .v-table {
  background: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .payments-hero {
    padding: 1.5rem 1rem;
    margin: 0.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .hero-icon .v-icon {
    font-size: 36px !important;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .v-table {
    font-size: 0.75rem;
  }
}
</style>

