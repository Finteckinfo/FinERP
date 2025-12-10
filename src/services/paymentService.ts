// Payment Service - Handles all escrow and payment API calls
import { api } from './projectApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ============================================
// SIZCOIN ASSET CONFIGURATION
// ============================================
/**
 * SIZCOIN - The official project token
 * Asset ID: 2905622564
 * Created on Algorand MainNet at Block #48747393
 */
export const SIZCOIN_CONFIG = {
  ASSET_ID: 2905622564,
  UNIT_NAME: 'SIZ',
  DECIMALS: 2,
  ASSET_URL: 'https://ipfs.io/ipfs/bafybeiex5cvfmggxjyjaxpdxevyhhzvrrsjw5xnee2ydw5metghl3y6fvq',
  CREATED_BLOCK: 48747393,
  DEFAULT_FROZEN: true,
} as const;

/**
 * Formats SIZCOIN amount with proper decimals
 * @param microAmount - Amount in micro units (1 SIZ = 100 micro units)
 */
export function formatSIZCOIN(microAmount: number): string {
  const sizAmount = microAmount / Math.pow(10, SIZCOIN_CONFIG.DECIMALS);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: SIZCOIN_CONFIG.DECIMALS,
    maximumFractionDigits: SIZCOIN_CONFIG.DECIMALS
  }).format(sizAmount);
}

/**
 * Converts SIZ to micro units for blockchain transactions
 * @param sizAmount - Amount in SIZ
 */
export function sizToMicroUnits(sizAmount: number): number {
  return Math.floor(sizAmount * Math.pow(10, SIZCOIN_CONFIG.DECIMALS));
}

/**
 * Converts micro units to SIZ
 * @param microAmount - Amount in micro units
 */
export function microUnitsToSiz(microAmount: number): number {
  return microAmount / Math.pow(10, SIZCOIN_CONFIG.DECIMALS);
}

// ============================================
// ESCROW MANAGEMENT
// ============================================

export interface EscrowAccount {
  escrowAddress: string;
  currentBalance: number;
  status: string;
}

export interface EscrowBalance {
  balance: number;
  obligations: {
    pendingTasks: number;
    processingTransfers: number;
    total: number;
  };
  released: number;
  netAvailable: number;
  escrowAddress?: string;
  funded?: boolean;
}

/**
 * Creates an Algorand escrow account for a project
 * Now includes SIZCOIN asset information
 */
export async function createProjectEscrow(projectId: string): Promise<EscrowAccount & {
  assetId: number;
  assetName: string;
  instructions: string;
}> {
  const response = await api.post(`/projects/${projectId}/escrow/create`);
  return response.data;
}

/**
 * Opts escrow account into SIZCOIN asset
 * This must be called after creating escrow and before receiving SIZCOIN
 */
export async function optInEscrowToSIZCOIN(projectId: string): Promise<{
  success: boolean;
  assetId: number;
  txHash: string;
}> {
  const response = await api.post(`/projects/${projectId}/escrow/opt-in`);
  return response.data;
}

/**
 * Records a deposit transaction to project escrow
 * Now verifies SIZCOIN asset transactions (not ALGO)
 */
export async function depositToEscrow(projectId: string, txHash: string, amount: number): Promise<{
  success: boolean;
  verified: boolean;
  assetId: number;
  amount: number;
  message: string;
}> {
  const response = await api.post(`/projects/${projectId}/escrow/deposit`, {
    txHash,
    amount
  });
  return response.data;
}

/**
 * Gets current escrow balance for a project
 */
export async function getEscrowBalance(projectId: string): Promise<EscrowBalance> {
  const response = await api.get(`/projects/${projectId}/escrow/balance`);
  return response.data;
}

/**
 * Gets all escrow transactions for a project
 */
export async function getEscrowTransactions(projectId: string, filters?: {
  type?: string;
  status?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await api.get(`/projects/${projectId}/escrow/transactions?${params}`);
  return response.data;
}

// ============================================
// TASK PAYMENTS
// ============================================

export interface TaskPaymentStatus {
  taskId: string;
  paymentAmount: number;
  paymentStatus: 'PENDING' | 'ALLOCATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  txHash?: string;
  confirmations?: number;
}

/**
 * Approves a task and triggers payment release
 * Now checks employee SIZCOIN opt-in before payment
 * Also processes manager oversight fees automatically
 */
export async function approveAndPayTask(taskId: string): Promise<{
  success: boolean;
  txHash?: string;
  jobId?: string;
  message: string;
  employeeOptedIn?: boolean;
  assetId?: number;
  taskId?: string;
  employeePayment?: {
    amount: number;
    employeeEmail: string;
    jobId: string;
  };
  oversightPayments?: Array<{
    managerId: string;
    managerName: string;
    amount: number;
    rate: number;
    jobId: string;
  }>;
}> {
  const response = await api.post(`/tasks/${taskId}/approve`);
  return response.data;
}

/**
 * Gets payment status for a specific task
 */
export async function getTaskPaymentStatus(taskId: string): Promise<TaskPaymentStatus> {
  const response = await api.get(`/tasks/${taskId}/payment-status`);
  return response.data;
}

// ============================================
// PAYMENT CONFIGURATION
// ============================================

export interface PaymentConfig {
  id: string;
  paymentType: 'PER_TASK' | 'SALARY' | 'OVERSIGHT' | 'MILESTONE' | 'HYBRID';
  salaryAmount?: number;
  salaryFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  oversightRate?: number;
  milestoneAmount?: number;
  nextPayment?: {
    date: string;
    amount: number;
  };
  totalEarned: number;
}

/**
 * Creates or updates payment configuration for a user role
 */
export async function setUserRolePaymentConfig(
  userRoleId: string,
  config: {
    paymentType: string;
    salaryAmount?: number;
    salaryFrequency?: string;
    oversightRate?: number;
    milestoneAmount?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<PaymentConfig> {
  const response = await api.post(`/user-roles/${userRoleId}/payment-config`, config);
  return response.data;
}

/**
 * Gets payment configuration for a user role
 */
export async function getUserRolePaymentConfig(userRoleId: string): Promise<PaymentConfig | null> {
  try {
    const response = await api.get(`/user-roles/${userRoleId}/payment-config`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// ============================================
// RECURRING PAYMENTS (SALARIES)
// ============================================

export interface RecurringPayment {
  id: string;
  userRole: {
    user: {
      firstName: string;
      lastName: string;
    };
    role: string;
  };
  amount: number;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  nextPaymentDate: string;
  lastPaidDate?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  totalPaid: number;
  paymentCount: number;
}

export interface RecurringPaymentsSummary {
  payments: RecurringPayment[];
  totalMonthly: number;
  upcomingPayments: Array<{
    date: string;
    amount: number;
    recipient: string;
  }>;
}

/**
 * Creates a recurring payment (salary)
 */
export async function createRecurringPayment(
  projectId: string,
  config: {
    userRoleId: string;
    amount: number;
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    startDate: string;
    endDate?: string;
  }
): Promise<{
  id: string;
  amount: number;
  frequency: string;
  nextPaymentDate: string;
  estimatedTotal: number;
  fundsAllocated: number;
}> {
  const response = await api.post(`/projects/${projectId}/recurring-payments`, config);
  return response.data;
}

/**
 * Gets all recurring payments for a project
 */
export async function getRecurringPayments(
  projectId: string,
  filters?: {
    status?: string;
    userId?: string;
  }
): Promise<RecurringPaymentsSummary> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.userId) params.append('userId', filters.userId);
  
  const response = await api.get(`/projects/${projectId}/recurring-payments?${params}`);
  return response.data;
}

/**
 * Pauses a recurring payment
 */
export async function pauseRecurringPayment(recurringPaymentId: string): Promise<{
  success: boolean;
  status: string;
}> {
  const response = await api.patch(`/recurring-payments/${recurringPaymentId}/pause`);
  return response.data;
}

/**
 * Resumes a paused recurring payment
 */
export async function resumeRecurringPayment(recurringPaymentId: string): Promise<{
  success: boolean;
  status: string;
}> {
  const response = await api.patch(`/recurring-payments/${recurringPaymentId}/resume`);
  return response.data;
}

/**
 * Cancels a recurring payment and refunds allocated funds
 */
export async function cancelRecurringPayment(recurringPaymentId: string): Promise<{
  success: boolean;
  refundedAmount: number;
}> {
  const response = await api.delete(`/recurring-payments/${recurringPaymentId}/cancel`);
  return response.data;
}

// ============================================
// ENHANCED ESCROW FUNDING
// ============================================

export interface FundingNeeded {
  currentBalance: number;
  allocated: number;
  available: number;
  upcoming: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
  breakdown: {
    tasks: number;
    salaries: number;
  };
  recommended: number;
  critical: boolean;
}

/**
 * Gets funding needed calculation for project escrow
 */
export async function getEscrowFundingNeeded(projectId: string): Promise<FundingNeeded> {
  const response = await api.get(`/projects/${projectId}/escrow/funding-needed`);
  return response.data;
}

/**
 * Simplified escrow funding endpoint
 */
export async function fundEscrow(
  projectId: string,
  txHash: string,
  amount: number
): Promise<{
  success: boolean;
  verified: boolean;
  currentBalance: number;
  txHash: string;
}> {
  const response = await api.post(`/projects/${projectId}/escrow/fund`, {
    txHash,
    amount
  });
  return response.data;
}

// ============================================
// WALLET MANAGEMENT
// ============================================

export interface UserWalletInfo {
  walletAddress: string;
  verified: boolean;
  verifiedAt?: string;
  sizOptedIn?: boolean; // SIZCOIN opt-in status
  assetId?: number; // Should be 2905622564
}

/**
 * Verifies user owns the wallet address
 * Now also validates SIZCOIN opt-in status
 */
export async function verifyWallet(
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ 
  verified: boolean;
  sizOptedIn?: boolean;
  assetId?: number;
  message?: string;
}> {
  const response = await api.post('/users/wallet/verify', {
    walletAddress,
    signature,
    message
  });
  return response.data;
}

/**
 * Gets current user's wallet info
 */
export async function getUserWallet(): Promise<UserWalletInfo | null> {
  const response = await api.get('/users/wallet');
  return response.data;
}

/**
 * Updates user's wallet address
 */
export async function updateUserWallet(walletAddress: string): Promise<UserWalletInfo> {
  const response = await api.patch('/users/wallet', { walletAddress });
  return response.data;
}

// ============================================
// TRANSACTIONS & ANALYTICS
// ============================================

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  type: 'DEPOSIT' | 'TASK_PAYMENT' | 'REFUND' | 'WITHDRAWAL';
  amount: number;
  fee?: number;
  fromAddress: string;
  toAddress: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockNumber?: number;
  confirmations: number;
  note?: string;
  taskId?: string;
  taskTitle?: string;
  employeeName?: string;
  submittedAt: string;
  confirmedAt?: string;
}

/**
 * Gets transaction details by hash
 */
export async function getTransaction(txHash: string): Promise<BlockchainTransaction> {
  const response = await api.get(`/transactions/${txHash}`);
  return response.data;
}

/**
 * Gets user's earnings summary
 */
export async function getUserEarnings(userId: string): Promise<{
  total: number;
  pending: number;
  paid: number;
  processing: number;
  transactions: BlockchainTransaction[];
}> {
  const response = await api.get(`/users/${userId}/earnings`);
  return response.data;
}

/**
 * Gets payment summary for a project
 */
export interface ProjectPayoutSummary {
  projectId?: string;
  projectName?: string;
  escrow: {
    address?: string;
    funded: boolean;
    status?: string;
    balance: number;
  };
  payouts: {
    totalRecipients: number;
    totals: {
      assigned: number;
      pending: number;
      processing: number;
      paid: number;
      oversight: {
        paid: number;
        processing: number;
      };
    };
    statusBreakdown: {
      pending: number;
      allocated: number;
      processing: number;
      paid: number;
      failed: number;
    };
    byRecipient: Array<{
      id: string;
      userId?: string;
      name: string;
      email?: string | null;
      walletAddress?: string | null;
      totals: {
        assigned: number;
        pending: number;
        processing: number;
        paid: number;
      };
      completedTasks: number;
      taskCount: number;
      history: Array<{
        reference: string;
        amount: number;
        status: string;
        type: string;
        txHash?: string;
        confirmedAt?: string;
      }>;
    }>;
    recent: Array<{
      txHash: string;
      type: string;
      amount: number;
      status: string;
      to: {
        id: string;
        name: string;
        email?: string | null;
      };
      reference: string;
      confirmedAt?: string | null;
    }>;
  };
  tasksSummary: {
    totalWithPayments: number;
    recentPayments: Array<{
      taskId: string;
      taskTitle: string;
      amount: number | null;
      employee: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
      } | null;
      txHash?: string | null;
      paidAt?: string | null;
    }>;
  };
}

export async function getProjectPaymentSummary(projectId: string): Promise<ProjectPayoutSummary> {
  const response = await api.get(`/projects/${projectId}/payment-summary`);
  return response.data;
}

/**
 * Gets all transactions for a project
 */
export async function getProjectTransactions(
  projectId: string,
  filters?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  transactions: BlockchainTransaction[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const response = await api.get(`/projects/${projectId}/transactions?${params}`);
  return response.data;
}

// ============================================
// HELPER FUNCTIONS
// ============================================


/**
 * Gets payment status color for UI
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'grey',
    ALLOCATED: 'info',
    PROCESSING: 'warning',
    PAID: 'success',
    FAILED: 'error',
    REFUNDED: 'secondary'
  };
  return colors[status] || 'grey';
}

/**
 * Gets payment status label
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Not Allocated',
    ALLOCATED: 'Reserved',
    PROCESSING: 'Processing',
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded'
  };
  return labels[status] || status;
}

/**
 * Gets Algorand explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network?: 'mainnet' | 'testnet'): string {
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://explorer.perawallet.app/tx/'
    : 'https://testnet.explorer.perawallet.app/tx/';
  return baseUrl + txHash;
}

/**
 * Gets Algorand explorer URL for address
 */
export function getAddressExplorerUrl(address: string, network?: 'mainnet' | 'testnet'): string {
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://explorer.perawallet.app/address/'
    : 'https://testnet.explorer.perawallet.app/address/';
  return baseUrl + address;
}

/**
 * Gets project budget summary for dashboard widget
 */
export interface ProjectBudgetSummary {
  total: number;
  allocated: number;
  released: number;
  available: number;
  utilizationPercent: number;
}

export async function getProjectBudget(projectId: string): Promise<ProjectBudgetSummary> {
  const escrowBalance = await getEscrowBalance(projectId);
  
  const total = escrowBalance.balance;
  const allocated = escrowBalance.obligations.total;
  const released = escrowBalance.released;
  const available = escrowBalance.netAvailable;
  const utilizationPercent = total > 0 ? (allocated / total) * 100 : 0;
  
  return {
    total,
    allocated,
    released,
    available,
    utilizationPercent
  };
}

