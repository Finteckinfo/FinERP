<template>
  <div 
    :class="[
      'task-card',
      `priority-${task.priority.toLowerCase()}`,
      `status-${task.status.toLowerCase()}`,
      { compact }
    ]"
    @click="$emit('click', task)"
  >
    <div class="task-header">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-priority">
        <span :class="['priority-dot', `priority-${task.priority.toLowerCase()}`]"></span>
      </div>
    </div>
    
    <div v-if="!compact && task.description" class="task-description">
      {{ task.description }}
    </div>
    
    <div class="task-meta">
      <div class="task-status">
        <span :class="['status-badge', `status-${task.status.toLowerCase()}`]">
          {{ formatStatus(task.status) }}
        </span>
      </div>
      
      <div v-if="task.estimatedHours || task.actualHours" class="task-hours">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span v-if="task.actualHours">{{ task.actualHours }}h</span>
        <span v-else-if="task.estimatedHours">{{ task.estimatedHours }}h</span>
      </div>
    </div>
    
    <div v-if="!compact" class="task-footer">
      <div class="task-date">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ formatDate(task.dueDate) }}</span>
      </div>
      
      <div v-if="task.department" class="task-project">
        <div 
          class="project-color" 
          :style="{ backgroundColor: task.department?.color || '#64748b' }"
        ></div>
        <span>{{ task.department?.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/services/projectApi'

interface Project {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  color: string
}

interface Props {
  task: Task
  project?: Project
  compact?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [task: Task]
}>()

const formatStatus = (status: string) => {
  const statusMap = {
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'APPROVED': 'Approved'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'No due date'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.task-card {
  background-color: white;
  border: 1px solid var(--erp-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.task-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.task-card.compact {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
}

.task-card.compact .task-description {
  display: none;
}

.task-card.compact .task-footer {
  display: none;
}

/* Priority colors */
.task-card.priority-low {
  border-left: 3px solid #10b981;
}

.task-card.priority-medium {
  border-left: 3px solid #f59e0b;
}

.task-card.priority-high {
  border-left: 3px solid #ef4444;
}

.task-card.priority-critical {
  border-left: 3px solid #8b5cf6;
}

/* Status colors */
.task-card.status-pending {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 12%, transparent);
}

.task-card.status-in_progress {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 18%, transparent);
}

.task-card.status-completed {
  background-color: color-mix(in srgb, var(--erp-accent-green) 18%, transparent);
}

.task-card.status-approved {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 24%, transparent);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.task-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
  line-height: 1.25;
  flex: 1;
  margin-right: 0.5rem;
}

.task-priority {
  display: flex;
  align-items: center;
}

.priority-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  display: inline-block;
}

.priority-dot.priority-low {
  background-color: #10b981;
}

.priority-dot.priority-medium {
  background-color: #f59e0b;
}

.priority-dot.priority-high {
  background-color: #ef4444;
}

.priority-dot.priority-critical {
  background-color: #8b5cf6;
}

.task-description {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.status-pending {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 12%, transparent);
  color: var(--erp-text);
}

.status-badge.status-in_progress {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 18%, transparent);
  color: var(--erp-text);
}

.status-badge.status-completed {
  background-color: color-mix(in srgb, var(--erp-accent-green) 18%, transparent);
  color: var(--erp-text);
}

.status-badge.status-approved {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 24%, transparent);
  color: var(--erp-text);
}

.task-hours {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.75rem;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.task-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-project {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.project-color {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  display: inline-block;
}

/* Compact mode adjustments */
.task-card.compact .task-header {
  margin-bottom: 0.25rem;
}

.task-card.compact .task-title {
  font-size: 0.75rem;
}

.task-card.compact .task-meta {
  margin-bottom: 0;
}

.task-card.compact .status-badge {
  font-size: 0.5rem;
  padding: 0.125rem 0.375rem;
}

.task-card.compact .task-hours {
  font-size: 0.625rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .task-card {
    padding: 0.5rem;
  }
  
  .task-title {
    font-size: 0.75rem;
  }
  
  .task-description {
    font-size: 0.625rem;
  }
  
  .task-footer {
    font-size: 0.625rem;
  }
}
</style>
