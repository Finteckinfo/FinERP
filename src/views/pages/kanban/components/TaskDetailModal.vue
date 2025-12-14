<template>
  <v-dialog v-model="localValue" max-width="800" scrollable>
    <v-card v-if="task">
      <!-- Header -->
      <v-card-title class="task-header">
        <div class="header-content">
          <div class="task-info">
            <v-chip
              :color="getPriorityColor(task.priority)"
              size="small"
              variant="flat"
              class="mr-3"
            >
              {{ task.priority }}
            </v-chip>
            <h2 class="task-title">{{ task.title }}</h2>
          </div>
          
          <div class="header-actions">
            <v-btn
              v-if="userPermissions.canEditAllTasks || task.canEdit"
              icon
              variant="text"
              @click="editMode = !editMode"
            >
              <v-icon>{{ editMode ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              @click="localValue = false"
              aria-label="Close"
              title="Close"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="task-content">
        <v-row>
          <!-- Main Content -->
          <v-col cols="12" md="8">
            <!-- Task Description -->
            <div class="content-section">
              <h3 class="section-title">Description</h3>
              <div v-if="!editMode" class="task-description">
                <p v-if="task.description">{{ task.description }}</p>
                <p v-else class="text-medium-emphasis">No description provided</p>
              </div>
              <v-textarea
                v-else
                v-model="editableTask.description"
                label="Description"
                variant="outlined"
                rows="4"
                hide-details="auto"
              />
            </div>

            <!-- Progress Section -->
            <div class="content-section">
              <h3 class="section-title">Progress</h3>
              <div v-if="!editMode" class="progress-display">
                <div class="progress-info">
                  <span class="progress-text">{{ task.progress || 0 }}% Complete</span>
                  <v-progress-linear
                    :model-value="task.progress || 0"
                    :color="getProgressColor(task.progress || 0)"
                    height="8"
                    rounded
                    class="mt-2"
                  />
                </div>
              </div>
              <div v-else class="progress-edit">
                <v-slider
                  v-model="editableTask.progress"
                  :min="0"
                  :max="100"
                  :step="5"
                  thumb-label
                  hide-details="auto"
                />
              </div>
            </div>

            <!-- Checklist Section -->
            <div v-if="task.checklistCount" class="content-section">
              <h3 class="section-title">Checklist</h3>
              <div class="checklist-info">
                <div class="checklist-progress">
                  <v-icon color="primary" class="mr-2">mdi-format-list-checks</v-icon>
                  <span>{{ task.checklistCompleted || 0 }} of {{ task.checklistCount }} completed</span>
                  <v-progress-circular
                    :model-value="checklistProgress"
                    :color="getProgressColor(checklistProgress)"
                    size="24"
                    width="3"
                    class="ml-auto"
                  />
                </div>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div class="content-section">
              <div class="d-flex align-center justify-space-between mb-3">
                <h3 class="section-title mb-0">Activity</h3>
                <v-btn
                  size="small"
                  variant="outlined"
                  :loading="loadingActivity"
                  @click="loadActivity"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </div>
              
              <div v-if="loadingActivity" class="activity-loading">
                <v-skeleton-loader
                  v-for="i in 3"
                  :key="i"
                  type="list-item-avatar"
                  class="mb-2"
                />
              </div>
              
              <div v-else-if="activities.length === 0" class="no-activity">
                <p class="text-medium-emphasis">No activity recorded</p>
              </div>
              
              <v-timeline v-else density="compact" class="activity-timeline">
                <v-timeline-item
                  v-for="activity in activities"
                  :key="activity.id"
                  :dot-color="getActivityColor(activity.type)"
                  size="small"
                >
                  <div class="activity-item">
                    <div class="activity-header">
                      <span class="activity-user">{{ activity.userEmail }}</span>
                      <span class="activity-time">{{ formatActivityTime(activity.timestamp) }}</span>
                    </div>
                    <p class="activity-description">{{ activity.description }}</p>
                    <div v-if="activity.previousValue || activity.newValue" class="activity-changes">
                      <span v-if="activity.previousValue" class="change-from">
                        From: <strong>{{ activity.previousValue }}</strong>
                      </span>
                      <span v-if="activity.newValue" class="change-to">
                        To: <strong>{{ activity.newValue }}</strong>
                      </span>
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </div>
          </v-col>

          <!-- Sidebar -->
          <v-col cols="12" md="4">
            <div class="task-sidebar">
              <!-- Status -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Status</h4>
                <div v-if="!editMode" class="status-display">
                  <v-chip
                    :color="getStatusColor(task.status)"
                    variant="flat"
                    size="small"
                  >
                    {{ getStatusTitle(task.status) }}
                  </v-chip>
                </div>
                <v-select
                  v-else
                  v-model="editableTask.status"
                  :items="statusOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <!-- Assignee -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Assignee</h4>
                <div v-if="!editMode" class="assignee-display">
                  <div v-if="task.assignedUser" class="assignee-info">
                    <v-avatar
                      size="32"
                      :color="getAvatarColor(task.assignedUser.email)"
                      class="mr-3"
                    >
                      <v-img
                        v-if="task.assignedUser.avatar"
                        :src="task.assignedUser.avatar"
                        :alt="task.assignedUser.name || task.assignedUser.email"
                      />
                      <span v-else class="text-caption">
                        {{ getInitials(task.assignedUser.name || task.assignedUser.email) }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="assignee-name">{{ task.assignedUser.name || task.assignedUser.email }}</div>
                      <div class="assignee-email">{{ task.assignedUser.email }}</div>
                    </div>
                  </div>
                  <p v-else class="text-medium-emphasis">Unassigned</p>
                </div>
                <v-select
                  v-else
                  v-model="editableTask.assignedRoleId"
                  :items="assigneeOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </div>

              <!-- Priority -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Priority</h4>
                <div v-if="!editMode">
                  <v-chip
                    :color="getPriorityColor(task.priority)"
                    variant="flat"
                    size="small"
                  >
                    {{ task.priority }}
                  </v-chip>
                </div>
                <v-select
                  v-else
                  v-model="editableTask.priority"
                  :items="priorityOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <!-- Due Date -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Due Date</h4>
                <div v-if="!editMode" class="due-date-display">
                  <div v-if="task.dueDate" class="due-date-info" :class="dueDateClasses">
                    <v-icon :color="dueDateColor" class="mr-2">mdi-calendar</v-icon>
                    <span>{{ formatDueDate(task.dueDate) }}</span>
                  </div>
                  <p v-else class="text-medium-emphasis">No due date set</p>
                </div>
                <v-text-field
                  v-else
                  v-model="editableTask.dueDate"
                  type="date"
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </div>

              <!-- Department -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Department</h4>
                <div class="department-info">
                  <v-chip
                    :color="task.department.color || 'primary'"
                    variant="outlined"
                    size="small"
                  >
                    {{ task.department.name }}
                  </v-chip>
                </div>
              </div>

              <!-- Time Tracking -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Time</h4>
                <div class="time-info">
                  <div v-if="task.estimatedHours" class="time-item">
                    <span class="time-label">Estimated:</span>
                    <span class="time-value">{{ task.estimatedHours }}h</span>
                  </div>
                  <div v-if="task.actualHours" class="time-item">
                    <span class="time-label">Actual:</span>
                    <span class="time-value">{{ task.actualHours }}h</span>
                  </div>
                </div>
              </div>

              <!-- Payment Information -->
              <div v-if="task.paymentAmount" class="sidebar-section payment-section">
                <h4 class="sidebar-title">
                  <v-icon size="18" color="success" class="mr-1">mdi-cash</v-icon>
                  Payment
                </h4>
                <div class="payment-info">
                  <div class="payment-amount">
                    <span class="amount-value">{{ task.paymentAmount.toFixed(2) }} FIN</span>
                  </div>
                  <v-chip
                    :color="getPaymentStatusColor(task.paymentStatus || 'PENDING')"
                    size="small"
                    variant="tonal"
                    class="mt-2"
                  >
                    <v-icon start size="14">{{ getPaymentStatusIcon(task.paymentStatus || 'PENDING') }}</v-icon>
                    {{ getPaymentStatusLabel(task.paymentStatus || 'PENDING') }}
                  </v-chip>
                  
                  <!-- Show transaction link if paid -->
                  <div v-if="task.paymentTxHash" class="mt-2">
                    <a 
                      :href="getExplorerUrl(task.paymentTxHash)" 
                      target="_blank" 
                      class="tx-link"
                    >
                      <v-icon size="14" class="mr-1">mdi-open-in-new</v-icon>
                      View Transaction
                    </a>
                  </div>
                </div>
              </div>

              <!-- Timestamps -->
              <div class="sidebar-section">
                <h4 class="sidebar-title">Created</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ formatTimestamp(task.createdAt) }}
                </p>
                <h4 class="sidebar-title mt-3">Last Updated</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ formatTimestamp(task.updatedAt) }}
                </p>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions v-if="editMode" class="px-6 pb-4">
        <v-btn
          variant="outlined"
          @click="cancelEdit"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="userPermissions.canDeleteTasks || task.canDelete"
          color="error"
          variant="outlined"
          @click="confirmDelete = true"
        >
          Delete Task
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          @click="saveChanges"
        >
          Save Changes
        </v-btn>
      </v-card-actions>

      <!-- Approve & Pay Action (for managers/owners when task is completed) -->
      <v-card-actions 
        v-else-if="canApproveAndPay" 
        class="px-6 pb-4 bg-success-lighten-5"
      >
        <div class="approve-pay-info">
          <v-icon color="success" class="mr-2">mdi-information</v-icon>
          <span class="text-caption">
            Task completed. Approve to release payment of <strong>{{ task.paymentAmount?.toFixed(2) }} FIN</strong>
          </span>
        </div>
        <v-spacer />
        <v-btn
          color="success"
          variant="elevated"
          :loading="approving"
          @click="confirmApproveAndPay = true"
        >
          <v-icon start>mdi-check-circle</v-icon>
          Approve & Pay
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Approve & Pay Confirmation -->
    <v-dialog v-model="confirmApproveAndPay" max-width="500">
      <v-card>
        <v-card-title class="text-success">
          <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
          Approve Task & Release Payment
        </v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              <strong>Task:</strong> {{ task?.title }}
            </div>
            <div class="text-body-2 mt-2">
              <strong>Payment Amount:</strong> {{ task?.paymentAmount?.toFixed(2) }} FIN
            </div>
            <div class="text-body-2 mt-2">
              <strong>Assignee:</strong> {{ task?.assignedUser?.name || task?.assignedUser?.email || 'Unassigned' }}
            </div>
          </v-alert>
          
          <p class="text-body-2">
            By approving this task, you confirm that:
          </p>
          <ul class="text-body-2 mt-2 ml-4">
            <li>The task has been completed satisfactorily</li>
            <li>Payment will be released from escrow to the assignee's wallet</li>
            <li>This action cannot be undone</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="confirmApproveAndPay = false">
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="success"
            variant="elevated"
            :loading="approving"
            @click="approveAndPayTask"
          >
            <v-icon start>mdi-lock-open</v-icon>
            Approve & Release Payment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title class="text-error">
          <v-icon class="mr-2">mdi-alert-triangle</v-icon>
          Delete Task
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this task? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="confirmDelete = false">
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteTask"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { kanbanApi } from '../services/kanbanApi';
import { taskApi } from '@/services/projectApi';
import type { KanbanTask, TaskActivity } from '../types/kanban';

interface Props {
  modelValue: boolean;
  task: KanbanTask | null;
  userPermissions: {
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
  };
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'task-updated', task: KanbanTask): void;
  (e: 'task-deleted', taskId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const editMode = ref(false);
const saving = ref(false);
const deleting = ref(false);
const approving = ref(false);
const loadingActivity = ref(false);
const confirmDelete = ref(false);
const confirmApproveAndPay = ref(false);
const activities = ref<TaskActivity[]>([]);
const editableTask = ref<Partial<KanbanTask>>({});

// Options
const statusOptions = [
  { title: 'To Do', value: 'PENDING' },
  { title: 'In Progress', value: 'IN_PROGRESS' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Approved', value: 'APPROVED' }
];

const priorityOptions = [
  { title: 'Critical', value: 'CRITICAL' },
  { title: 'High', value: 'HIGH' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'Low', value: 'LOW' }
];

const assigneeOptions = ref([
  { title: 'Unassigned', value: null },
  { title: 'John Doe', value: 'user1' },
  { title: 'Jane Smith', value: 'user2' }
  // This would be loaded from your project's team members
]);

// Computed
const checklistProgress = computed(() => {
  if (!props.task?.checklistCount) return 0;
  return Math.round(((props.task.checklistCompleted || 0) / props.task.checklistCount) * 100);
});

const isOverdue = computed(() => {
  if (!props.task?.dueDate) return false;
  return new Date(props.task.dueDate) < new Date();
});

const isDueSoon = computed(() => {
  if (!props.task?.dueDate || isOverdue.value) return false;
  const dueDate = new Date(props.task.dueDate);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
});

const dueDateClasses = computed(() => ({
  'due-overdue': isOverdue.value,
  'due-soon': isDueSoon.value
}));

const dueDateColor = computed(() => {
  if (isOverdue.value) return 'error';
  if (isDueSoon.value) return 'warning';
  return 'grey';
});

// Check if user can approve and pay this task
const canApproveAndPay = computed(() => {
  if (!props.task) return false;
  
  // Task must be completed (not yet approved)
  const isCompleted = props.task.status === 'COMPLETED';
  
  // Task must have a payment amount
  const hasPayment = props.task.paymentAmount && props.task.paymentAmount > 0;
  
  // Payment must not be already paid
  const notPaid = props.task.paymentStatus !== 'PAID';
  
  // User must have permission (manager or owner)
  const hasPermission = props.userPermissions.canEditAllTasks; // Managers/owners can edit all tasks
  
  return isCompleted && hasPayment && notPaid && hasPermission;
});

// Methods
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'error';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW': return 'success';
    default: return 'grey';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'grey';
    case 'IN_PROGRESS': return 'warning';
    case 'COMPLETED': return 'success';
    case 'APPROVED': return 'primary';
    default: return 'grey';
  }
};

const getStatusTitle = (status: string) => {
  const option = statusOptions.find(s => s.value === status);
  return option?.title || status;
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return 'success';
  if (progress >= 75) return 'info';
  if (progress >= 50) return 'warning';
  if (progress >= 25) return 'orange';
  return 'error';
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'CREATED': return 'success';
    case 'STATUS_CHANGED': return 'info';
    case 'ASSIGNED': return 'primary';
    case 'UPDATED': return 'warning';
    case 'DELETED': return 'error';
    default: return 'grey';
  }
};

const getAvatarColor = (email: string) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDueDate = (dueDate: string) => {
  return new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatActivityTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Payment helper functions
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'grey';
    case 'ALLOCATED': return 'info';
    case 'PROCESSING': return 'warning';
    case 'PAID': return 'success';
    case 'FAILED': return 'error';
    case 'REFUNDED': return 'secondary';
    default: return 'grey';
  }
};

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Not Allocated';
    case 'ALLOCATED': return 'Reserved';
    case 'PROCESSING': return 'Processing';
    case 'PAID': return 'Paid';
    case 'FAILED': return 'Failed';
    case 'REFUNDED': return 'Refunded';
    default: return status;
  }
};

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING': return 'mdi-clock-outline';
    case 'ALLOCATED': return 'mdi-lock';
    case 'PROCESSING': return 'mdi-loading';
    case 'PAID': return 'mdi-check-circle';
    case 'FAILED': return 'mdi-alert-circle';
    case 'REFUNDED': return 'mdi-undo';
    default: return 'mdi-help-circle';
  }
};

const getExplorerUrl = (txHash: string) => {
  const network = localStorage.getItem('algorand_network') || 'testnet';
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.perawallet.app/tx/'
    : 'https://testnet.explorer.perawallet.app/tx/';
  return baseUrl + txHash;
};

const loadActivity = async () => {
  if (!props.task) return;
  
  try {
    loadingActivity.value = true;
    const response = await kanbanApi.getTaskActivity(props.task.id);
    activities.value = response.activities;
  } catch (error) {
    console.error('[TaskDetailModal] Failed to load activity:', error);
  } finally {
    loadingActivity.value = false;
  }
};

const saveChanges = async () => {
  if (!props.task) return;
  
  try {
    saving.value = true;
    
    // Only send the fields that can be updated
    const updateData = {
      title: editableTask.value.title,
      description: editableTask.value.description,
      status: editableTask.value.status,
      priority: editableTask.value.priority,
      assignedRoleId: editableTask.value.assignedRoleId,
      dueDate: editableTask.value.dueDate,
      progress: editableTask.value.progress,
      estimatedHours: editableTask.value.estimatedHours,
      actualHours: editableTask.value.actualHours
    };
    
    const updatedTask = await taskApi.updateTask(props.task.id, updateData);
    
    emit('task-updated', { ...props.task, ...updatedTask });
    editMode.value = false;
    
  } catch (error: any) {
    console.error('[TaskDetailModal] Failed to save changes:', error);
    // You might want to show an error message here
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  editMode.value = false;
  if (props.task) {
    editableTask.value = { ...props.task };
  }
};

const deleteTask = async () => {
  if (!props.task) return;
  
  try {
    deleting.value = true;
    
    await taskApi.deleteTask(props.task.id);
    
    emit('task-deleted', props.task.id);
    confirmDelete.value = false;
    localValue.value = false;
    
  } catch (error: any) {
    console.error('[TaskDetailModal] Failed to delete task:', error);
    // You might want to show an error message here
  } finally {
    deleting.value = false;
  }
};

const approveAndPayTask = async () => {
  if (!props.task) return;
  
  try {
    approving.value = true;
    
    // Import payment service
    const { approveAndPayTask: approvePaymentAPI, FIN_TOKEN_CONFIG } = await import('@/services/paymentService');
    
    // Call the approve and pay API
    const result = await approvePaymentAPI(props.task.id);
    
    if (result.success) {
      // Check if employee was opted in
      if (result.employeeOptedIn === false) {
        console.warn('⚠️ Employee wallet not opted into token. Backend will handle opt-in.');
      }
      
      // Update task status to APPROVED and payment status
      const updatedTask = {
        ...props.task,
        status: 'APPROVED' as const,
        paymentStatus: result.jobId ? 'PROCESSING' as const : 'PAID' as const,
        paymentTxHash: result.txHash
      };
      
      emit('task-updated', updatedTask);
      
      // Show success message with asset info and oversight payments
      let message = result.txHash 
        ? `✅ ${result.message}\n\n🪙 FIN (Token ${FIN_TOKEN_CONFIG.ASSET_ID})\n📝 TX: ${result.txHash.substring(0, 10)}...`
        : `✅ ${result.message}`;
      
      // Add oversight payment info if present
      if (result.oversightPayments && result.oversightPayments.length > 0) {
        message += '\n\n💼 Manager Oversight Fees:';
        result.oversightPayments.forEach((oversight: any) => {
          message += `\n  - ${oversight.managerName}: ${oversight.amount.toFixed(2)} FIN (${(oversight.rate * 100).toFixed(1)}%)`;
        });
      }
      
      console.log(message);
      
      // Close dialogs
      confirmApproveAndPay.value = false;
      
      // Optionally close the detail modal after success
      setTimeout(() => {
        localValue.value = false;
      }, 2000);
    }
    
  } catch (error: any) {
    console.error('[TaskDetailModal] Failed to approve and pay:', error);
    
    // Import token config for error messages
    const { FIN_TOKEN_CONFIG } = await import('@/services/paymentService');
    
    // Show detailed error with token context
    const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
    const isOptInError = errorMsg.toLowerCase().includes('opt') || errorMsg.toLowerCase().includes('asset');
    
    const errorMessage = isOptInError
      ? `❌ Payment Failed: Employee wallet must be opted into token (Token ${FIN_TOKEN_CONFIG.ASSET_ID}).\n\n${errorMsg}`
      : `❌ Failed to approve task: ${errorMsg}`;
    
    alert(errorMessage);
  } finally {
    approving.value = false;
  }
};

// Watch for task changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    editableTask.value = { ...newTask };
    loadActivity();
  }
}, { immediate: true });

// Reset edit mode when modal closes
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    editMode.value = false;
  }
});
</script>

<style scoped>
.task-header {
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.task-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  word-break: break-word;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-content {
  padding: 1.5rem;
}

.content-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 1rem 0;
}

.task-description {
  color: var(--erp-text);
  line-height: 1.6;
}

.progress-display {
  margin-bottom: 1rem;
}

.progress-text {
  font-weight: 500;
  color: var(--erp-text);
}

.checklist-info {
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 8px;
  border: 1px solid var(--erp-border);
}

.checklist-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activity-timeline {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  padding-bottom: 0.5rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.activity-user {
  font-weight: 500;
  color: var(--erp-text);
}

.activity-time {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--erp-text);
  margin: 0 0 0.5rem 0;
}

.activity-changes {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.8;
}

.task-sidebar {
  background: var(--erp-surface);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--erp-border);
}

.sidebar-section {
  margin-bottom: 1.5rem;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 0.5rem 0;
}

.assignee-info {
  display: flex;
  align-items: center;
}

.assignee-name {
  font-weight: 500;
  color: var(--erp-text);
  font-size: 0.875rem;
}

.assignee-email {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.due-date-info {
  display: flex;
  align-items: center;
}

.due-overdue {
  color: #ef4444;
}

.due-soon {
  color: #f59e0b;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.time-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--erp-text);
}

/* Payment Section */
.payment-section {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-amount {
  margin-bottom: 4px;
}

.amount-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--erp-accent-green);
  letter-spacing: 0.5px;
}

.tx-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--erp-accent-blue);
  text-decoration: none;
  transition: all 0.2s ease;
}

.tx-link:hover {
  text-decoration: underline;
  opacity: 0.8;
}

.approve-pay-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .v-dialog {
    margin: 1rem;
    max-width: calc(100vw - 2rem) !important;
  }
  
  .v-card {
    margin: 0;
  }
  
  .task-content {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .task-info {
    width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .task-sidebar {
    margin-top: 1rem;
  }
  
  .v-card-actions {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .v-card-actions .v-btn {
    min-width: auto;
    flex: 1;
  }
}

@media (max-width: 480px) {
  .v-dialog {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem) !important;
  }
  
  .task-content {
    padding: 0.75rem;
  }
  
  .task-sidebar {
    padding: 0.75rem;
  }
  
  .v-card-actions {
    padding: 0.75rem;
    flex-direction: column;
  }
  
  .v-card-actions .v-btn {
    width: 100%;
  }
  
  .task-title {
    font-size: 1.125rem;
  }
  
  .section-title {
    font-size: 0.875rem;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .v-dialog {
    max-width: 900px !important;
  }
  
  .task-content {
    padding: 2rem;
  }
  
  .task-sidebar {
    padding: 1.5rem;
  }
  
  .v-card-actions {
    padding: 1.5rem 2rem 2rem;
  }
}

@media (min-width: 1920px) {
  .v-dialog {
    max-width: 1000px !important;
  }
  
  .task-content {
    padding: 2.5rem;
  }
  
  .task-sidebar {
    padding: 2rem;
  }
  
  .v-card-actions {
    padding: 2rem 2.5rem 2.5rem;
  }
  
  .task-title {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.125rem;
  }
}
</style>
