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

      <!-- Progress Steps Bar -->
      <div class="progress-container">
        <div class="progress-line"></div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in creationSteps" 
            :key="step.id"
            class="progress-step"
            :class="{
              'completed': step.completed,
              'current': step.id === currentStep,
              'pending': !step.completed && step.id !== currentStep
            }"
          >
            <div class="step-number">
              <v-icon v-if="step.completed" size="20" color="white">mdi-check</v-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-connector" v-if="index < creationSteps.length - 1"></div>
            <span class="step-label">{{ step.label }}</span>
          </div>
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
          <!-- Foundation Step -->
          <div v-if="currentStep === 'foundation'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Basic Information</h2>
            </div>
            
            <v-form ref="foundationForm" v-model="foundationValid">
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="projectData.name"
                    label="Project Name"
                    placeholder="Project Name"
                    variant="outlined"
                    :rules="[v => !!v || 'Project name is required']"
                    class="mb-4"
                  />
                  
                  <v-select
                    v-model="projectData.type"
                    label="Project Type"
                    placeholder="Project Type"
                    :items="projectTypes"
                    variant="outlined"
                    :rules="[v => !!v || 'Project type is required']"
                    class="mb-4"
                  />
                  
                  <v-textarea
                    v-model="projectData.description"
                    label="Description (Optional)"
                    placeholder="Description (Optional)"
                    variant="outlined"
                    rows="4"
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
                        label="End Date"
                        type="date"
                        variant="outlined"
                        :rules="[v => !!v || 'End date is required']"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                    <h4 class="text-subtitle-1 font-weight-medium mb-3" :style="{ color: 'var(--erp-text)' }">Project Visibility</h4>
                    <v-radio-group v-model="projectData.isPublic" class="mb-4">
                      <v-radio value="false" label="Private" :color="'var(--erp-accent-green)'" />
                      <v-radio value="true" label="Public" :color="'var(--erp-accent-green)'" />
                    </v-radio-group>
                    
                    <v-checkbox
                      v-model="projectData.allowGuests"
                      label="Allow Guest"
                      :color="'var(--erp-accent-green)'"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </div>

          <!-- Departments Step -->
          <div v-if="currentStep === 'departments'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Column/Stages</h2>
              <p class="text-body-2 text-medium-emphasis">Define the workflow stages for your project</p>
            </div>
            
            <div class="departments-container">
              <div class="departments-grid">
                <div 
                  v-for="(dept, index) in projectData.departments" 
                  :key="index"
                  class="department-card"
                  :class="{ 'dragging': draggedDept === index }"
                  draggable="true"
                  @dragstart="startDrag(index)"
                  @dragover.prevent
                  @drop="onDrop(index)"
                >
                  <div class="department-header">
                    <v-text-field
                      v-model="dept.name"
                      label="Stage Name"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-select
                      v-model="dept.type"
                      label="Type"
                      :items="departmentTypes"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-textarea
                      v-model="dept.description"
                      label="Description"
                      variant="outlined"
                      density="compact"
                      rows="2"
                      class="mb-3"
                    />
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-text-field
                        v-model.number="dept.order"
                        label="Order"
                        type="number"
                        variant="outlined"
                        density="compact"
                        class="mr-2"
                        style="max-width: 100px"
                      />
                      <v-switch
                        v-model="dept.isVisible"
                        label="Visible"
                        :color="'var(--erp-accent-green)'"
                        density="compact"
                        hide-details
                      />
                    </div>
                    <v-btn 
                      color="error" 
                      variant="text" 
                      size="small"
                      @click="removeDepartment(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      Remove
                    </v-btn>
                  </div>
                </div>
              </div>
              
              <v-btn 
                :color="'var(--erp-accent-green)'" 
                variant="outlined" 
                class="mt-4"
                @click="addDepartment"
              >
                <v-icon class="mr-2">mdi-plus</v-icon>
                Add Stage
              </v-btn>
            </div>
          </div>

          <!-- Team & Roles Step -->
          <div v-if="currentStep === 'team'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Team & Roles</h2>
              <p class="text-body-2 text-medium-emphasis">Assign team members and their roles</p>
            </div>
            
            <div class="roles-container">
              <div class="roles-grid">
                <div 
                  v-for="(role, index) in projectData.roles" 
                  :key="index"
                  class="role-card"
                >
                  <div class="role-header">
                    <v-text-field
                      v-model="role.userEmail"
                      label="User Email"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                      @input="searchUsers(role.userEmail)"
                    />
                    
                    <v-select
                      v-model="role.role"
                      label="Role"
                      :items="roleTypes"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                      @update:model-value="handleRoleChange(index, $event)"
                    />
                    
                    <!-- Role-specific information -->
                    <div v-if="role.role === 'PROJECT_OWNER'" class="role-info mb-3">
                      <v-alert type="info" variant="tonal" density="compact" class="mb-0">
                        <template v-slot:prepend>
                          <v-icon size="small">mdi-crown</v-icon>
                        </template>
                        <span class="text-caption">Project Owner has full access to all departments and can manage the entire project.</span>
                      </v-alert>
                    </div>
                    
                    <v-select
                      v-model="role.departmentId"
                      label="Department"
                      :items="projectData.departments"
                      item-title="name"
                      item-value="order"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                      :rules="role.role === 'PROJECT_OWNER' ? [] : [v => !!v || 'Department is required']"
                      :disabled="role.role === 'PROJECT_OWNER'"
                      :hint="role.role === 'PROJECT_OWNER' ? 'Project Owner has access to all departments' : 'Select department for this role'"
                      persistent-hint
                    />
                    
                    <!-- Payment Configuration -->
                    <div v-if="role.role !== 'PROJECT_OWNER'" class="payment-config-section mb-3">
                      <PaymentConfigForm
                        v-model="role.paymentConfig"
                        :role="role.role"
                      />
                    </div>
                    
                    <v-btn 
                      color="error" 
                      variant="text" 
                      size="small"
                      @click="removeRole(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      Remove
                    </v-btn>
                  </div>
                </div>
              </div>
              
              <v-btn 
                :color="'var(--erp-accent-green)'" 
                variant="outlined" 
                class="mt-4"
                @click="addRole"
              >
                <v-icon class="mr-2">mdi-plus</v-icon>
                Add Team Member
              </v-btn>
            </div>
          </div>

          <!-- Settings Step -->
          <div v-if="currentStep === 'settings'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Project Settings</h2>
              <p class="text-body-2 text-medium-emphasis">Configure additional project settings</p>
            </div>
            
            <v-row>
              <v-col cols="12" md="8">
                <v-form ref="settingsForm" v-model="settingsValid">
                  <v-select
                    v-model="projectData.priority"
                    label="Priority Level"
                    :items="priorityLevels"
                    variant="outlined"
                    class="mb-4"
                  />
                  
                  <v-text-field
                    v-model="projectData.tags"
                    label="Tags"
                    placeholder="Enter tags separated by commas"
                    variant="outlined"
                    class="mb-4"
                  />
                  
                  <v-textarea
                    v-model="projectData.notes"
                    label="Additional Notes"
                    placeholder="Any additional notes or requirements"
                    variant="outlined"
                    rows="4"
                    class="mb-6"
                  />
                </v-form>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card elevation="0" class="pa-4 border rounded-lg">
                  <h4 class="text-subtitle-1 font-weight-medium mb-3">Project Preview</h4>
                  <div class="project-preview">
                    <h5 class="text-subtitle-2 font-weight-medium mb-2">{{ projectData.name || 'Project Name' }}</h5>
                    <p class="text-caption text-medium-emphasis mb-3">{{ projectData.description || 'No description' }}</p>
                    
                    <div class="preview-stats">
                      <div class="stat-item">
                        <span class="stat-label">Stages:</span>
                        <span class="stat-value">{{ projectData.departments.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Team:</span>
                        <span class="stat-value">{{ projectData.roles.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Type:</span>
                        <span class="stat-value">{{ projectData.type || 'Not set' }}</span>
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Navigation Footer -->
        <div class="navigation-footer">
          <div class="d-flex justify-space-between align-center">
            <v-btn 
              v-if="currentStep !== 'foundation'"
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
                v-if="currentStep !== 'settings'"
                variant="text" 
                @click="nextStep"
                :disabled="!canProceedToNext || saving"
              >
                Skip
              </v-btn>
              
              <v-btn 
                v-if="currentStep !== 'settings'"
                :color="'var(--erp-accent-green)'" 
                @click="nextStep"
                :disabled="!canProceedToNext || saving"
                :loading="saving"
              >
                Save & Continue
              </v-btn>
              
              <div v-if="currentStep === 'settings'" class="d-flex flex-column align-end" style="gap: 8px;">
                <v-alert
                  v-if="sizBalance < 1"
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
                      Minimum 0.00 SIZ required to create a project.
                      <span class="ml-1">Current: {{ sizBalance.toFixed(2) }} SIZ</span>
                    </div>
                    <div v-if="balanceError" class="text-error text-caption">{{ balanceError }}</div>
                    <div class="d-flex align-center" style="gap: 8px;">
                      <v-btn
                        color="primary"
                        variant="elevated"
                        size="small"
                        :href="import.meta.env.VITE_SSO_PRIMARY_DOMAIN || '#'"
                        target="_blank"
                      >
                        <v-icon start>mdi-open-in-new</v-icon>
                        Get SIZ on DEX
                      </v-btn>
                      <v-btn
                        variant="outlined"
                        size="small"
                        :loading="balanceLoading"
                        @click="loadWalletSIZBalance()"
                      >
                        <v-icon start>mdi-refresh</v-icon>
                        Refresh Balance
                      </v-btn>
                    </div>
                  </div>
                </v-alert>

                <v-btn 
                  :color="'var(--erp-accent-green)'" 
                  @click="createProject"
                  :disabled="!canSubmit || saving"
                  :loading="saving"
                  size="large"
                >
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
import PaymentConfigForm from './components/PaymentConfigForm.vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { getFINTokenBalance, getFINTokenAddress, getRPCUrl } from '@/services/finTokenService';

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

// Project creation steps
const creationSteps = ref([
  { id: 'foundation', label: 'Foundation', completed: false },
  { id: 'departments', label: 'Departments', completed: false },
  { id: 'team', label: 'Team & Roles', completed: false },
  { id: 'settings', label: 'Settings', completed: false }
]);

const currentStep = ref('foundation');

// Project data structure based on schema
const projectData = reactive({
  name: '',
  description: '',
  type: '' as 'PROGRESSIVE' | 'PARALLEL',
  priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  startDate: '',
  endDate: '',
  isPublic: false,
  allowGuests: false,
  tags: '',
  notes: '',
  departments: [] as Department[],
  roles: [] as Role[]
});

// Form validation
const foundationValid = ref(false);
const settingsValid = ref(false);

// Department select options for roles
const departmentOptions = computed(() =>
  projectData.departments.map((dept, index) => ({ title: dept.name || `Department ${index + 1}`, value: index }))
);

// API state
const loading = ref(false);
const saving = ref(false);
const submitting = ref(false);
const error = ref('');
const success = ref('');

// Data from APIs
const configData = ref<any>(null);
// Removed template/draft state
const userPermissions = ref<any>(null);

// Form options with fallback values (will be enhanced from API)
const projectTypes = ref<Array<{title: string, value: string}>>([
  { title: 'Progressive', value: 'PROGRESSIVE' },
  { title: 'Parallel', value: 'PARALLEL' }
]);
const departmentTypes = ref<Array<{title: string, value: string}>>([
  { title: 'Major', value: 'MAJOR' },
  { title: 'Minor', value: 'MINOR' }
]);
const roleTypes = ref<Array<{title: string, value: string}>>([
  { title: 'Project Owner', value: 'PROJECT_OWNER' },
  { title: 'Project Manager', value: 'PROJECT_MANAGER' },
  { title: 'Employee', value: 'EMPLOYEE' }
]);
const priorityLevels = ref<Array<{title: string, value: string}>>([
  { title: 'Low', value: 'LOW' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'High', value: 'HIGH' },
  { title: 'Critical', value: 'CRITICAL' }
]);
// API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Computed properties
const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 'foundation':
      return projectData.name && projectData.type && projectData.description && projectData.startDate && projectData.endDate;
    case 'departments':
      return projectData.departments.length > 0;
    case 'team':
      return projectData.roles.length > 0 && projectData.roles.every(r => r.role === 'PROJECT_OWNER' ? true : r.departmentId !== null);
    default:
      return true;
  }
});

const canCreateProject = computed(() => {
  return projectData.name && 
         projectData.type && 
         projectData.description &&
         projectData.startDate &&
         projectData.endDate &&
         projectData.departments.length > 0 &&
         projectData.roles.length > 0 &&
         projectData.roles.every(r => r.role === 'PROJECT_OWNER' ? true : r.departmentId !== null) &&
         projectData.priority;
});

// Wallet + FIN balance gating (using MetaMask wallet)
const finBalance = ref(0);
const finBalanceFormatted = ref(0);
const balanceLoading = ref(false);
const balanceError = ref('');

// Use MetaMask wallet
const { user: walletUser, isConnected, chainId } = useMetaMaskWallet();
const walletAddress = computed(() => walletUser.value?.address || '');
const walletConnected = computed(() => isConnected.value && !!walletAddress.value);

const loadWalletFINBalance = async () => {
  finBalance.value = 0;
  finBalanceFormatted.value = 0;
  balanceError.value = '';
  if (!walletAddress.value || !chainId.value) return;
  try {
    balanceLoading.value = true;
    const tokenAddress = getFINTokenAddress(chainId.value);
    const rpcUrl = getRPCUrl(chainId.value);
    
    if (!tokenAddress || !rpcUrl) {
      balanceError.value = 'FIN token not configured for this network';
      return;
    }
    
    const balance = await getFINTokenBalance(walletAddress.value, rpcUrl, tokenAddress);
    if (balance) {
      finBalance.value = Number(balance.amount) / Math.pow(10, balance.decimals || 18);
      finBalanceFormatted.value = parseFloat(balance.formattedBalance);
    } else {
      finBalance.value = 0;
      finBalanceFormatted.value = 0;
    }
  } catch (e: any) {
    balanceError.value = e?.message || 'Failed to load wallet balance';
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

// API Functions
const fetchConfigData = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/config/enums`);
    if (response.ok) {
      const data = await response.json();
      configData.value = data;
      
      // Populate form options
      projectTypes.value = data.projectTypes?.map((type: any) => ({
        title: type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: type
      })) || [];
      
      departmentTypes.value = data.departmentTypes?.map((type: any) => ({
        title: type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: type
      })) || [];
      
      roleTypes.value = data.roles?.map((role: any) => ({
        title: role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: role
      })) || [];
      
      priorityLevels.value = data.priorities?.map((priority: any) => ({
        title: priority.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: priority
      })) || [];
    }
  } catch (err) {
    console.error('Failed to fetch config data:', err);
  }
};

// Templates fetch removed

const fetchUserPermissions = async () => {
  if (!user.value?.id) return;
  
  try {
    const url = `${API_BASE}/api/permissions?resource=project&action=create&userId=${encodeURIComponent(user.value.id)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      userPermissions.value = data;
    }
  } catch (err) {
    console.error('Failed to fetch user permissions:', err);
  }
};

const validateProjectName = async (name: string) => {
  if (!name) return { available: true };
  
  try {
    const response = await fetch(`${API_BASE}/api/projects/validate-name?name=${encodeURIComponent(name)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to validate project name:', err);
  }
  return { available: true };
};

const searchTags = async (query: string) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/tags/suggest?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.suggestions || [];
    }
  } catch (err) {
    console.error('Failed to search tags:', err);
  }
  return [];
};

const searchUsers = async (query: string) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/users/search?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.users || [];
    }
  } catch (err) {
    console.error('Failed to search users:', err);
  }
  return [];
};

const resolveUserEmails = async (emails: string[]) => {
  if (emails.length === 0) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/users/resolve-by-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails })
    });
    if (response.ok) {
      const data = await response.json();
      return data.resolutions || [];
    }
  } catch (err) {
    console.error('Failed to resolve user emails:', err);
  }
  return [];
};

// Draft management removed

// Template Management
// Template application removed

// Project Validation
// Precheck/validation removed (backend disabled)

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

// Department management
const addDepartment = () => {
  projectData.departments.push({
    name: '',
    type: 'MAJOR',
    description: '',
    order: projectData.departments.length,
    isVisible: true
  });
};

const removeDepartment = (index: number) => {
  projectData.departments.splice(index, 1);
  // Reorder remaining departments
  projectData.departments.forEach((dept, idx) => {
    dept.order = idx;
  });
};

// Role management
const addRole = () => {
  projectData.roles.push({
    userEmail: '',
    role: 'EMPLOYEE',
    departmentId: projectData.departments.length > 0 ? 0 : null,
    paymentConfig: {
      paymentType: 'PER_TASK'
    }
  });
};

const removeRole = (index: number) => {
  projectData.roles.splice(index, 1);
};

// Handle role changes to automatically adjust department access
const handleRoleChange = (index: number, newRole: string) => {
  const role = projectData.roles[index];
  if (newRole === 'PROJECT_OWNER') {
    // PROJECT_OWNER gets access to all departments automatically
    role.departmentId = null;
  } else if (role.departmentId === null) {
    // If changing from PROJECT_OWNER to another role, require department selection
    role.departmentId = projectData.departments.length > 0 ? 0 : null;
  }
};

// Ensure creator is PROJECT_OWNER with full project access
const ensureOwnerRole = () => {
  const ownerExists = projectData.roles.some(r => r.role === 'PROJECT_OWNER');
  if (!ownerExists && user.value?.id) {
    const creatorEmail = user.value.email || '';
    projectData.roles.unshift({
      userEmail: creatorEmail,
      userId: user.value.id,
      role: 'PROJECT_OWNER',
      departmentId: null, // Project owner has access to ALL departments automatically
      paymentConfig: {
        paymentType: null // Owner doesn't get paid from their own project
      }
    });
  }
};

// Drag and drop functionality
const draggedDept = ref<number | null>(null);

const startDrag = (index: number) => {
  draggedDept.value = index;
};

const onDrop = (index: number) => {
  if (draggedDept.value === null) return;

  const draggedDepartment = projectData.departments[draggedDept.value];
  const targetDepartment = projectData.departments[index];

  // Swap orders
  const tempOrder = draggedDepartment.order;
  draggedDepartment.order = targetDepartment.order;
  targetDepartment.order = tempOrder;

  // Re-order departments based on new order
  projectData.departments.forEach((dept, idx) => {
    dept.order = idx;
  });

  draggedDept.value = null;
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

// Project creation
const createProject = async () => {
  if (!user.value?.id) {
    error.value = 'User not authenticated';
    return;
  }

  if (!walletAddress.value) {
    error.value = 'Wallet address is required. Please connect your MetaMask wallet.';
    setTimeout(() => error.value = '', 5000);
    return;
  }
  
  if (!meetsFINRequirement.value) {
    error.value = 'You need at least 0.00 FIN in your connected wallet to create a project.';
    setTimeout(() => error.value = '', 5000);
    return;
  }
  
  // Backend precheck removed; rely on client-side gating

  // Ensure owner role
  ensureOwnerRole();
  
  submitting.value = true;
  error.value = '';
  
  try {
    // Prepare project data for API - FIXED to match backend requirements
    const projectPayload = {
      name: projectData.name,
      description: projectData.description,
      type: projectData.type,
      priority: projectData.priority,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      ownerId: user.value.id, // Required by backend
      userId: user.value.id, // Required by backend
      walletAddress: walletAddress.value, // From MetaMask wallet
      departments: projectData.departments.map((dept, index) => ({
        name: dept.name,
        type: dept.type as 'MAJOR' | 'MINOR',
        description: dept.description,
        order: dept.order,
        isVisible: dept.isVisible
      })),
      roles: projectData.roles.map(role => ({
        userEmail: role.userEmail,
        role: role.role as 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE',
        departmentId: role.role === 'PROJECT_OWNER' ? null : role.departmentId, // PROJECT_OWNER gets access to all departments
        // Include payment configuration
        paymentType: role.paymentConfig?.paymentType,
        salaryAmount: role.paymentConfig?.salaryAmount,
        salaryFrequency: role.paymentConfig?.salaryFrequency,
        oversightRate: role.paymentConfig?.oversightRate,
        milestoneAmount: role.paymentConfig?.milestoneAmount
      })),
      tags: projectData.tags ? projectData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Log key fields to ensure userId and wallet are present at send-time
    console.log('[CreateProject] Sending project payload meta:', {
      userId: projectPayload.userId,
      walletAddress: projectPayload.walletAddress,
      name: projectPayload.name,
      departmentsCount: projectPayload.departments.length,
      rolesCount: projectPayload.roles.length
    });
    // Optional: log first role and first department shapes for debugging
    if (projectPayload.roles[0]) {
      console.log('[CreateProject] first role:', {
        userEmail: projectPayload.roles[0].userEmail,
        role: projectPayload.roles[0].role,
        departmentId: projectPayload.roles[0].departmentId
      });
    }
    if (projectPayload.departments[0]) {
      console.log('[CreateProject] first department:', projectPayload.departments[0]);
    }
    
    // Fix departmentId type conversion - convert number to string
    const fixedPayload = {
      ...projectPayload,
      roles: projectPayload.roles.map(role => ({
        ...role,
        departmentId: role.departmentId !== null ? String(role.departmentId) : null
      }))
    };
    
    console.log('[CreateProject] fixedPayload meta:', {
      rolesCount: fixedPayload.roles.length,
      firstRoleDeptIdType: typeof fixedPayload.roles[0]?.departmentId
    });
    const response = await projectApi.createProject(fixedPayload);
    
    if (response) {
      console.log('Project created:', response);
      // Draft cleanup removed
      
      success.value = 'Project created successfully!';
      
      setTimeout(() => {
        router.push('/projects');
      }, 2500);
    } else {
      throw new Error('Failed to create project');
    }
  } catch (err) {
    console.error('[CreateProject] Error creating project:', err);
    // If we have server details, surface them
    const serverMsg = (err as any)?.response?.data?.error || (err as any)?.response?.data?.message;
    error.value = serverMsg || (err instanceof Error ? err.message : 'Failed to create project');
    setTimeout(() => error.value = '', 5000);
  } finally {
    submitting.value = false;
  }
};

// Auto-save draft when data changes
// Draft autosave removed

// Watch for step changes to ensure owner role and default department
watch(currentStep, async (newStep) => {
  if (newStep === 'team') {
    await ensureOwnerRole();
    // Ensure default department for new roles if no departments exist
    if (projectData.departments.length === 0) {
      addDepartment();
    }
  }
});

// Watch for department changes to ensure default department for new roles
watch(projectData.departments, async (newDepartments) => {
  if (currentStep.value === 'team') {
    // Ensure default department for new roles if no departments exist
    if (newDepartments.length === 0) {
      addDepartment();
    }
  }
});

// Initialize data
onMounted(async () => {
  loading.value = true;
  
  try {
    // Fetch all configuration data in parallel
    await Promise.all([
      fetchConfigData(),
      fetchUserPermissions()
    ]);
    
    // Add sample data for testing
    addDepartment();
    addRole();
    
  } catch (err) {
    console.error('Failed to initialize:', err);
    error.value = 'Failed to load configuration data';
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

/* Progress Steps */
.progress-container {
  background: var(--erp-card-bg);
  padding: 24px 32px;
  border-bottom: 1px solid var(--erp-border);
  position: relative;
}

.progress-line {
  position: absolute;
  left: 32px;
  top: 50%;
  width: calc(100% - 64px);
  height: 2px;
  background: var(--erp-border);
  transform: translateY(-50%);
  z-index: 1;
}

.progress-steps {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
}

.progress-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  transition: all 0.3s ease;
  background: var(--erp-card-bg);
  color: var(--erp-text);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgb(var(--v-theme-outline-variant));
  margin-bottom: 8px;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100px;
  height: 2px;
  background: var(--erp-border);
  transform: translateX(-50%);
}

.step-number.completed {
  background: var(--erp-accent-green);
  color: white;
  border-color: var(--erp-accent-green);
}

.step-number.current {
  background: var(--erp-accent-green);
  color: white;
  border-color: var(--erp-accent-green);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.2);
}

.step-number.pending {
  background: var(--erp-card-bg);
  color: var(--erp-text);
  border-color: var(--erp-border);
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  text-align: center;
  white-space: nowrap;
}

.departments-container {
  margin-top: 24px;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.department-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: var(--erp-surface);
  border-radius: 8px;
  overflow: hidden;
}

.department-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.department-card.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.department-header {
  padding: 16px;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.department-header .v-field {
  margin-bottom: 12px;
}

.department-header .v-field:last-child {
  margin-bottom: 0;
}

.roles-container {
  margin-top: 24px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.role-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: var(--erp-surface);
  border-radius: 8px;
  overflow: hidden;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.role-header {
  padding: 16px;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.role-header .v-field {
  margin-bottom: 12px;
}

.role-header .v-field:last-child {
  margin-bottom: 0;
}

.dept-type-select {
  min-width: 100px;
}

.role-select {
  min-width: 150px;
}

.roles-list {
  max-height: 400px;
  overflow-y: auto;
}

.role-item {
  transition: all 0.2s ease;
}

.role-item:hover {
  transform: translateX(4px);
}

.project-preview {
  transition: all 0.3s ease;
}

.project-preview h5 {
  color: var(--erp-text);
}

.project-preview p {
  color: rgb(var(--v-theme-on-surface-variant));
}

.preview-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
}

.stat-value {
  color: var(--erp-text);
  font-weight: 500;
  font-size: 1rem;
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
