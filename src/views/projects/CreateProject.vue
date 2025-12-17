<template>
  <div class="kanban-project-creator">
    <v-container fluid class="pa-0">
      <!-- Hero Section with Retro Grid -->
      <div class="create-project-hero">
        <RetroGrid />
        <div class="hero-content">
          <div class="hero-icon">
            <v-icon size="48">mdi-rocket-launch</v-icon>
          </div>
          <h1 class="hero-title">Create New Project</h1>
          <p class="hero-subtitle">Set up your Kanban board and start managing tasks</p>
        </div>
      </div>

      <!-- Simple Progress Bar -->
      <div class="progress-container">
        <div class="progress-line">
          <div class="progress-fill" :style="{ width: currentStepIndex === 0 ? '50%' : '100%' }"></div>
        </div>
        <div class="progress-labels">
          <span :class="{ 'active': currentStepIndex >= 0 }">Project Details</span>
          <span :class="{ 'active': currentStepIndex >= 1 }">Review & Create</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <v-container fluid class="fill-height">
          <v-row align="center" justify="center">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate :color="'var(--erp-accent-green)'" size="64" />
              <p class="mt-4 text-h6" :style="{ color: 'var(--erp-text)' }">Loading project configuration...</p>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Error/Success Messages -->
      <v-snackbar :model-value="!!error" :color="'var(--erp-accent-indigo)'" timeout="5000" @update:model-value="error = ''">
        {{ error }}
        <template v-slot:actions>
          <v-btn variant="text" @click="error = ''">Close</v-btn>
        </template>
      </v-snackbar>

      <v-snackbar :model-value="!!success" :color="'var(--erp-accent-green)'" timeout="3000" @update:model-value="success = ''">
        {{ success }}
        <template v-slot:actions>
          <v-btn variant="text" @click="success = ''">Close</v-btn>
        </template>
      </v-snackbar>

      <!-- Main Content Area -->
      <div v-if="!loading" class="main-content">
        

        <!-- Step Content -->
        <div class="step-content-container">
          <!-- Project Details Step -->
          <div v-if="currentStep === 'details'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Project Details</h2>
              <p class="text-body-2 text-medium-emphasis">Tell us about your project</p>
            </div>

            <v-form ref="projectForm" v-model="projectValid">
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="projectData.name"
                    label="Project Name"
                    placeholder="e.g., Website Redesign, Mobile App Development"
                    variant="outlined"
                    :rules="[v => !!v || 'Project name is required']"
                    class="mb-4"
                    inputmode="text"
                    autocorrect="off"
                    autocapitalize="words"
                  />

                  <v-select
                    v-model="projectData.type"
                    label="Project Type"
                    :items="projectTypes"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-select
                    v-model="projectData.priority"
                    label="Priority Level"
                    :items="priorityLevels"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-textarea
                    v-model="projectData.description"
                    label="Project Description"
                    placeholder="Brief description of your project goals and requirements"
                    variant="outlined"
                    rows="3"
                    class="mb-4"
                  />

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.startDate"
                        label="Start Date"
                        type="date"
                        variant="outlined"
                        :rules="[v => !!v || 'Start date is required']"
                        class="mb-4"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.endDate"
                        label="End Date (Optional)"
                        type="date"
                        variant="outlined"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                    <h4 class="text-subtitle-1 font-weight-medium mb-3">Project Settings</h4>
                    <v-radio-group v-model="projectData.isPublic" class="mb-4" :style="{ color: 'var(--erp-text)' }">
                      <v-radio value="false" label="Private Project" :color="'var(--erp-accent-green)'" />
                      <v-radio value="true" label="Public Project" :color="'var(--erp-accent-green)'" />
                    </v-radio-group>

                    <div class="text-caption text-medium-emphasis">
                      <strong>Private:</strong> Only invited team members can access<br>
                      <strong>Public:</strong> Visible to all users (great for open source)
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </div>

          <!-- Review & Create Step -->
          <div v-if="currentStep === 'review'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Review & Create Project</h2>
              <p class="text-body-2 text-medium-emphasis">Confirm your project details and create it</p>
            </div>

            <v-card elevation="0" class="pa-6 border rounded-lg mb-6" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
              <h4 class="text-h6 font-weight-medium mb-4">Project Summary</h4>

              <v-row>
                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <strong class="text-caption">PROJECT NAME</strong>
                    <p class="mb-0">{{ projectData.name || 'Not specified' }}</p>
                  </div>

                  <div class="mb-4">
                    <strong class="text-caption">TYPE & PRIORITY</strong>
                    <p class="mb-0">{{ projectData.type || 'Not specified' }} • {{ projectData.priority || 'Medium' }}</p>
                  </div>

                  <div class="mb-4">
                    <strong class="text-caption">VISIBILITY</strong>
                    <p class="mb-0">{{ projectData.isPublic ? 'Public' : 'Private' }}</p>
                  </div>
                </v-col>

                <v-col cols="12" md="6">
                  <div class="mb-4">
                    <strong class="text-caption">START DATE</strong>
                    <p class="mb-0">{{ formatDate(projectData.startDate) }}</p>
                  </div>

                  <div class="mb-4">
                    <strong class="text-caption">END DATE</strong>
                    <p class="mb-0">{{ projectData.endDate ? formatDate(projectData.endDate) : 'Not specified' }}</p>
                  </div>

                  <div class="mb-4">
                    <strong class="text-caption">DESCRIPTION</strong>
                    <p class="mb-0">{{ projectData.description || 'No description provided' }}</p>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <v-alert type="info" variant="tonal" class="mb-6">
              <template v-slot:prepend>
                <v-icon>mdi-information</v-icon>
              </template>
              <div>
                <strong>What's Next?</strong><br>
                After creating your project, you can:
                • Set up workflow stages (departments)
                • Invite team members
                • Fund the project escrow
                • Start assigning tasks
              </div>
            </v-alert>
          </div>
        </div>

        <!-- Navigation Footer -->
        <div class="navigation-footer">
          <div class="d-flex justify-space-between align-center">
            <v-btn
              v-if="currentStep !== 'details'"
              variant="text"
              @click="previousStep"
              :disabled="saving"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              Back
            </v-btn>
            <div v-else></div>

            <div class="d-flex gap-3">
              <v-btn
                v-if="currentStep === 'details'"
                :color="'var(--erp-accent-green)'"
                @click="nextStep"
                :disabled="!projectValid || saving"
                :loading="saving"
              >
                Review Project
                <v-icon class="ml-2">mdi-arrow-right</v-icon>
              </v-btn>

              <div v-if="currentStep === 'review'" class="d-flex flex-column align-end" style="gap: 8px;">
                <v-alert
                  v-if="finBalance < 0"
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  <div class="d-flex flex-column" style="gap: 8px;">
                    <div>
                      Projects are created with mock balance for testing.
                      <span class="ml-1">Current: {{ finBalance.toFixed(2) }} FIN</span>
                    </div>
                  </div>
                </v-alert>

                <v-btn
                  :color="'var(--erp-accent-green)'"
                  @click="createProject"
                  :disabled="!projectValid || saving"
                  :loading="saving"
                  size="large"
                >
                  <v-icon class="mr-2">mdi-rocket-launch</v-icon>
                  Create Project
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNextAuth } from '@/composables/useNextAuth';
import { projectApi } from '@/services/projectApi';
import { RetroGrid } from '@/components/ui/retro-grid';
import { useEVMWallet } from '@/composables/useEVMWallet';

const router = useRouter();
const { user } = useNextAuth();

// Type definitions for better TypeScript support
interface Department {
  name: string;
  type: string;
  description: string;
  order: number;
  isVisible: boolean;
}

interface Role {
  userEmail: string;
  role: string;
  userId?: string;
  departmentId: number | null;
  paymentConfig?: {
    paymentType: 'PER_TASK' | 'SALARY' | 'OVERSIGHT' | 'MILESTONE' | 'HYBRID' | null;
    salaryAmount?: number;
    salaryFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    oversightRate?: number;
    milestoneAmount?: number;
    includeTaskPayments?: boolean;
    includeOversight?: boolean;
  };
}

// Templates/Drafts removed

// Simplified project creation steps
const creationSteps = ref([
  { id: 'details', label: 'Project Details', completed: false },
  { id: 'review', label: 'Review & Create', completed: false }
]);

const currentStep = ref('details');
const currentStepIndex = computed(() => creationSteps.value.findIndex(step => step.id === currentStep.value));

// Simplified project data structure
const projectData = reactive({
  name: '',
  description: '',
  type: 'PROGRESSIVE' as 'PROGRESSIVE' | 'PARALLEL',
  priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  startDate: '',
  endDate: '',
  isPublic: false
});

// Ensure endDate is always a valid date string
const getValidEndDate = () => {
  if (projectData.endDate) {
    return projectData.endDate;
  }
  // If no end date provided, set it to 3 months from start date
  if (projectData.startDate) {
    const startDate = new Date(projectData.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);
    return endDate.toISOString().split('T')[0];
  }
  // Fallback to 3 months from today
  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 3);
  return endDate.toISOString().split('T')[0];
};

// Computed properties
const ssoDomain = computed(() => import.meta.env.VITE_SSO_PRIMARY_DOMAIN || '#');

// Form validation
const projectValid = ref(false);

// API state
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

// Form options
const projectTypes = ref<Array<{title: string, value: string}>>([
  { title: 'Progressive (Sequential workflow)', value: 'PROGRESSIVE' },
  { title: 'Parallel (Independent tasks)', value: 'PARALLEL' }
]);
const priorityLevels = ref<Array<{title: string, value: string}>>([
  { title: 'Low', value: 'LOW' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'High', value: 'HIGH' },
  { title: 'Critical', value: 'CRITICAL' }
]);

// Computed properties
const canProceedToNext = computed(() => {
  return projectData.name && projectData.type && projectData.startDate;
});

const canCreateProject = computed(() => {
  return projectData.name && projectData.type && projectData.startDate;
});

// Wallet + FIN balance gating (using MetaMask wallet)
const finBalance = ref(0);
const finBalanceFormatted = ref(0);
const balanceLoading = ref(false);
const balanceError = ref('');

// Use MetaMask wallet
const { user: walletUser, isConnected, chainId } = useEVMWallet();
const walletAddress = computed(() => walletUser.value?.address || '');
const walletConnected = computed(() => isConnected.value && !!walletAddress.value);

const loadWalletFINBalance = async () => {
  finBalance.value = 0;
  finBalanceFormatted.value = 0;
  balanceError.value = '';
  if (!walletAddress.value || !chainId.value) return;
  try {
    balanceLoading.value = true;
    
    // For demo purposes, since FIN token is not deployed, use mock balance
    finBalance.value = 10000; // Mock 10,000 FIN
    finBalanceFormatted.value = 10000;
    
    // Uncomment below for real blockchain calls when token is deployed
    /*
    const tokenAddress = getFINTokenAddress(chainId.value);
    const rpcUrl = getRPCUrl(chainId.value);
    
    if (!tokenAddress || !rpcUrl) {
      balanceError.value = 'FIN token not configured for this network';
      return;
    }
    
    const balance = await getFINTokenBalance(walletAddress.value, rpcUrl, tokenAddress);
    if (balance) {
      finBalance.value = Number(balance.amount) / Math.pow(10, balance.decimals || 18);
      finBalanceFormatted.value = parseFloat(balance.formattedBalance) || 0;
    } else {
      finBalance.value = 0;
      finBalanceFormatted.value = 0;
    }
    */
  } catch (e: any) {
    balanceError.value = e?.message || 'Failed to load wallet balance';
    // Fallback to mock balance on error
    finBalance.value = 10000;
    finBalanceFormatted.value = 10000;
  } finally {
    balanceLoading.value = false;
  }
};

watch([walletAddress, chainId], async () => {
  if (walletAddress.value && chainId.value) await loadWalletFINBalance();
  else finBalance.value = 0;
}, { immediate: true });

// Gate strictly on the displayed formattedAmount per product requirement
const meetsFINRequirement = computed(() => finBalanceFormatted.value >= 0);
const canSubmit = computed(() => !!canCreateProject.value && walletConnected.value && meetsFINRequirement.value);

// Draft state removed


// Navigation functions
const nextStep = async () => {
  const currentIndex = creationSteps.value.findIndex(step => step.id === currentStep.value);
  if (currentIndex < creationSteps.value.length - 1) {
    creationSteps.value[currentIndex].completed = true;
    currentStep.value = creationSteps.value[currentIndex + 1].id;
  }
};

const previousStep = () => {
  const currentIndex = creationSteps.value.findIndex(step => step.id === currentStep.value);
  if (currentIndex > 0) {
    currentStep.value = creationSteps.value[currentIndex - 1].id;
  }
};

// Utility functions
const formatDate = (timestamp: string) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch (e) {
    return timestamp;
  }
};

// Simplified project creation
const createProject = async () => {
  if (!user.value?.id) {
    error.value = 'User not authenticated';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    // Create basic project with default departments and owner role
    const projectPayload = {
      name: projectData.name,
      description: projectData.description || '',
      type: projectData.type,
      priority: projectData.priority,
      startDate: projectData.startDate,
      endDate: getValidEndDate(),
      ownerId: user.value.id,
      userId: user.value.id,
      walletAddress: walletAddress.value || '',
      isPublic: projectData.isPublic,
      allowGuests: false,
      // Default departments for basic workflow
      departments: [
        { name: 'Backlog', type: 'MAJOR' as const, description: 'Tasks to be worked on', order: 0, isVisible: true },
        { name: 'In Progress', type: 'MAJOR' as const, description: 'Currently being worked on', order: 1, isVisible: true },
        { name: 'Review', type: 'MAJOR' as const, description: 'Ready for review', order: 2, isVisible: true },
        { name: 'Done', type: 'MAJOR' as const, description: 'Completed tasks', order: 3, isVisible: true }
      ],
      // Default owner role
      roles: [{
        userEmail: user.value.email || '',
        role: 'PROJECT_OWNER' as const,
        departmentId: null
      }],
      tags: []
    };

    console.log('[CreateProject] Creating simplified project:', {
      name: projectPayload.name,
      type: projectPayload.type,
      departmentsCount: projectPayload.departments.length,
      owner: projectPayload.userId
    });

    const response = await projectApi.createProject(projectPayload);

    if (response) {
      console.log('Project created successfully:', response);
      success.value = 'Project created successfully! Redirecting...';

      // Mark steps as completed
      creationSteps.value[0].completed = true;
      creationSteps.value[1].completed = true;

      setTimeout(() => {
        router.push('/projects');
      }, 2000);
    } else {
      throw new Error('Failed to create project');
    }
  } catch (err) {
    console.error('[CreateProject] Error creating project:', err);
    const serverMsg = (err as any)?.response?.data?.error || (err as any)?.response?.data?.message;
    error.value = serverMsg || (err instanceof Error ? err.message : 'Failed to create project');
    setTimeout(() => error.value = '', 5000);
  } finally {
    saving.value = false;
  }
};

// Auto-save draft when data changes
// Draft autosave removed

// Initialize data
onMounted(async () => {
  loading.value = true;

  try {
    // Set default start date to today
    if (!projectData.startDate) {
      const today = new Date().toISOString().split('T')[0];
      projectData.startDate = today;
    }
  } catch (err) {
    console.error('Failed to initialize:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.kanban-project-creator {
  min-height: 100vh;
  background: var(--erp-page-bg);
}

/* Hero Section with Modern Web3 Aesthetic */
.create-project-hero {
  position: relative;
  background: var(--erp-card-bg);
  padding: 3rem 2rem;
  text-align: center;
  overflow: hidden;
  border: 1px solid var(--erp-border);
  border-radius: 20px;
  margin: 1rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--erp-accent-green) 0%, var(--erp-accent-indigo) 100%);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(91, 200, 91, 0.3);
}

.hero-icon .v-icon {
  color: white;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--erp-accent-green) 0%, var(--erp-accent-indigo) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

.main-content {
  padding: 0 32px 32px 32px;
}

.step-content-container {
  margin-top: 24px;
}

.step-content {
  animation: fadeIn 0.3s ease-in-out;
  background: var(--erp-card-bg);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--erp-border);
}

.step-header {
  margin-bottom: 24px;
}

.step-header h2 {
  color: var(--erp-text);
}

.step-header p {
  color: var(--erp-text);
  opacity: 0.8;
}

/* Progress Bar */
.progress-container {
  background: var(--erp-card-bg);
  padding: 24px 32px;
  border-bottom: 1px solid var(--erp-border);
  position: relative;
}

.progress-line {
  position: relative;
  width: 100%;
  height: 4px;
  background: var(--erp-border);
  border-radius: 2px;
  margin-bottom: 16px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--erp-accent-green), var(--erp-accent-indigo));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  max-width: 400px;
  margin: 0 auto;
}

.progress-labels span {
  font-size: 0.875rem;
  font-weight: 500;
  color: color-mix(in srgb, var(--erp-text) 60%, transparent);
  transition: color 0.3s ease;
}

.progress-labels span.active {
  color: var(--erp-accent-green);
  font-weight: 600;
}


.navigation-footer {
  background: var(--erp-card-bg);
  padding: 24px 32px;
  border-top: 1px solid var(--erp-border);
  margin-top: 32px;
}

.border {
  border: 1px solid var(--erp-border);
}

.border-b {
  border-bottom: 1px solid var(--erp-border);
}

.border-t {
  border-top: 1px solid var(--erp-border);
}

.space-y-3 > * + * {
  margin-top: 12px;
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

/* Responsive adjustments */
@media (max-width: 960px) {
  .main-content {
    padding: 16px;
  }
  
  .departments-grid {
    grid-template-columns: 1fr;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .step-label {
    display: none;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--erp-page-bg);
  opacity: 0.9;
  z-index: 1000;
}

.cursor-pointer {
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-project-hero {
    padding: 2rem 1rem;
    margin: 0.5rem 1rem 1rem 1rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .main-content {
    padding: 0 16px 16px 16px;
  }

  .progress-container {
    padding: 1rem;
  }

  .step-content {
    padding: 16px;
  }

  .progress-labels {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .create-project-hero {
    padding: 1.5rem 1rem;
    margin: 0.5rem 0.75rem 0.75rem 0.75rem;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 0.85rem;
  }

  .main-content {
    padding: 0 12px 12px 12px;
  }

  .step-content {
    padding: 12px;
  }
}
</style>
