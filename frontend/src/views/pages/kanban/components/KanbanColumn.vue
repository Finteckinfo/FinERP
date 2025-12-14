<template>
  <div class="kanban-column" :class="columnClasses">
    <!-- Column Header -->
    <div class="column-header" :style="{ borderTopColor: column.color }">
      <div class="header-content">
        <div class="column-info">
          <v-icon :color="column.color" class="mr-2" aria-hidden="true">
            {{ getColumnIcon(column.status) }}
          </v-icon>
          <h3 class="column-title">{{ column.title }}</h3>
          <v-chip 
            size="small" 
            variant="outlined" 
            :color="column.color"
            class="ml-2"
            :aria-label="`${tasks.length} tasks in ${column.title}`"
          >
            {{ tasks.length }}
          </v-chip>
        </div>
        
        <div class="column-actions">
          <v-btn
            v-if="userPermissions.canCreateTasks"
            icon
            size="small"
            variant="text"
            :aria-label="`Add task to ${column.title}`"
            @click="$emit('add-task', column.status)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          
          <v-menu :scrim="false" content-class="kanban-menu">
            <template #activator="{ props: menuProps }">
              <v-btn
                icon
                size="small"
                variant="text"
                aria-label="Column options"
                v-bind="menuProps"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            
            <v-list density="compact" class="kanban-menu">
              <v-list-item
                prepend-icon="mdi-select-all"
                title="Select All"
                @click="selectAllTasks"
              />
              <v-list-item
                prepend-icon="mdi-eye-off"
                title="Collapse Column"
                @click="toggleCollapse"
              />
              <v-divider />
              <v-list-item
                prepend-icon="mdi-information"
                title="Column Info"
                @click="showColumnInfo = true"
              />
            </v-list>
          </v-menu>
        </div>
      </div>
      
      <!-- Column limit indicator -->
      <div v-if="column.limit && tasks.length >= column.limit" class="limit-indicator">
        <v-icon size="16" color="warning">mdi-alert</v-icon>
        <span class="text-caption">Limit reached ({{ column.limit }})</span>
      </div>
    </div>

    <!-- Column Content -->
    <div 
      v-show="!collapsed"
      class="column-content"
      :class="{ 'drag-over': isDragOver }"
      role="list"
      :aria-label="`${column.title} tasks`"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- Tasks -->
      <div class="tasks-container">
        <KanbanTaskCard
          v-for="(task, index) in tasks"
          :key="task.id"
          :task="task"
          :index="index"
          :selected="selectedTasks.includes(task.id)"
          :user-permissions="userPermissions"
          :draggable="userPermissions.canEditAllTasks || task.canEdit"
          role="listitem"
          @click="$emit('task-click', task)"
          @select="$emit('task-select', task.id)"
          @drag-start="handleTaskDragStart"
          @drag-end="handleTaskDragEnd"
        />
      </div>

      <!-- Drop Zone -->
      <div 
        v-if="tasks.length === 0"
        class="empty-drop-zone"
        :class="{ 'drag-over': isDragOver }"
      >
        <v-icon size="48" color="grey-lighten-2">mdi-drag</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-2">
          Drop tasks here or click + to add
        </p>
      </div>
    </div>

    <!-- Collapsed State -->
    <div v-if="collapsed" class="collapsed-content">
      <v-btn
        variant="text"
        size="small"
        @click="toggleCollapse"
      >
        <v-icon class="mr-2">mdi-chevron-down</v-icon>
        Show {{ tasks.length }} tasks
      </v-btn>
    </div>

    <!-- Column Info Dialog -->
    <v-dialog v-model="showColumnInfo" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon :color="column.color" class="mr-2">
            {{ getColumnIcon(column.status) }}
          </v-icon>
          {{ column.title }}
        </v-card-title>
        
        <v-card-text>
          <div class="column-stats">
            <div class="stat-item">
              <span class="stat-label">Tasks:</span>
              <span class="stat-value">{{ tasks.length }}</span>
            </div>
            <div v-if="column.limit" class="stat-item">
              <span class="stat-label">Limit:</span>
              <span class="stat-value">{{ column.limit }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Status:</span>
              <span class="stat-value">{{ column.status }}</span>
            </div>
          </div>
          
          <p v-if="column.description" class="text-body-2 mt-3">
            {{ column.description }}
          </p>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showColumnInfo = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ColumnConfig, KanbanTask, TaskPosition } from '../types/kanban';
import KanbanTaskCard from './KanbanTaskCard.vue';

interface Props {
  column: ColumnConfig;
  tasks: KanbanTask[];
  selectedTasks: string[];
  userPermissions: {
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
  };
}

interface Emits {
  (e: 'task-click', task: KanbanTask): void;
  (e: 'task-select', taskId: string): void;
  (e: 'task-move', taskId: string, position: TaskPosition): void;
  (e: 'add-task', status: string): void;
  (e: 'column-action', action: string, status: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const collapsed = ref(false);
const isDragOver = ref(false);
const showColumnInfo = ref(false);
const draggedTaskId = ref<string | null>(null);

// Computed
const columnClasses = computed(() => ({
  'column-collapsed': collapsed.value,
  'column-drag-over': isDragOver.value,
  'column-limit-reached': props.column.limit && props.tasks.length >= props.column.limit
}));

// Methods
const getColumnIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    'PENDING': 'mdi-clipboard-text-outline',
    'IN_PROGRESS': 'mdi-clock-outline',
    'COMPLETED': 'mdi-check-circle',
    'APPROVED': 'mdi-check-all'
  };
  return iconMap[status] || 'mdi-circle';
};

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  emit('column-action', 'collapse', props.column.status);
};

const selectAllTasks = () => {
  props.tasks.forEach(task => {
    if (!props.selectedTasks.includes(task.id)) {
      emit('task-select', task.id);
    }
  });
  emit('column-action', 'select-all', props.column.status);
};

// Drag and Drop handlers
const handleTaskDragStart = (taskId: string) => {
  console.log('[KanbanColumn] Task drag started:', {
    taskId,
    columnStatus: props.column.status,
    columnTitle: props.column.title,
    currentTasksCount: props.tasks.length
  });
  draggedTaskId.value = taskId;
};

const handleTaskDragEnd = () => {
  console.log('[KanbanColumn] Task drag ended:', {
    taskId: draggedTaskId.value,
    columnStatus: props.column.status,
    wasDragOver: isDragOver.value
  });
  draggedTaskId.value = null;
  isDragOver.value = false;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  console.log('[KanbanColumn] Drag over column:', {
    columnStatus: props.column.status,
    columnTitle: props.column.title,
    draggedTaskId: draggedTaskId.value,
    currentTasksCount: props.tasks.length
  });
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  // Only clear drag over if leaving the column entirely
  const currentTarget = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as Node;
  if (currentTarget && !currentTarget.contains(relatedTarget)) {
    console.log('[KanbanColumn] Drag left column:', {
      columnStatus: props.column.status,
      columnTitle: props.column.title,
      draggedTaskId: draggedTaskId.value
    });
    isDragOver.value = false;
  }
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  console.log('[KanbanColumn] Drop event triggered:', {
    columnStatus: props.column.status,
    columnTitle: props.column.title,
    draggedTaskId: draggedTaskId.value,
    currentTasksCount: props.tasks.length,
    dropEvent: {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransfer: event.dataTransfer?.types || []
    }
  });
  
  const dataTransferTaskId = event.dataTransfer?.getData('text/plain');
  const taskId = draggedTaskId.value || dataTransferTaskId || null;

  // Best-effort parse of dragged task metadata (permissions + finance fields)
  let draggedTaskMeta: any = null;
  try {
    const json = event.dataTransfer?.getData('application/json');
    if (json) draggedTaskMeta = JSON.parse(json);
  } catch {
    // ignore parse errors
  }

  if (!taskId) {
    console.warn('[KanbanColumn] Drop event but no dragged task ID - ignoring');
    return;
  }

  // Check if moving to APPROVED column:
  // Financial rule: paid tasks must be approved via "Approve & Pay" (so escrow release is executed),
  // not via drag-and-drop status changes that could bypass payment.
  if (props.column.status === 'APPROVED') {
    const fromStatus = draggedTaskMeta?.status;
    const hasPayment = Number(draggedTaskMeta?.paymentAmount || 0) > 0;
    const canApprove = !!draggedTaskMeta?.canApprove;

    // Only allow transition to APPROVED from COMPLETED (Trello-like "done -> approved")
    if (fromStatus && fromStatus !== 'COMPLETED') {
      const toast = document.createElement('div');
      toast.textContent = '⚠️ Only completed tasks can be moved to Approved';
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    }

    // Permission rule: only project owner can approve (or managers with edit-all)
    if (!canApprove && !props.userPermissions.canEditAllTasks) {
      console.warn('[KanbanColumn] Only project owner can approve tasks - ignoring drop');
      const toast = document.createElement('div');
      toast.textContent = '⚠️ Only the project owner can approve tasks';
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    }

    // Escrow-safety: if there's a payment amount, force the explicit approve action (which triggers payment)
    if (hasPayment) {
      const toast = document.createElement('div');
      toast.textContent = '💸 Paid tasks must be approved via “Approve & Pay” in task details';
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #0ea5e9;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 600;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
      return;
    }
  }
  
  // Calculate new position (append to end of column)
  const newPosition: TaskPosition = {
    taskId,
    status: props.column.status,
    order: props.tasks.length,
    departmentId: undefined // Will be handled by the API
  };
  
  console.log('[KanbanColumn] Emitting task-move event:', {
    taskId,
    newPosition,
    fromColumn: 'unknown', // We don't track source column here
    toColumn: props.column.status
  });
  
  emit('task-move', taskId, newPosition);
  draggedTaskId.value = null;
};
</script>

<style scoped>
.kanban-column {
  width: 360px;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 18px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
}

.column-header {
  flex-shrink: 0;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--erp-border);
  border-radius: 18px 18px 0 0;
  background: var(--erp-surface);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.column-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.column-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.column-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.limit-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--erp-primary) 10%, var(--erp-surface));
  border: 1px solid color-mix(in srgb, var(--erp-primary) 30%, transparent);
}

.column-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.25rem 1.5rem 1.5rem;
  background: var(--erp-surface);
  border-radius: 0 0 18px 18px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.column-content.drag-over {
  background: color-mix(in srgb, var(--erp-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--erp-primary) 35%, transparent);
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 1px dashed var(--erp-border);
  border-radius: 12px;
  text-align: center;
  background: var(--erp-page-bg);
  color: var(--erp-text);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.empty-drop-zone.drag-over {
  border-color: color-mix(in srgb, var(--erp-primary) 40%, transparent);
  background: color-mix(in srgb, var(--erp-primary) 10%, transparent);
}

.collapsed-content {
  padding: 1rem 1.25rem;
  text-align: center;
  background: var(--erp-surface);
  border-top: 1px solid var(--erp-border);
  border-radius: 0 0 18px 18px;
}

.column-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--erp-text);
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  opacity: 0.8;
}

.column-collapsed {
  max-height: 140px;
}

.column-limit-reached .column-header {
  background: color-mix(in srgb, var(--erp-primary) 12%, var(--erp-surface));
}

.column-drag-over {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.16);
}

@media (max-width: 1024px) {
  .kanban-column {
    width: 320px;
    min-width: 320px;
  }
}

@media (max-width: 768px) {
  .kanban-column {
    width: 100%;
    min-width: 100%;
  }

  .column-header,
  .column-content {
    padding: 1rem 1.1rem;
  }

  .tasks-container {
    gap: 0.75rem;
  }
}

.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--erp-border);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: var(--erp-text);
  opacity: 0.4;
}

::global(.dark-theme) .kanban-column {
  box-shadow: 0 16px 32px rgba(8, 15, 33, 0.35);
}

::global(.dark-theme) .empty-drop-zone {
  background: color-mix(in srgb, var(--erp-page-bg) 85%, transparent);
}
</style>
