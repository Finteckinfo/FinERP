<template>
  <div 
    class="kanban-task-card"
    :class="cardClasses"
    :draggable="draggable"
    :aria-label="`Task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}`"
    :tabindex="0"
    role="button"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Selection Checkbox -->
    <div v-if="showSelection" class="task-selection" @click.stop>
      <v-checkbox
        :model-value="selected"
        density="compact"
        hide-details
        @update:model-value="$emit('select')"
      />
    </div>

    <!-- Priority Badge -->
    <div class="task-priority">
      <v-chip
        :color="getPriorityColor(task.priority)"
        size="x-small"
        variant="flat"
      >
        {{ task.priority }}
      </v-chip>
    </div>

    <!-- Task Title -->
    <h4 class="task-title">{{ task.title }}</h4>

    <!-- Task Description -->
    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>

    <!-- Task Meta Information -->
    <div class="task-meta">
      <!-- Project -->
      <div class="meta-item">
        <v-icon size="14" color="primary">mdi-folder</v-icon>
        <span class="meta-text">{{ task.project.name }}</span>
      </div>

      <!-- Department -->
      <div class="meta-item">
        <v-icon size="14" color="grey">mdi-office-building</v-icon>
        <span class="meta-text">{{ task.department.name }}</span>
      </div>

      <!-- Due Date -->
      <div v-if="task.dueDate" class="meta-item" :class="dueDateClasses">
        <v-icon size="14" :color="dueDateColor">mdi-calendar</v-icon>
        <span class="meta-text">{{ formatDueDate(task.dueDate) }}</span>
      </div>

      <!-- Progress -->
      <div v-if="task.progress !== undefined" class="meta-item">
        <v-icon size="14" color="grey">mdi-progress-check</v-icon>
        <span class="meta-text">{{ task.progress }}%</span>
      </div>

      <!-- Estimated Hours -->
      <div v-if="task.estimatedHours" class="meta-item">
        <v-icon size="14" color="grey">mdi-clock-outline</v-icon>
        <span class="meta-text">{{ task.estimatedHours }}h</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="task.progress !== undefined" class="progress-section">
      <v-progress-linear
        :model-value="task.progress"
        :color="getProgressColor(task.progress)"
        height="4"
        rounded
      />
    </div>

    <!-- Payment Badge -->
    <div v-if="task.paymentAmount && task.paymentAmount > 0" class="payment-badge">
      <v-chip
        :color="getPaymentStatusColor(task.paymentStatus || 'PENDING')"
        size="small"
        variant="tonal"
        class="payment-chip"
      >
        <v-icon start size="14">mdi-cash</v-icon>
        {{ task.paymentAmount.toFixed(2) }} SIZ
      </v-chip>
      <v-chip
        v-if="task.paymentStatus === 'PAID'"
        color="success"
        size="x-small"
        variant="flat"
        class="ml-1"
      >
        <v-icon size="12">mdi-check</v-icon>
        Paid
      </v-chip>
    </div>

    <!-- Checklist Progress -->
    <div v-if="task.checklistCount" class="checklist-section">
      <div class="checklist-progress">
        <v-icon size="16" color="grey">mdi-format-list-checks</v-icon>
        <span class="checklist-text">
          {{ task.checklistCompleted || 0 }}/{{ task.checklistCount }} tasks
        </span>
        <v-progress-circular
          :model-value="checklistProgress"
          :color="getProgressColor(checklistProgress)"
          size="20"
          width="2"
        />
      </div>
    </div>

    <!-- Task Footer -->
    <div class="task-footer">
      <!-- Assignee -->
      <div class="task-assignee">
        <v-avatar
          v-if="task.assignedUser"
          size="24"
          :color="getAvatarColor(task.assignedUser.email)"
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
        <v-avatar
          v-else
          size="24"
          color="grey-lighten-2"
        >
          <v-icon size="16" color="grey">mdi-account-outline</v-icon>
        </v-avatar>
      </div>

      <!-- Task Actions -->
      <div class="task-actions">
        <v-btn
          v-if="userPermissions.canEditAllTasks || task.canEdit"
          icon
          size="x-small"
          variant="text"
          aria-label="Edit task"
          @click.stop="$emit('edit')"
        >
          <v-icon size="16">mdi-pencil</v-icon>
        </v-btn>
        
        <v-menu :scrim="false" content-class="kanban-menu">
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              aria-label="Task options"
              v-bind="menuProps"
              @click.stop
            >
              <v-icon size="16">mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          
          <v-list density="compact" class="kanban-menu">
            <v-list-item
              prepend-icon="mdi-eye"
              title="View Details"
              @click="$emit('view')"
            />
            <v-list-item
              v-if="userPermissions.canEditAllTasks || task.canEdit"
              prepend-icon="mdi-pencil"
              title="Edit Task"
              @click="$emit('edit')"
            />
            <v-list-item
              v-if="userPermissions.canAssignTasks"
              prepend-icon="mdi-account-arrow-right"
              title="Reassign"
              @click="$emit('reassign')"
            />
            <v-divider v-if="userPermissions.canDeleteTasks || task.canDelete" />
            <v-list-item
              v-if="userPermissions.canDeleteTasks || task.canDelete"
              prepend-icon="mdi-delete"
              title="Delete"
              class="text-error"
              @click="$emit('delete')"
            />
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Drag Handle -->
    <div v-if="draggable" class="drag-handle" aria-label="Drag to move task">
      <v-icon size="16" color="grey-lighten-1" aria-hidden="true">mdi-drag-vertical</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { KanbanTask } from '../types/kanban';

interface Props {
  task: KanbanTask;
  index: number;
  selected: boolean;
  userPermissions: {
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
  };
  draggable?: boolean;
  showSelection?: boolean;
}

interface Emits {
  (e: 'click'): void;
  (e: 'select'): void;
  (e: 'edit'): void;
  (e: 'view'): void;
  (e: 'reassign'): void;
  (e: 'delete'): void;
  (e: 'drag-start', taskId: string): void;
  (e: 'drag-end'): void;
}

const props = withDefaults(defineProps<Props>(), {
  draggable: false,
  showSelection: false
});

const emit = defineEmits<Emits>();

// Computed properties
const cardClasses = computed(() => ({
  'task-selected': props.selected,
  'task-draggable': props.draggable,
  'task-overdue': isOverdue.value,
  'task-due-soon': isDueSoon.value
}));

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false;
  return new Date(props.task.dueDate) < new Date();
});

const isDueSoon = computed(() => {
  if (!props.task.dueDate || isOverdue.value) return false;
  const dueDate = new Date(props.task.dueDate);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
});

const dueDateClasses = computed(() => ({
  'meta-overdue': isOverdue.value,
  'meta-due-soon': isDueSoon.value
}));

const dueDateColor = computed(() => {
  if (isOverdue.value) return 'error';
  if (isDueSoon.value) return 'warning';
  return 'grey';
});

const checklistProgress = computed(() => {
  if (!props.task.checklistCount) return 0;
  return Math.round(((props.task.checklistCompleted || 0) / props.task.checklistCount) * 100);
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

const getProgressColor = (progress: number) => {
  if (progress >= 100) return 'success';
  if (progress >= 75) return 'info';
  if (progress >= 50) return 'warning';
  if (progress >= 25) return 'orange';
  return 'error';
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'grey';
    case 'ALLOCATED': return 'info';
    case 'PROCESSING': return 'warning';
    case 'PAID': return 'success';
    case 'FAILED': return 'error';
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
  const date = new Date(dueDate);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const handleClick = () => {
  emit('click');
};

const handleDragStart = (event: DragEvent) => {
  if (!props.draggable) {
    console.log('[KanbanTaskCard] Drag start blocked - task not draggable:', {
      taskId: props.task.id,
      taskTitle: props.task.title,
      draggable: props.draggable
    });
    return;
  }
  
  console.log('[KanbanTaskCard] Drag start initiated:', {
    taskId: props.task.id,
    taskTitle: props.task.title,
    taskStatus: props.task.status,
    projectName: props.task.project.name,
    departmentName: props.task.department.name,
    assignedUser: props.task.assignedUser?.email || 'unassigned',
    dragEvent: {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransferTypes: event.dataTransfer?.types || []
    }
  });
  
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData('text/plain', props.task.id);
  
  // Add a drag image
  const dragImage = event.currentTarget as HTMLElement;
  event.dataTransfer!.setDragImage(dragImage, 0, 0);
  
  console.log('[KanbanTaskCard] Drag data set and image configured, emitting drag-start event');
  emit('drag-start', props.task.id);
};

const handleDragEnd = () => {
  console.log('[KanbanTaskCard] Drag end:', {
    taskId: props.task.id,
    taskTitle: props.task.title,
    taskStatus: props.task.status
  });
  emit('drag-end');
};
</script>

<style scoped>
.kanban-task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.kanban-task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
  border-color: color-mix(in srgb, var(--erp-primary) 35%, var(--erp-border));
}

.task-selected {
  border-color: color-mix(in srgb, var(--erp-primary) 55%, var(--erp-border));
  background: color-mix(in srgb, var(--erp-primary) 14%, var(--erp-surface));
}

.task-draggable {
  cursor: grab;
}

.task-draggable:active {
  cursor: grabbing;
}

.task-overdue {
  border-left: 3px solid rgba(239, 68, 68, 0.8);
}

.task-due-soon {
  border-left: 3px solid rgba(245, 158, 11, 0.8);
}

.task-selection {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.task-priority {
  margin-bottom: 0.25rem;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.task-description {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--erp-text) 75%, transparent);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.meta-text {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--erp-text) 70%, transparent);
}

.meta-overdue .meta-text {
  color: rgba(239, 68, 68, 0.9);
  opacity: 1;
  font-weight: 500;
}

.meta-due-soon .meta-text {
  color: rgba(245, 158, 11, 0.95);
  opacity: 1;
  font-weight: 500;
}

.progress-section,
.payment-badge,
.checklist-section {
  margin-top: 0.5rem;
}

.payment-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-chip {
  font-weight: 600;
  font-size: 0.75rem;
}

.checklist-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checklist-text {
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--erp-text) 70%, transparent);
  flex: 1;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--erp-border);
}

.task-assignee {
  display: flex;
  align-items: center;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kanban-task-card:hover .task-actions {
  opacity: 1;
}

.drag-handle {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-draggable:hover .drag-handle {
  opacity: 1;
}

@media (max-width: 768px) {
  .kanban-task-card {
    padding: 1rem 1.1rem;
  }

  .task-actions {
    opacity: 1;
  }

  .task-actions .v-btn {
    min-width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .kanban-task-card {
    padding: 0.85rem;
  }

  .task-title {
    font-size: 0.9rem;
  }

  .task-description {
    font-size: 0.8rem;
  }

  .meta-text {
    font-size: 0.7rem;
  }

  .task-actions .v-btn {
    min-width: 26px;
    height: 26px;
  }
}

@media (min-width: 1440px) {
  .kanban-task-card {
    padding: 1.75rem 2rem;
    border-radius: 18px;
  }

  .task-title {
    font-size: 1.125rem;
  }

  .task-description {
    -webkit-line-clamp: 4;
  }
}
</style>
