<template>
  <v-dialog v-model="isOpen" max-width="1000" persistent scrollable>
    <v-card class="wallet-tutorial">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4 d-flex align-items-center justify-space-between">
        <div class="d-flex align-items-center">
          <v-icon size="40" color="primary" class="mr-3">mdi-school</v-icon>
          <div>
            <h2 class="text-h5 font-weight-bold">Wallet Setup Guide</h2>
            <p class="text-caption text-medium-emphasis mb-0">Learn how to set up your crypto wallet</p>
          </div>
        </div>
        <v-btn icon variant="text" @click="skipTutorial" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Progress Steps -->
      <v-stepper v-model="currentStep" flat class="tutorial-stepper elevation-0">
        <v-stepper-header class="px-6">
          <template v-for="(step, index) in steps" :key="index">
            <v-stepper-item
              :value="index + 1"
              :complete="currentStep > index + 1"
              :title="step.title"
              color="primary"
            ></v-stepper-item>
            <v-divider v-if="index < steps.length - 1"></v-divider>
          </template>
        </v-stepper-header>
      </v-stepper>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-6" style="min-height: 500px;">
        <v-window v-model="currentStep">
          <!-- Step 1: Why Web3 -->
          <v-window-item :value="1">
            <div class="tutorial-step text-center">
              <v-icon size="100" color="primary" class="mb-4">mdi-web</v-icon>
              <h3 class="text-h4 font-weight-bold mb-4">Why Use a Crypto Wallet?</h3>
              <p class="text-body-1 mb-6 mx-auto" style="max-width: 600px;">
                A crypto wallet gives you complete control over your money and enables instant, global payments without traditional banking.
              </p>

              <v-row class="mt-6">
                <v-col cols="12" md="3" v-for="benefit in benefits" :key="benefit.title">
                  <v-card variant="tonal" class="pa-4 h-100">
                    <v-icon size="48" :color="benefit.color" class="mb-3">{{ benefit.icon }}</v-icon>
                    <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ benefit.title }}</h4>
                    <p class="text-caption">{{ benefit.description }}</p>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>

          <!-- Step 2: Choose Path -->
          <v-window-item :value="2">
            <div class="tutorial-step">
              <h3 class="text-h4 font-weight-bold mb-4 text-center">Choose Your Wallet Option</h3>
              <p class="text-body-1 mb-6 text-center mx-auto" style="max-width: 700px;">
                You can either create a new wallet or connect an existing one. Both are secure and easy!
              </p>

              <v-row class="mt-6">
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="option-card pa-6" :class="{ 'selected': selectedOption === 'create' }" @click="selectedOption = 'create'">
                    <div class="text-center">
                      <v-icon size="80" color="success" class="mb-4">mdi-wallet-plus</v-icon>
                      <h4 class="text-h5 font-weight-bold mb-3">Create New Wallet</h4>
                      <v-chip color="success" size="small" class="mb-4">Recommended for Beginners</v-chip>
                      <ul class="text-left text-body-2 pl-6">
                        <li>We generate a secure wallet for you</li>
                        <li>Get a 25-word recovery phrase</li>
                        <li>Set a password for protection</li>
                        <li>Security questions for recovery</li>
                      </ul>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="option-card pa-6" :class="{ 'selected': selectedOption === 'connect' }" @click="selectedOption = 'connect'">
                    <div class="text-center">
                      <v-icon size="80" color="primary" class="mb-4">mdi-wallet</v-icon>
                      <h4 class="text-h5 font-weight-bold mb-3">Connect Existing Wallet</h4>
                      <v-chip color="primary" size="small" class="mb-4">For Crypto Users</v-chip>
                      <ul class="text-left text-body-2 pl-6">
                        <li>Use Pera, Defly, or WalletConnect</li>
                        <li>Connect via QR code or browser</li>
                        <li>Keep your existing funds</li>
                        <li>Works with mobile wallets</li>
                      </ul>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>

          <!-- Step 3: Security Tips -->
          <v-window-item :value="3">
            <div class="tutorial-step">
              <h3 class="text-h4 font-weight-bold mb-4 text-center"> Security Best Practices</h3>
              <p class="text-body-1 mb-6 text-center mx-auto" style="max-width: 700px;">
                Follow these essential security tips to keep your wallet safe
              </p>

              <v-row class="mt-6">
                <v-col cols="12" md="6" v-for="(tip, index) in securityTips" :key="index">
                  <v-card variant="tonal" :color="tip.color" class="pa-4 h-100">
                    <div class="d-flex align-items-start">
                      <v-icon :color="tip.color" size="32" class="mr-3">{{ tip.icon }}</v-icon>
                      <div>
                        <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ tip.title }}</h4>
                        <p class="text-body-2 mb-0">{{ tip.description }}</p>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert type="warning" variant="tonal" class="mt-6">
                <div class="d-flex align-items-start">
                  <v-icon class="mr-2" size="24">mdi-alert</v-icon>
                  <div>
                    <h4 class="font-weight-bold mb-2"> Never Share Your Recovery Phrase!</h4>
                    <p class="mb-0">Your 25-word recovery phrase is like the master key to your wallet. FinPro support will NEVER ask for it. Anyone with this phrase can access all your funds.</p>
                  </div>
                </div>
              </v-alert>
            </div>
          </v-window-item>

          <!-- Step 4: How Payments Work -->
          <v-window-item :value="4">
            <div class="tutorial-step">
              <h3 class="text-h4 font-weight-bold mb-4 text-center"> How Payments Work</h3>
              <p class="text-body-1 mb-6 text-center mx-auto" style="max-width: 700px;">
                Understanding the payment flow with FIN token escrow system
              </p>

              <v-timeline side="end" density="compact" class="mt-6">
                <v-timeline-item
                  v-for="(stage, index) in paymentStages"
                  :key="index"
                  :dot-color="stage.color"
                  size="large"
                >
                  <template v-slot:icon>
                    <v-icon color="white" size="20">{{ stage.icon }}</v-icon>
                  </template>
                  <v-card variant="tonal" :color="stage.color" class="pa-4">
                    <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ index + 1 }}. {{ stage.title }}</h4>
                    <p class="text-body-2 mb-0">{{ stage.description }}</p>
                  </v-card>
                </v-timeline-item>
              </v-timeline>

              <v-card variant="outlined" class="pa-4 mt-6" color="info">
                <div class="d-flex align-items-start">
                  <v-icon color="info" class="mr-3" size="32">mdi-information</v-icon>
                  <div>
                    <h4 class="font-weight-bold mb-2">FIN Token (FIN)</h4>
                    <p class="text-body-2 mb-2">All payments are made in FIN tokens, our native token used for escrow-backed payouts.</p>
                    <ul class="text-body-2 pl-4">
                      <li>Low transaction fees (fractions of a cent)</li>
                      <li>Instant settlement (4-5 seconds)</li>
                      <li>Global accessibility 24/7</li>
                      <li>Transparent on-chain history</li>
                    </ul>
                  </div>
                </div>
              </v-card>
            </div>
          </v-window-item>

          <!-- Step 5: Getting FIN -->
          <v-window-item :value="5">
            <div class="tutorial-step">
              <h3 class="text-h4 font-weight-bold mb-4 text-center"> Getting FIN</h3>
              <p class="text-body-1 mb-6 text-center mx-auto" style="max-width: 700px;">
                Learn how to obtain FIN for payments and transactions
              </p>

              <v-row class="mt-6">
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="success" class="pa-4 h-100 text-center">
                    <v-icon size="60" color="success" class="mb-3">mdi-briefcase-check</v-icon>
                    <h4 class="text-h6 font-weight-bold mb-2">Earn from Projects</h4>
                    <p class="text-body-2">Complete tasks and get paid in FIN automatically when work is approved.</p>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="primary" class="pa-4 h-100 text-center">
                    <v-icon size="60" color="primary" class="mb-3">mdi-swap-horizontal</v-icon>
                    <h4 class="text-h6 font-weight-bold mb-2">Buy on DEX</h4>
                    <p class="text-body-2 mb-3">Purchase FIN on decentralized exchanges or use the built-in swap.</p>
                    <v-btn size="small" variant="outlined" :href="import.meta.env.VITE_SSO_PRIMARY_DOMAIN || '#'" target="_blank">
                      <v-icon start size="16">mdi-open-in-new</v-icon>
                      Visit DEX
                    </v-btn>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="info" class="pa-4 h-100 text-center">
                    <v-icon size="60" color="info" class="mb-3">mdi-account-convert</v-icon>
                    <h4 class="text-h6 font-weight-bold mb-2">Receive from Others</h4>
                    <p class="text-body-2">Receive FIN transfers from other users by sharing your wallet address.</p>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert type="info" variant="tonal" class="mt-6">
                <template v-slot:prepend>
<v-icon >mdi-lightbulb</v-icon>
</template>
                <strong>Pro Tip:</strong> Make sure you’re on the correct network and have gas (ETH/MATIC) for transactions.
              </v-alert>
            </div>
          </v-window-item>

          <!-- Step 6: Ready to Start -->
          <v-window-item :value="6">
            <div class="tutorial-step text-center">
              <v-icon size="100" color="success" class="mb-4">mdi-check-circle</v-icon>
              <h3 class="text-h4 font-weight-bold mb-4">You're Ready to Go!</h3>
              <p class="text-body-1 mb-6 mx-auto" style="max-width: 700px;">
                You now understand how crypto wallets work and how payments are processed in FinPro.
              </p>

              <v-card variant="outlined" class="pa-6 mx-auto" style="max-width: 600px;">
                <h4 class="text-h6 font-weight-bold mb-4">Quick Recap:</h4>
                <v-list density="compact">
                  <v-list-item v-for="(item, index) in recap" :key="index">
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-check-circle</v-icon>
                    </template>
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>

              <div class="mt-8">
                <v-btn
                  color="primary"
                  size="x-large"
                  variant="elevated"
                  @click="completeTutorial"
                >
                  <v-icon start>mdi-rocket-launch</v-icon>
                  Set Up My Wallet Now
                </v-btn>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Footer Actions -->
      <v-card-actions class="pa-6">
        <v-btn
          variant="text"
          @click="skipTutorial"
        >
          Skip Tutorial
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="currentStep > 1"
          variant="outlined"
          @click="previousStep"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Back
        </v-btn>
        <v-btn
          v-if="currentStep < steps.length"
          color="primary"
          variant="elevated"
          @click="nextStep"
        >
          Next
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'complete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const currentStep = ref(1)
const selectedOption = ref<'create' | 'connect' | null>(null)

const isOpen = ref(props.modelValue)

const steps = [
  { title: 'Why Web3?' },
  { title: 'Choose Path' },
  { title: 'Security' },
  { title: 'Payments' },
  { title: 'Get FIN' },
  { title: 'Ready!' }
]

const benefits = [
  { icon: 'mdi-shield-lock', color: 'success', title: 'Full Control', description: 'You own your wallet and funds' },
  { icon: 'mdi-flash', color: 'warning', title: 'Instant', description: 'Payments in seconds' },
  { icon: 'mdi-earth', color: 'info', title: 'Global', description: 'No borders or banks' },
  { icon: 'mdi-eye', color: 'primary', title: 'Transparent', description: 'blockchain recorded' }
]

const securityTips = [
  {
    icon: 'mdi-lock-check',
    color: 'success',
    title: 'Write Down Recovery Phrase',
    description: 'Store your 25-word phrase offline in a secure location. This is your only way to recover your wallet.'
  },
  {
    icon: 'mdi-account-lock',
    color: 'warning',
    title: 'Use Strong Password',
    description: 'Choose a password with 12+ characters, mixing uppercase, lowercase, numbers, and symbols.'
  },
  {
    icon: 'mdi-shield-alert',
    color: 'error',
    title: 'Beware of Phishing',
    description: 'Always verify URLs. FinPro will never ask for your recovery phrase or password.'
  },
  {
    icon: 'mdi-backup-restore',
    color: 'info',
    title: 'Multiple Backups',
    description: 'Keep multiple copies of your recovery phrase in different secure locations.'
  }
]

const paymentStages = [
  {
    title: 'Project Funded',
    description: 'Project owner funds escrow account with FIN tokens for all project payments',
    icon: 'mdi-cash-multiple',
    color: 'primary'
  },
  {
    title: 'Work Assigned',
    description: 'Tasks are assigned to team members with payment amounts specified',
    icon: 'mdi-clipboard-text',
    color: 'info'
  },
  {
    title: 'Task Completed',
    description: 'You complete your assigned task and submit it for review',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    title: 'Approval & Payment',
    description: 'Manager approves task and FIN tokens are instantly transferred to your wallet',
    icon: 'mdi-wallet-plus',
    color: 'warning'
  }
]

const recap = [
  ' Wallets give you control and enable global payments',
  ' Keep your recovery phrase secret and secure',
  ' Get paid in FIN when tasks are approved',
  ' Payments are instant and transparent on blockchain',
  ' Escrow system protects both owners and workers'
]

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const skipTutorial = () => {
  emit('update:modelValue', false)
  router.push('/wallet-auth')
}

const completeTutorial = () => {
  emit('update:modelValue', false)
  emit('complete')
  router.push('/wallet-auth')
}
</script>

<style scoped>
.wallet-tutorial {
  border-radius: 16px;
}

.tutorial-step {
  min-height: 400px;
  padding: 20px;
}

.option-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.option-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.tutorial-stepper {
  background: transparent !important;
}
</style>
