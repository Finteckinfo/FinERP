<template>
  <div class="task-list">
    <div class="task-list-header">
      <h3 class="list-title">Tasks</h3>
      <div class="list-filters">
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="APPROVED">Approved</option>
        </select>
        
        <select v-model="priorityFilter" class="filter-select">
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>
    </div>

    <div class="task-list-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
      <!-- Today's Tasks -->
      <div v-if="todaysTasks.length > 0" class="task-section">
        <h4 class="section-title">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Today
        </h4>
        <div class="task-items">
          <TaskCard
            v-for="task in todaysTasks"
            :key="task.id"
            :task="task"
            @click="handleTaskSelect(task)"
          />
        </div>
      </div>

      <!-- Overdue Tasks -->
      <div v-if="overdueTasks.length > 0" class="task-section">
        <h4 class="section-title overdue">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Overdue
        </h4>
        <div class="task-items">
          <TaskCard
            v-for="task in overdueTasks"
            :key="task.id"
            :task="task"
            @click="handleTaskSelect(task)"
          />
        </div>
      </div>

      <!-- This Week Tasks -->
      <div v-if="thisWeekTasks.length > 0" class="task-section">
        <h4 class="section-title">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          This Week
        </h4>
        <div class="task-items">
          <TaskCard
            v-for="task in thisWeekTasks"
            :key="task.id"
            :task="task"
            @click="handleTaskSelect(task)"
          />
        </div>
      </div>

      <!-- Next Week Tasks -->
      <div v-if="nextWeekTasks.length > 0" class="task-section">
        <h4 class="section-title">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Next Week
        </h4>
        <div class="task-items">
          <TaskCard
            v-for="task in nextWeekTasks"
            :key="task.id"
            :task="task"
            @click="handleTaskSelect(task)"
          />
        </div>
      </div>

      <!-- Later Tasks -->
      <div v-if="laterTasks.length > 0" class="task-section">
        <h4 class="section-title">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Later
        </h4>
        <div class="task-items">
          <TaskCard
            v-for="task in laterTasks"
            :key="task.id"
            :task="task"
            @click="handleTaskSelect(task)"
          />
        </div>
      </div>

      <!-- No Tasks Message -->
      <div v-if="filteredTasks.length === 0" class="no-tasks">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="no-tasks-text">No tasks found</p>
        <p class="no-tasks-subtext">Try adjusting your filters</p>
      </div>
    </div>

    <!-- Task Actions -->
    <div v-if="selectedTask" class="task-actions">
      <button @click="handleTaskEdit" class="action-btn edit">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
      
      <button @click="handleTaskDelete" class="action-btn delete">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '@/services/projectApi'

interface Props {
  tasks: Task[]
  selectedDate: Date
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'task-select': [task: Task]
  'task-edit': [task: Task]
  'task-delete': [taskId: string]
}>()

const statusFilter = ref('')
const priorityFilter = ref('')
const selectedTask = ref<Task | null>(null)

// Filter tasks based on status and priority
const filteredTasks = computed(() => {
  return props.tasks.filter(task => {
    const statusMatch = !statusFilter.value || task.status === statusFilter.value
    const priorityMatch = !priorityFilter.value || task.priority === priorityFilter.value
    return statusMatch && priorityMatch
  })
})

// Group tasks by time periods
const todaysTasks = computed(() => {
  const today = new Date()
  return filteredTasks.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate.toDateString() === today.toDateString()
  })
})

const overdueTasks = computed(() => {
  const today = new Date()
  return filteredTasks.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate < today && task.status !== 'COMPLETED' && task.status !== 'APPROVED'
  })
})

const thisWeekTasks = computed(() => {
  const today = new Date()
  const endOfWeek = new Date(today)
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()))
  
  return filteredTasks.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate > today && taskDate <= endOfWeek && 
           task.status !== 'COMPLETED' && task.status !== 'APPROVED'
  })
})

const nextWeekTasks = computed(() => {
  const today = new Date()
  const startOfNextWeek = new Date(today)
  startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 1)
  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)
  
  return filteredTasks.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate >= startOfNextWeek && taskDate <= endOfNextWeek &&
           task.status !== 'COMPLETED' && task.status !== 'APPROVED'
  })
})

const laterTasks = computed(() => {
  const today = new Date()
  const startOfNextWeek = new Date(today)
  startOfNextWeek.setDate(today.getDate() + (7 - today.getDay()) + 1)
  const endOfNextWeek = new Date(startOfNextWeek)
  endOfNextWeek.setDate(startOfNextWeek.getDate() + 6)
  
  return filteredTasks.value.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate)
    return taskDate > endOfNextWeek &&
           task.status !== 'COMPLETED' && task.status !== 'APPROVED'
  })
})

// Event handlers
const handleTaskSelect = (task: Task) => {
  selectedTask.value = task
  emit('task-select', task)
}

const handleTaskEdit = () => {
  if (selectedTask.value) {
    emit('task-edit', selectedTask.value)
  }
}

const handleTaskDelete = () => {
  if (selectedTask.value) {
    emit('task-delete', selectedTask.value.id)
    selectedTask.value = null
  }
}
</script>

<style scoped>
.task-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--erp-card-bg);
  color: var(--erp-text);
}

.task-list-header {
  padding: 1rem;
  border-bottom: 1px solid var(--erp-border);
  background-color: var(--erp-surface);
}

.list-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.list-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  background-color: var(--erp-card-bg);
  font-size: 0.875rem;
  color: var(--erp-text);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--erp-accent-indigo);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent);
}

.task-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--erp-border);
  border-top: 3px solid var(--erp-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.task-section {
  margin-bottom: 2rem;
}

.task-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-title.overdue {
  color: #dc2626;
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.no-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-tasks-text {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  margin: 1rem 0 0.5rem 0;
}

.no-tasks-subtext {
  font-size: 0.875rem;
  color: var(--erp-text);
  margin: 0;
}

.task-actions {
  padding: 1rem;
  border-top: 1px solid var(--erp-border);
  background-color: var(--erp-surface);
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.action-btn.edit {
  background-color: #3b82f6;
  color: white;
}

.action-btn.edit:hover {
  background-color: #2563eb;
}

.action-btn.delete {
  background-color: #ef4444;
  color: white;
}

.action-btn.delete:hover {
  background-color: #dc2626;
}

/* Responsive design */
@media (max-width: 768px) {
  .task-list-header {
    padding: 0.75rem;
  }
  
  .list-filters {
    flex-direction: column;
  }
  
  .task-list-content {
    padding: 0.75rem;
  }
  
  .task-actions {
    padding: 0.75rem;
    flex-direction: column;
  }
  
  .action-btn {
    flex: none;
  }
}
</style>
