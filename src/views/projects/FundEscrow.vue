<template>
  <div class="fund-escrow-page">
    <v-container fluid class="pa-0">
      <!-- Hero Section -->
      <div class="funding-hero">
        <RetroGrid />
        <div class="hero-content">
          <div class="hero-icon">
            <v-icon size="48">mdi-wallet</v-icon>
          </div>
          <h1 class="hero-title">Fund Project Escrow</h1>
          <p class="hero-subtitle">Secure funds for {{ projectName }}</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4">Loading escrow details...</p>
      </div>

      <!-- Error State -->
      <v-alert v-if="error" type="error" class="ma-4">
        {{ error }}
      </v-alert>

      <!-- Main Content -->
      <div v-if="!loading && escrowData" class="main-content">
        <v-row>
          <!-- Left: Escrow Info & Funding Options -->
          <v-col cols="12" md="8">
            <!-- Escrow Information Card -->
            <v-card class="mb-4" elevation="0">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-shield-lock</v-icon>
                Escrow Account Details
              </v-card-title>
              
              <v-card-text>
                <div class="escrow-details">
                  <!-- Escrow Address -->
                  <div class="detail-row">
                    <span class="label">Escrow Address:</span>
                    <div class="value-with-actions">
                      <code class="escrow-address">{{ escrowData.escrowAddress }}</code>
                      <v-btn
                        size="small"
                        variant="text"
                        @click="copyAddress"
                        :color="copied ? 'success' : 'primary'"
                      >
                        <v-icon size="18">{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
                      </v-btn>
                      <v-btn
                        size="small"
                        variant="text"
                        @click="showQR = true"
                      >
                        <v-icon size="18">mdi-qrcode</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Asset Info -->
                  <div class="detail-row">
                    <span class="label">Asset:</span>
                    <div class="value-with-actions">
                      <span class="ml-2 text-caption">Token ID: {{ FIN_TOKEN_CONFIG.ASSET_ID }}</span>
                    </div>
                  </div>

                  <!-- Current Balance -->
                  <div class="detail-row balance-row">
                    <span class="label">Current Balance:</span>
                    <span class="balance-value">{{ formatAmount(currentBalance) }} FIN</span>
                  </div>

                  <!-- Obligation Details -->
                  <div class="detail-row">
                    <span class="label">Pending Task Hold:</span>
                    <span class="value">{{ formatAmount(pendingHold) }} FIN</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Processing Transfers:</span>
                    <span class="value">{{ formatAmount(processingHold) }} FIN</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Total Obligations:</span>
                    <span class="value">{{ formatAmount(obligationsTotal) }} FIN</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Net Available:</span>
                    <span :class="['value', netAvailable > 0 ? 'text-success' : 'text-warning']">
                      {{ formatAmount(netAvailable) }} FIN
                    </span>
                  </div>

                  <!-- Remaining -->
                  <div class="detail-row remaining-row">
                    <span class="label">Recommended Top-up:</span>
                    <span :class="['value', remainingAmount > 0 ? 'text-warning' : 'text-success']">
                      {{ formatAmount(remainingAmount) }} FIN
                    </span>
                  </div>
                </div>
                
                <!-- Funding Needed Alert -->
                <div v-if="fundingNeeded && fundingNeeded.critical" class="mt-4">
                  <v-alert type="warning" variant="tonal" class="mb-3">
                    <template #title>
                      <div class="d-flex align-center">
                        <v-icon class="mr-2">mdi-alert-circle</v-icon>
                        Critical Low Balance
                      </div>
                    </template>
                    <div class="mt-2">
                      <p class="mb-2">
                        <strong>Escrow balance is critically low!</strong> 
                        Upcoming payments may fail without additional funding.
                      </p>
                      
                      <div v-if="fundingNeeded.upcoming" class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Upcoming Payments:</h4>
                        <div class="text-caption">
                          <div>Next 7 days: {{ formatAmount(fundingNeeded.upcoming.next7Days) }} FIN</div>
                          <div>Next 30 days: {{ formatAmount(fundingNeeded.upcoming.next30Days) }} FIN</div>
                          <div>Next 90 days: {{ formatAmount(fundingNeeded.upcoming.next90Days) }} FIN</div>
                        </div>
                      </div>
                      
                      <div class="d-flex align-center gap-2">
                        <v-btn 
                          color="warning" 
                          variant="tonal" 
                          size="small"
                          @click="sendAmount = fundingNeeded.recommended"
                        >
                          <v-icon size="16" class="mr-1">mdi-cash-plus</v-icon>
                          Fund {{ formatAmount(fundingNeeded.recommended) }} FIN
                        </v-btn>
                      </div>
                    </div>
                  </v-alert>
                </div>

                <!-- Progress Bar -->
                <v-progress-linear
                  :model-value="fundingProgress"
                  :color="fundingProgress >= 100 ? 'success' : 'warning'"
                  height="12"
                  rounded
                  class="mt-4"
                >
                  <template v-slot:default>
                    <strong>{{ fundingProgress.toFixed(0) }}% Funded</strong>
                  </template>
                </v-progress-linear>
              </v-card-text>
            </v-card>

            <!-- Funding Options -->
            <v-card elevation="0">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="success">mdi-cash-plus</v-icon>
                Add Funds to Escrow
              </v-card-title>

              <v-card-text>
                <v-tabs v-model="fundingTab" bg-color="transparent">
                  <v-tab value="wallet">
                    <v-icon start>mdi-wallet</v-icon>
                    From Wallet
                  </v-tab>
                  <v-tab value="manual">
                    <v-icon start>mdi-check-circle</v-icon>
                    Already Sent
                  </v-tab>
                </v-tabs>

                <v-window v-model="fundingTab" class="mt-4">
                  <!-- Send from Wallet -->
                  <v-window-item value="wallet">
                    <v-alert v-if="!isWalletConnected" type="info" variant="tonal" class="mb-4">
                      <v-icon start>mdi-alert-circle</v-icon>
                      Please connect your wallet first
                      <template v-slot:append>
                        <v-btn size="small" @click="connectWallet">Connect Wallet</v-btn>
                      </template>
                    </v-alert>

                    <div v-else>
                      <v-text-field
                        v-model.number="sendAmount"
                        label="Amount to Send"
                        type="number"
                        :min="0"
                        :step="0.01"
                        suffix="FIN"
                        variant="outlined"
                        class="mb-4"
                        hint="Enter the amount of FIN to send from your wallet"
                        persistent-hint
                      >
                        <template v-slot:append-inner>
                          <v-btn
                            size="small"
                            variant="text"
                            @click="sendAmount = remainingAmount"
                          >
                            Send All
                          </v-btn>
                        </template>
                      </v-text-field>

                      <v-alert type="info" variant="tonal" class="mb-4">
                        <div class="text-body-2">
                          <strong>Connected Wallet:</strong> {{ connectedWalletAddress }}
                        </div>
                        <div class="text-body-2 mt-2">
                          <strong>Sending to:</strong> {{ escrowData.escrowAddress }}
                        </div>
                        <div class="text-body-2 mt-2">
                          <strong>Amount:</strong> {{ formatAmount(sendAmount) }} FIN
                        </div>
                      </v-alert>

                      <v-btn
                        block
                        color="primary"
                        size="large"
                        :loading="sending"
                        :disabled="sendAmount <= 0 || !isWalletConnected"
                        @click="sendFromWallet"
                      >
                        <v-icon start>mdi-send</v-icon>
                        Send {{ formatAmount(sendAmount) }} FIN to Escrow
                      </v-btn>
                    </div>
                  </v-window-item>

                  <!-- Manual Confirmation -->
                  <v-window-item value="manual">
                    <p class="text-body-2 mb-4">
                      If you've already sent FIN to the escrow address, enter the transaction hash below to confirm the deposit.
                    </p>

                    <v-text-field
                      v-model="manualTxHash"
                      label="Transaction Hash"
                      placeholder="Enter Algorand transaction hash"
                      variant="outlined"
                      class="mb-2"
                      hint="The TX hash from your wallet after sending FIN"
                      persistent-hint
                    />

                    <v-text-field
                      v-model.number="manualAmount"
                      label="Amount Sent"
                      type="number"
                      :min="0"
                      :step="0.01"
                      suffix="FIN"
                      variant="outlined"
                      class="mb-4"
                    />

                    <v-btn
                      block
                      color="success"
                      size="large"
                      :loading="verifying"
                      :disabled="!manualTxHash || manualAmount <= 0"
                      @click="confirmManualDeposit"
                    >
                      <v-icon start>mdi-check-circle</v-icon>
                      Verify & Confirm Deposit
                    </v-btn>
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right: Quick Stats & Help -->
          <v-col cols="12" md="4">
            <!-- Quick Stats -->
            <v-card class="mb-4" elevation="0">
              <v-card-title>Funding Summary</v-card-title>
              <v-card-text>
                <div class="stat-grid">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <v-icon color="primary">mdi-scale-balance</v-icon>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Total Obligations</span>
                      <span class="stat-value">{{ formatAmount(obligationsTotal) }} FIN</span>
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-icon">
                      <v-icon color="success">mdi-check-circle</v-icon>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Escrow Balance</span>
                      <span class="stat-value">{{ formatAmount(currentBalance) }} FIN</span>
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-icon">
                      <v-icon color="warning">mdi-alert</v-icon>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Recommended Top-up</span>
                      <span class="stat-value">{{ formatAmount(remainingAmount) }} FIN</span>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Help Card -->
            <v-card elevation="0">
              <v-card-title>
                <v-icon start color="info">mdi-help-circle</v-icon>
                How it Works
              </v-card-title>
              <v-card-text>
                <div class="help-steps">
                  <div class="help-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <strong>Send FIN</strong>
                      <p>Use your connected wallet or send manually to the escrow address</p>
                    </div>
                  </div>

                  <div class="help-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <strong>Confirm Transaction</strong>
                      <p>System verifies the transaction on Algorand blockchain</p>
                    </div>
                  </div>

                  <div class="help-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <strong>Start Assigning Tasks</strong>
                      <p>Once funded, you can assign paid tasks to your team</p>
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="text-caption text-medium-emphasis">
                  <v-icon size="14">mdi-shield-lock</v-icon>
                  Funds are held securely in blockchain escrow and released only when tasks are approved.
                </div>
              </v-card-text>
            </v-card>

            <!-- Skip Option -->
            <v-btn
              block
              variant="text"
              class="mt-4"
              @click="skipFunding"
            >
              Skip for Now
            </v-btn>
          </v-col>
        </v-row>

        <!-- Recent Transactions -->
        <v-row v-if="transactions.length > 0" class="mt-4">
          <v-col cols="12">
            <v-card elevation="0">
              <v-card-title>Recent Transactions</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item
                    v-for="tx in transactions"
                    :key="tx.id"
                    :href="getExplorerUrl(tx.txHash)"
                    target="_blank"
                  >
                    <template v-slot:prepend>
                      <v-icon :color="tx.status === 'CONFIRMED' ? 'success' : 'warning'">
                        {{ tx.status === 'CONFIRMED' ? 'mdi-check-circle' : 'mdi-clock-outline' }}
                      </v-icon>
                    </template>

                    <v-list-item-title>
                      +{{ formatAmount(tx.amount) }} FIN
                    </v-list-item-title>
                    
                    <v-list-item-subtitle>
                      {{ formatDate(tx.submittedAt) }} · {{ tx.status }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-icon size="18">mdi-open-in-new</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>

    <!-- QR Code Dialog -->
    <v-dialog v-model="showQR" max-width="400">
      <v-card>
        <v-card-title>Scan to Fund Escrow</v-card-title>
        <v-card-text class="text-center">
          <div class="qr-placeholder">
            <v-icon size="120" color="grey-lighten-1">mdi-qrcode</v-icon>
            <p class="text-caption mt-2">QR Code: {{ escrowData?.escrowAddress }}</p>
          </div>
          <p class="text-body-2 mt-4">
            Scan this QR code with your wallet to send FIN to the escrow address.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showQR = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccess" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-success">
          <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
          Funding Successful!
        </v-card-title>
        <v-card-text>
          <v-alert type="success" variant="tonal" class="mb-4">
            <div class="text-body-2">
              <strong>Amount Received:</strong> {{ formatAmount(lastDepositAmount) }} FIN
            </div>
            <div class="text-body-2 mt-2">
              <strong>New Balance:</strong> {{ formatAmount(currentBalance) }} FIN
            </div>
            <div class="text-body-2 mt-2">
              <strong>Transaction:</strong> 
              <a :href="getExplorerUrl(lastTxHash)" target="_blank" class="ml-1">
                {{ lastTxHash?.substring(0, 10) }}... <v-icon size="14">mdi-open-in-new</v-icon>
              </a>
            </div>
          </v-alert>

          <p class="text-body-2">
            Your escrow is now funded and ready! You can start assigning paid tasks to your team.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            @click="goToProject"
          >
            Go to Project Dashboard
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useWallet } from '@txnlab/use-wallet-vue';
import algosdk from 'algosdk';
import { RetroGrid } from '@/components/ui/retro-grid';
import {
  getEscrowBalance,
  depositToEscrow,
  getEscrowTransactions,
  getEscrowFundingNeeded,
  FIN_TOKEN_CONFIG,
  finToBaseUnits,
  getExplorerUrl
} from '@/services/paymentService';
import { projectApi } from '@/services/projectApi';

// Router & Wallet
const router = useRouter();
const route = useRoute();
const { activeAccount, signTransactions } = useWallet();

// Props
const projectId = computed(() => route.params.id as string);

// Reactive data
const loading = ref(true);
const error = ref('');
const escrowData = ref<any>(null);
const projectData = ref<any>(null);
const currentBalance = ref(0);
const pendingHold = ref(0);
const processingHold = ref(0);
const obligationsTotal = ref(0);
const netAvailable = ref(0);
const transactions = ref<any[]>([]);
const fundingNeeded = ref<any>(null);
const fundingTab = ref('wallet');
const showQR = ref(false);
const copied = ref(false);
const showSuccess = ref(false);

// Send from wallet
const sending = ref(false);
const sendAmount = ref(0);

// Manual deposit
const verifying = ref(false);
const manualTxHash = ref('');
const manualAmount = ref(0);

// Success tracking
const lastDepositAmount = ref(0);
const lastTxHash = ref('');

// Computed
const isWalletConnected = computed(() => !!activeAccount.value);
const connectedWalletAddress = computed(() => activeAccount.value?.address || '');
const projectName = computed(() => projectData.value?.name || 'Project');

const recommendedFunding = computed(() => fundingNeeded.value?.recommended || 0);

const remainingAmount = computed(() => Math.max(0, recommendedFunding.value - currentBalance.value));

const fundingProgress = computed(() => {
  if (recommendedFunding.value === 0) return 0;
  return Math.min(100, (currentBalance.value / recommendedFunding.value) * 100);
});

// Load escrow data
const loadEscrowData = async () => {
  try {
    loading.value = true;
    error.value = '';

    // Load project data
    projectData.value = await projectApi.getProject(projectId.value);

    // Load escrow balance
    const balance = await getEscrowBalance(projectId.value);
    currentBalance.value = balance.balance;
    pendingHold.value = balance.obligations?.pendingTasks || 0;
    processingHold.value = balance.obligations?.processingTransfers || 0;
    obligationsTotal.value = balance.obligations?.total || (pendingHold.value + processingHold.value);
    netAvailable.value = typeof balance.netAvailable === 'number'
      ? balance.netAvailable
      : Math.max(0, balance.balance - obligationsTotal.value);
    escrowData.value = {
      escrowAddress: projectData.value.escrowAddress,
      balance: balance.balance
    };

    // Set default send amount to remaining
    sendAmount.value = remainingAmount.value;

    // Load transactions
    const txData = await getEscrowTransactions(projectId.value, { type: 'DEPOSIT', limit: 5 });
    transactions.value = txData;

    // Load funding needed information
    try {
      fundingNeeded.value = await getEscrowFundingNeeded(projectId.value);
      if (recommendedFunding.value > 0) {
        sendAmount.value = Math.max(0, recommendedFunding.value - currentBalance.value);
      }
    } catch (fundingErr) {
      console.warn('Failed to load funding needed data:', fundingErr);
      // Don't fail the whole load if this fails
    }

  } catch (err: any) {
    console.error('Failed to load escrow data:', err);
    error.value = err.response?.data?.error || err.message || 'Failed to load escrow data';
  } finally {
    loading.value = false;
  }
};

// Send FIN from connected wallet
const sendFromWallet = async () => {
  if (!activeAccount.value || sendAmount.value <= 0) {
    alert('Please connect wallet and enter amount');
    return;
  }

  try {
    sending.value = true;

    // Get Algorand client
    const network = localStorage.getItem('algorand_network') || 'testnet';
    const nodeUrl = network === 'mainnet'
      ? 'https://mainnet-api.algonode.cloud'
      : 'https://testnet-api.algonode.cloud';

    const algodClient = new algosdk.Algodv2('', nodeUrl, '');
    const params = await algodClient.getTransactionParams().do();

    // Create token transfer transaction
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: activeAccount.value.address,
      receiver: escrowData.value.escrowAddress,
      assetIndex: FIN_TOKEN_CONFIG.ASSET_ID,
      amount: finToBaseUnits(sendAmount.value),
      note: new TextEncoder().encode(`Funding project ${projectId.value}`),
      suggestedParams: params
    });

    // Sign transaction with user's wallet
    const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
    const signedTxns = await signTransactions([encodedTxn]);

    // Submit to blockchain
    if (!signedTxns || !signedTxns[0]) {
      throw new Error('Failed to sign transaction');
    }
    
    const response = await algodClient.sendRawTransaction(signedTxns[0]).do();
    const txId = response.txid;
    console.log('Transaction submitted:', txId);

    // Wait for confirmation (4 rounds)
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log('Transaction confirmed:', txId);

    // Confirm with backend
    const result = await depositToEscrow(projectId.value, txId, sendAmount.value);

    if (result.verified) {
      // Success!
      lastDepositAmount.value = result.amount;
      lastTxHash.value = txId;
      showSuccess.value = true;

      // Reload balance
      await loadEscrowData();
    } else {
      alert('❌ Transaction submitted but could not be verified. Please contact support.');
    }

  } catch (err: any) {
    console.error('Failed to send token:', err);
    alert(`Failed to send token: ${err.message || 'Unknown error'}`);
  } finally {
    sending.value = false;
  }
};

// Confirm manual deposit
const confirmManualDeposit = async () => {
  try {
    verifying.value = true;

    const result = await depositToEscrow(
      projectId.value,
      manualTxHash.value,
      manualAmount.value
    );

    if (result.verified) {
      // Success!
      lastDepositAmount.value = result.amount;
      lastTxHash.value = manualTxHash.value;
      showSuccess.value = true;

      // Clear form
      manualTxHash.value = '';
      manualAmount.value = 0;

      // Reload balance
      await loadEscrowData();
    } else {
      alert('❌ Transaction could not be verified. Please check the hash and try again.');
    }

  } catch (err: any) {
    console.error('Failed to verify deposit:', err);
    alert(`Failed to verify deposit: ${err.response?.data?.error || err.message || 'Unknown error'}`);
  } finally {
    verifying.value = false;
  }
};

// Helper functions
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const copyAddress = async () => {
  if (escrowData.value?.escrowAddress) {
    await navigator.clipboard.writeText(escrowData.value.escrowAddress);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};

const connectWallet = () => {
  // Trigger wallet connection
  // This depends on your wallet connection UI
  alert('Please use the wallet connection button in the header');
};

const goToProject = () => {
  router.push(`/projects/${projectId.value}`);
};

const skipFunding = () => {
  router.push(`/projects/${projectId.value}`);
};

// Lifecycle
onMounted(() => {
  loadEscrowData();
});
</script>

<style scoped>
.fund-escrow-page {
  min-height: 100vh;
  background: var(--erp-page-bg);
}

.funding-hero {
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
}

.main-content {
  padding: 0 1.5rem 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.escrow-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: var(--erp-page-bg);
  border-radius: 8px;
}

.detail-row .label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  opacity: 0.7;
}

.detail-row .value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--erp-text);
}

.value-with-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.escrow-address {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.balance-row {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.balance-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-accent-green);
}

.remaining-row {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.stat-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-page-bg);
  border-radius: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--erp-surface);
  border-radius: 8px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--erp-text);
}

.help-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-step {
  display: flex;
  gap: 12px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: var(--erp-accent-green);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.step-content p {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
}

.qr-placeholder {
  padding: 24px;
  background: var(--erp-page-bg);
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .funding-hero {
    padding: 1.5rem 1rem;
    margin: 0.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .main-content {
    padding: 0 0.5rem 1rem;
  }

  .escrow-address {
    font-size: 0.625rem;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .balance-value {
    font-size: 1.25rem;
  }
}
</style>

