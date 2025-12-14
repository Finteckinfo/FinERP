<template>
  <v-dialog v-model="localValue" max-width="500" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3" color="primary">mdi-format-list-checks</v-icon>
        Bulk Actions
        <v-spacer />
        <v-chip size="small" variant="outlined">
          {{ taskIds.length }} tasks selected
        </v-chip>
      </v-card-title>

      <v-card-text>
        <div class="bulk-actions-form">
          <!-- Action Type Selection -->
          <div class="action-section">
            <h4 class="section-title">Choose Action</h4>
            <v-radio-group v-model="selectedAction" hide-details>
              <v-radio
                value="status"
                label="Change Status"
                color="primary"
              />
              <v-radio
                value="assignee"
                label="Reassign Tasks"
                color="primary"
              />
              <v-radio
                value="priority"
                label="Change Priority"
                color="primary"
              />
              <v-radio
                value="due-date"
                label="Set Due Date"
                color="primary"
              />
              <v-radio
                value="progress"
                label="Update Progress"
                color="primary"
              />
            </v-radio-group>
          </div>

          <!-- Action Configuration -->
          <div v-if="selectedAction" class="config-section">
            <h4 class="section-title">Configuration</h4>

            <!-- Status Change -->
            <div v-if="selectedAction === 'status'">
              <v-select
                v-model="bulkUpdate.status"
                :items="statusOptions"
                label="New Status"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </div>

            <!-- Assignee Change -->
            <div v-if="selectedAction === 'assignee'">
              <v-select
                v-model="bulkUpdate.assignedRoleId"
                :items="assigneeOptions"
                label="Assign To"
                variant="outlined"
                density="compact"
                hide-details="auto"
                clearable
              />
            </div>

            <!-- Priority Change -->
            <div v-if="selectedAction === 'priority'">
              <v-select
                v-model="bulkUpdate.priority"
                :items="priorityOptions"
                label="New Priority"
                variant="outlined"
                density="compact"
                hide-details="auto"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-icon :color="getPriorityColor(item.value)">
                        mdi-flag
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </div>

            <!-- Due Date Change -->
            <div v-if="selectedAction === 'due-date'">
              <v-text-field
                v-model="bulkUpdate.dueDate"
                type="date"
                label="Due Date"
                variant="outlined"
                density="compact"
                hide-details="auto"
                clearable
              />
            </div>

            <!-- Progress Update -->
            <div v-if="selectedAction === 'progress'">
              <div class="progress-input">
                <v-slider
                  v-model="bulkUpdate.progress"
                  :min="0"
                  :max="100"
                  :step="5"
                  thumb-label
                  label="Progress"
                  hide-details="auto"
                />
                <v-text-field
                  v-model.number="bulkUpdate.progress"
                  type="number"
                  :min="0"
                  :max="100"
                  suffix="%"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  class="ml-4"
                  style="width: 100px;"
                />
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="selectedAction && isValidUpdate" class="preview-section">
            <h4 class="section-title">Preview</h4>
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
            >
              {{ getPreviewText() }}
            </v-alert>
          </div>

          <!-- Warning for destructive actions -->
          <div v-if="isDestructiveAction" class="warning-section">
            <v-alert
              type="warning"
              variant="tonal"
              density="compact"
            >
              <v-icon class="mr-2">mdi-alert-triangle</v-icon>
              This action will affect {{ taskIds.length }} tasks and cannot be undone.
            </v-alert>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-btn
          variant="outlined"
          @click="cancel"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="!isValidUpdate"
          :loading="loading"
          @click="executeBulkAction"
        >
          Apply to {{ taskIds.length }} tasks
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Results Dialog -->
    <v-dialog v-model="showResults" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon 
            :color="results.summary.failed > 0 ? 'warning' : 'success'" 
            class="mr-3"
          >
            {{ results.summary.failed > 0 ? 'mdi-alert-circle' : 'mdi-check-circle' }}
          </v-icon>
          Bulk Action Results
        </v-card-title>

        <v-card-text>
          <div class="results-summary">
            <v-row>
              <v-col cols="4">
                <div class="stat-card success">
                  <div class="stat-number">{{ results.summary.successful }}</div>
                  <div class="stat-label">Successful</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="stat-card error">
                  <div class="stat-number">{{ results.summary.failed }}</div>
                  <div class="stat-label">Failed</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="stat-card info">
                  <div class="stat-number">{{ results.summary.total }}</div>
                  <div class="stat-label">Total</div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Failed Tasks -->
          <div v-if="results.failedTasks.length > 0" class="failed-tasks">
            <h4 class="section-title">Failed Tasks</h4>
            <v-list density="compact">
              <v-list-item
                v-for="failedTask in results.failedTasks"
                :key="failedTask.id"
                class="error-item"
              >
                <template #prepend>
                  <v-icon color="error">mdi-alert-circle</v-icon>
                </template>
                <v-list-item-title>Task {{ failedTask.id }}</v-list-item-title>
                <v-list-item-subtitle>{{ failedTask.error }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="closeResults"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { kanbanApi } from '../services/kanbanApi';
import type { BulkTaskUpdate, BulkUpdateResult } from '../types/kanban';

interface Props {
  modelValue: boolean;
  taskIds: string[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'actions-completed', results: BulkUpdateResult): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const selectedAction = ref<string>('');
const loading = ref(false);
const showResults = ref(false);
const results = ref<BulkUpdateResult>({
  updatedTasks: [],
  failedTasks: [],
  summary: { total: 0, successful: 0, failed: 0 }
});

const bulkUpdate = ref<BulkTaskUpdate & {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  assignedRoleId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
  progress?: number;
}>({
  taskIds: props.taskIds,
  updates: {},
  status: undefined,
  assignedRoleId: undefined,
  priority: undefined,
  dueDate: undefined,
  progress: undefined
});

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
const isValidUpdate = computed(() => {
  if (!selectedAction.value) return false;
  
  switch (selectedAction.value) {
    case 'status':
      return !!bulkUpdate.value.status;
    case 'assignee':
      return bulkUpdate.value.assignedRoleId !== undefined;
    case 'priority':
      return !!bulkUpdate.value.priority;
    case 'due-date':
      return !!bulkUpdate.value.dueDate;
    case 'progress':
      return bulkUpdate.value.progress !== undefined;
    default:
      return false;
  }
});

const isDestructiveAction = computed(() => {
  return ['status', 'assignee', 'priority'].includes(selectedAction.value);
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

const getPreviewText = () => {
  const count = props.taskIds.length;
  
  switch (selectedAction.value) {
    case 'status': {
      const statusTitle = statusOptions.find(s => s.value === bulkUpdate.value.status)?.title;
      return `Change status of ${count} tasks to "${statusTitle}"`;
    }
    case 'assignee': {
      const assigneeName = assigneeOptions.value.find(a => a.value === bulkUpdate.value.assignedRoleId)?.title;
      return `Assign ${count} tasks to "${assigneeName}"`;
    }
    case 'priority': {
      const priorityTitle = priorityOptions.find(p => p.value === bulkUpdate.value.priority)?.title;
      return `Change priority of ${count} tasks to "${priorityTitle}"`;
    }
    case 'due-date': {
      const dueDate = new Date(bulkUpdate.value.dueDate!).toLocaleDateString();
      return `Set due date of ${count} tasks to ${dueDate}`;
    }
    case 'progress':
      return `Update progress of ${count} tasks to ${bulkUpdate.value.progress}%`;
    default:
      return '';
  }
};

const executeBulkAction = async () => {
  try {
    loading.value = true;
    
    console.log('[BulkActionsModal] Executing bulk action:', {
      action: selectedAction.value,
      taskIds: props.taskIds,
      updates: bulkUpdate.value.updates
    });
    
    // Sync the form values to the updates object
    const updates: any = {};
    if (bulkUpdate.value.status) updates.status = bulkUpdate.value.status;
    if (bulkUpdate.value.assignedRoleId !== undefined) updates.assignedRoleId = bulkUpdate.value.assignedRoleId;
    if (bulkUpdate.value.priority) updates.priority = bulkUpdate.value.priority;
    if (bulkUpdate.value.dueDate) updates.dueDate = bulkUpdate.value.dueDate;
    if (bulkUpdate.value.progress !== undefined) updates.progress = bulkUpdate.value.progress;
    
    const result = await kanbanApi.bulkUpdateTasks({
      taskIds: props.taskIds,
      updates: updates
    });
    
    results.value = result;
    showResults.value = true;
    localValue.value = false;
    
    emit('actions-completed', result);
    
  } catch (error: any) {
    console.error('[BulkActionsModal] Failed to execute bulk action:', error);
    
    // Show error in results
    results.value = {
      updatedTasks: [],
      failedTasks: props.taskIds.map(id => ({ id, error: error.message || 'Unknown error' })),
      summary: {
        total: props.taskIds.length,
        successful: 0,
        failed: props.taskIds.length
      }
    };
    showResults.value = true;
    localValue.value = false;
    
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  localValue.value = false;
  resetForm();
};

const closeResults = () => {
  showResults.value = false;
  resetForm();
};

const resetForm = () => {
  selectedAction.value = '';
  bulkUpdate.value = {
    taskIds: props.taskIds,
    updates: {}
  };
};

// Watch for action changes to clear previous updates
watch(selectedAction, (newAction) => {
  bulkUpdate.value.updates = {};
  
  // Initialize default values based on action
  switch (newAction) {
    case 'progress':
      bulkUpdate.value.updates.progress = 0;
      break;
  }
});

// Watch for updates and sync to bulkUpdate
watch(() => bulkUpdate.value.updates, (updates) => {
  // Remove undefined values
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof typeof updates] === undefined) {
      delete updates[key as keyof typeof updates];
    }
  });
}, { deep: true });
</script>

<style scoped>
.bulk-actions-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-section,
.config-section,
.preview-section,
.warning-section {
  padding: 1rem;
  border: 1px solid var(--erp-border);
  border-radius: 8px;
  background: var(--erp-surface);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 0.75rem 0;
}

.progress-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.results-summary {
  margin-bottom: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--erp-border);
}

.stat-card.success {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.stat-card.error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.stat-card.info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-top: 0.25rem;
}

.failed-tasks {
  margin-top: 1.5rem;
}

.error-item {
  background: rgba(239, 68, 68, 0.05);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-dialog {
    margin: 1rem;
    max-width: calc(100vw - 2rem) !important;
  }
  
  .v-card {
    margin: 0;
  }
  
  .v-card-text {
    padding: 1rem;
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
  
  .progress-input {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .progress-input .v-text-field {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .v-dialog {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem) !important;
  }
  
  .v-card-text {
    padding: 0.75rem;
  }
  
  .v-card-actions {
    padding: 0.75rem;
    flex-direction: column;
  }
  
  .v-card-actions .v-btn {
    width: 100%;
  }
  
  .section-title {
    font-size: 0.8125rem;
  }
  
  .bulk-actions-form {
    gap: 1rem;
  }
  
  .action-section,
  .config-section,
  .preview-section,
  .warning-section {
    padding: 0.75rem;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .v-dialog {
    max-width: 600px !important;
  }
  
  .v-card-text {
    padding: 2rem;
  }
  
  .v-card-actions {
    padding: 1.5rem 2rem 2rem;
  }
  
  .bulk-actions-form {
    gap: 2rem;
  }
  
  .action-section,
  .config-section,
  .preview-section,
  .warning-section {
    padding: 1.5rem;
  }
}

@media (min-width: 1920px) {
  .v-dialog {
    max-width: 700px !important;
  }
  
  .v-card-text {
    padding: 2.5rem;
  }
  
  .v-card-actions {
    padding: 2rem 2.5rem 2.5rem;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .bulk-actions-form {
    gap: 2.5rem;
  }
  
  .action-section,
  .config-section,
  .preview-section,
  .warning-section {
    padding: 2rem;
  }
}
</style>
