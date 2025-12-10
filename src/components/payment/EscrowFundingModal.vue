<template>
  <v-dialog v-model="localValue" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary">
        <v-icon class="mr-3" color="white">mdi-shield-lock</v-icon>
        <span class="text-white">Fund Project Escrow</span>
      </v-card-title>

      <v-card-text class="pt-6">
        <v-alert type="info" variant="tonal" class="mb-4">
          <div class="text-body-2">
            <strong>Pesa zako zitakuwa salama!</strong> Escrow account itashikilia fedha mpaka tasks zikamilike na uziapprove.
          </div>
        </v-alert>

        <!-- Escrow Address -->
        <div class="escrow-section mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon color="primary" class="mr-2">mdi-wallet</v-icon>
            Escrow Address
          </h3>
          <div class="address-box">
            <code class="escrow-address">{{ escrowAddress }}</code>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="copyAddress"
              :title="copied ? 'Copied!' : 'Copy address'"
            >
              <v-icon :color="copied ? 'success' : 'default'">
                {{ copied ? 'mdi-check' : 'mdi-content-copy' }}
              </v-icon>
            </v-btn>
          </div>
        </div>

        <!-- QR Code -->
        <div class="qr-section mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon color="primary" class="mr-2">mdi-qrcode</v-icon>
            Scan to Send
          </h3>
          <div class="qr-code-box">
            <canvas ref="qrCanvas" />
            <p class="text-caption text-center mt-2">
              Scan na Pera/Defly Wallet yako
            </p>
          </div>
        </div>

        <!-- Amount to Send -->
        <div class="amount-section mb-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon color="success" class="mr-2">mdi-cash</v-icon>
            Amount Required
          </h3>
          <div class="amount-display">
            <span class="amount-value">{{ formatAmount(requiredAmount) }} SIZ</span>
            <span class="amount-label">({{ requiredAmount }} SIZCOIN)</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions-section">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            <v-icon color="warning" class="mr-2">mdi-information</v-icon>
            Maelekezo (Instructions)
          </h3>
          <ol class="text-body-2">
            <li class="mb-2">
              <strong>Copy</strong> escrow address juu au <strong>scan</strong> QR code
            </li>
            <li class="mb-2">
              Fungua wallet yako (Pera/Defly/MyAlgo)
            </li>
            <li class="mb-2">
              Tuma <strong>{{ formatAmount(requiredAmount) }} SIZ</strong> kwa address iliyo juu
            </li>
            <li class="mb-2">
              Baada ya kutuma, copy transaction hash
            </li>
            <li class="mb-2">
              Kisha bonyeza <strong>"I've Sent Funds"</strong> hapo chini na weka transaction hash
            </li>
          </ol>
        </div>

        <!-- Transaction Hash Input (shown after user clicks "I've Sent Funds") -->
        <v-expand-transition>
          <div v-if="showTxInput" class="tx-input-section mt-4">
            <v-text-field
              v-model="txHash"
              label="Transaction Hash"
              placeholder="Weka transaction hash hapa"
              variant="outlined"
              :rules="[v => !!v || 'Transaction hash ni muhimu']"
              hint="Utapata hii kwenye wallet yako baada ya kutuma"
              persistent-hint
            >
              <template v-slot:prepend-inner>
                <v-icon>mdi-link-variant</v-icon>
              </template>
            </v-text-field>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-btn
          variant="text"
          @click="localValue = false"
          :disabled="verifying"
        >
          Cancel
        </v-btn>
        <v-spacer />
        
        <v-btn
          v-if="!showTxInput"
          color="primary"
          variant="outlined"
          @click="showTxInput = true"
        >
          <v-icon start>mdi-check</v-icon>
          I've Sent Funds
        </v-btn>
        
        <v-btn
          v-else
          color="success"
          variant="elevated"
          :loading="verifying"
          :disabled="!txHash"
          @click="verifyAndRecord"
        >
          <v-icon start>mdi-shield-check</v-icon>
          Verify Transaction
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
// @ts-ignore - QRCode doesn't have types
import QRCode from 'qrcode';
import { depositToEscrow } from '@/services/paymentService';

interface Props {
  modelValue: boolean;
  projectId: string;
  escrowAddress: string;
  requiredAmount: number;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'funded', txHash: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const qrCanvas = ref<HTMLCanvasElement | null>(null);
const copied = ref(false);
const showTxInput = ref(false);
const txHash = ref('');
const verifying = ref(false);

// Helper functions
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(props.escrowAddress);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const generateQRCode = async () => {
  if (!qrCanvas.value) return;
  
  try {
    // Generate QR code with Algorand URI scheme
    const algoUri = `algorand://${props.escrowAddress}?amount=${props.requiredAmount * 1000000}&asset=0`;
    await QRCode.toCanvas(qrCanvas.value, algoUri, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }
};

const verifyAndRecord = async () => {
  if (!txHash.value.trim()) return;
  
  try {
    verifying.value = true;
    
    // Record the deposit with backend
    await depositToEscrow(props.projectId, txHash.value.trim(), props.requiredAmount);
    
    // Emit success event
    emit('funded', txHash.value.trim());
    
    // Close modal
    localValue.value = false;
    
    // Reset form
    showTxInput.value = false;
    txHash.value = '';
  } catch (error: any) {
    console.error('Failed to verify transaction:', error);
    alert(`Imeshindwa ku-verify transaction: ${error.response?.data?.error || error.message}`);
  } finally {
    verifying.value = false;
  }
};

// Watch for modal opening to generate QR code
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      generateQRCode();
    }, 100);
  }
});

// Generate QR on mount if modal is already open
onMounted(() => {
  if (props.modelValue) {
    generateQRCode();
  }
});
</script>

<style scoped>
.escrow-section {
  padding: 16px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
}

.address-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
}

.escrow-address {
  flex: 1;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  color: var(--erp-text);
  word-break: break-all;
}

.qr-section {
  padding: 16px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
}

.qr-code-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.amount-section {
  padding: 16px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
}

.amount-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.amount-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--erp-accent-green);
}

.amount-label {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.instructions-section {
  padding: 16px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
}

.instructions-section ol {
  margin-left: 16px;
  color: var(--erp-text);
}

.tx-input-section {
  padding: 16px;
  background: var(--erp-page-bg);
  border: 2px dashed var(--erp-border);
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .amount-value {
    font-size: 1.5rem;
  }
  
  .escrow-address {
    font-size: 0.65rem;
  }
}
</style>

