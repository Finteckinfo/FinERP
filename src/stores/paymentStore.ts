// Payment Store - Manages payment-related state
import { ref, computed } from 'vue';
import type { EscrowBalance, TaskPaymentStatus, BlockchainTransaction } from '@/services/paymentService';

// Escrow balances by project ID
const escrowBalances = ref<Map<string, EscrowBalance>>(new Map());

// Task payment statuses
const taskPayments = ref<Map<string, TaskPaymentStatus>>(new Map());

// Recent transactions
const recentTransactions = ref<BlockchainTransaction[]>([]);

// Loading states
const isLoadingEscrow = ref(false);
const isLoadingPayment = ref(false);

// ============================================
// ESCROW MANAGEMENT
// ============================================

export function setEscrowBalance(projectId: string, balance: EscrowBalance) {
  escrowBalances.value.set(projectId, balance);
}

export function getEscrowBalance(projectId: string): EscrowBalance | undefined {
  return escrowBalances.value.get(projectId);
}

export const escrowBalanceComputed = computed(() => {
  return (projectId: string) => escrowBalances.value.get(projectId);
});

// ============================================
// TASK PAYMENTS
// ============================================

export function setTaskPayment(taskId: string, payment: TaskPaymentStatus) {
  taskPayments.value.set(taskId, payment);
}

export function getTaskPayment(taskId: string): TaskPaymentStatus | undefined {
  return taskPayments.value.get(taskId);
}

export function updateTaskPaymentStatus(taskId: string, status: TaskPaymentStatus['paymentStatus']) {
  const payment = taskPayments.value.get(taskId);
  if (payment) {
    payment.paymentStatus = status;
    taskPayments.value.set(taskId, payment);
  }
}

// ============================================
// TRANSACTIONS
// ============================================

export function setRecentTransactions(transactions: BlockchainTransaction[]) {
  recentTransactions.value = transactions;
}

export function addTransaction(transaction: BlockchainTransaction) {
  recentTransactions.value.unshift(transaction);
  // Keep only last 50
  if (recentTransactions.value.length > 50) {
    recentTransactions.value = recentTransactions.value.slice(0, 50);
  }
}

export const transactions = computed(() => recentTransactions.value);

// ============================================
// LOADING STATES
// ============================================

export function setLoadingEscrow(loading: boolean) {
  isLoadingEscrow.value = loading;
}

export function setLoadingPayment(loading: boolean) {
  isLoadingPayment.value = loading;
}

export const loadingEscrow = computed(() => isLoadingEscrow.value);
export const loadingPayment = computed(() => isLoadingPayment.value);

// ============================================
// HELPERS
// ============================================

/**
 * Clears all payment data (useful for logout)
 */
export function clearPaymentStore() {
  escrowBalances.value.clear();
  taskPayments.value.clear();
  recentTransactions.value = [];
  isLoadingEscrow.value = false;
  isLoadingPayment.value = false;
}

/**
 * Gets total earnings for current user
 */
export const totalUserEarnings = computed(() => {
  let total = 0;
  taskPayments.value.forEach(payment => {
    if (payment.paymentStatus === 'PAID') {
      total += payment.paymentAmount;
    }
  });
  return total;
});

/**
 * Gets pending earnings for current user
 */
export const pendingUserEarnings = computed(() => {
  let total = 0;
  taskPayments.value.forEach(payment => {
    if (payment.paymentStatus === 'ALLOCATED' || payment.paymentStatus === 'PROCESSING') {
      total += payment.paymentAmount;
    }
  });
  return total;
});

