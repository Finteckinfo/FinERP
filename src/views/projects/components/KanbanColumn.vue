<template>
  <div class="kanban-column">
    <div class="column-header" :class="statusClass">
      <div class="column-title">
        <h3 class="text-h6 font-weight-bold">{{ title }}</h3>
        <span class="task-count">{{ tasks.length }}</span>
      </div>
      <div class="column-actions">
        <v-btn icon size="small" variant="text" class="mr-2" @click="$emit('add-task')">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" class="mr-2" @click="$emit('column-menu')">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" @click="toggleCollapse">
          <v-icon>{{ collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
        </v-btn>
      </div>
    </div>
    
    <div v-if="!collapsed" class="column-content">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="project-card"
        @click="$emit('task-click', task)"
      >

        <div class="card-header">
          <v-chip 
            :color="getPriorityColor(task.priority)" 
            size="small"
            class="mb-2"
          >
            {{ task.priority }}
          </v-chip>
        </div>
        <h4 class="project-title">{{ task.name }}</h4>
        <p class="project-description">{{ task.description }}</p>
        <div class="project-meta">
          <div class="d-flex align-center mb-2">
            <v-icon size="16" color="grey" class="mr-2">mdi-clock</v-icon>
            <span class="text-caption">{{ formatDate(task.startDate) }}</span>
          </div>
          <div class="d-flex align-center mb-2" v-if="task.progress">
            <v-icon size="16" color="grey" class="mr-2">mdi-checkbox-marked-circle</v-icon>
            <span class="text-caption">{{ task.progress }}%</span>
          </div>
          <div class="d-flex align-center" v-if="task.views">
            <v-icon size="16" color="grey" class="mr-2">mdi-eye</v-icon>
            <span class="text-caption">{{ task.views }}</span>
          </div>
        </div>
        <div class="project-assignees">
          <div class="assignee-avatars">
            <v-avatar 
              v-for="(assignee, index) in task.assignees" 
              :key="index"
              size="24" 
              :color="getAvatarColor(assignee.color)"
              class="mr-n1"
            >
              <v-icon color="white" size="16">mdi-account</v-icon>
            </v-avatar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Assignee {
  color: string;
  name?: string;
  imageUrl?: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  priority: string;
  startDate: string;
  endDate?: string;
  progress?: number;
  views?: number;
  assignees: Assignee[];
}

interface Props {
  title: string;
  status: string;
  tasks: Task[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'add-task': [];
  'column-menu': [];
  'task-click': [task: Task];
}>();

const collapsed = ref(false);

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

const statusClass = computed(() => {
  const classMap: Record<string, string> = {
    'TODO': 'todo',
    'IN_PROGRESS': 'in-progress',
    'REVIEW': 'review',
    'DONE': 'done',
    'REWORK': 'rework'
  };
  return classMap[props.status] || '';
});

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Feature': return 'primary';
    case 'Bug': return 'error';
    case 'Issue': return 'warning';
    case 'Undefined': return 'grey';
    default: return 'primary';
  }
};

const getAvatarColor = (color: string) => {
  const colorMap: Record<string, string> = {
    'red': 'red',
    'purple': 'purple',
    'blue': 'blue',
    'green': 'green',
    'orange': 'orange',
    'black': 'grey-darken-2'
  };
  return colorMap[color] || 'grey';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};
</script>

<style scoped>
.kanban-column {
  background: var(--erp-card-bg);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--erp-border);
}

.column-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--erp-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--erp-surface);
  border-radius: 12px 12px 0 0;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.column-title h3 {
  margin: 0;
  color: var(--erp-text);
  font-size: 0.875rem;
}

.task-count {
  background: var(--erp-border);
  color: var(--erp-text);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.column-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.column-header.todo {
  border-left: 4px solid #3b82f6;
}

.column-header.in-progress {
  border-left: 4px solid #f59e0b;
}

.column-header.review {
  border-left: 4px solid #8b5cf6;
}

.column-header.done {
  border-left: 4px solid #10b981;
}

.column-header.rework {
  border-left: 4px solid #ef4444;
}

.column-content {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-card {
  background: var(--erp-card-bg);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--erp-border);
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}



.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.project-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.project-description {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.project-meta {
  margin-bottom: 16px;
}

.project-meta .d-flex {
  margin-bottom: 6px;
}

.project-meta .d-flex:last-child {
  margin-bottom: 0;
}

.project-meta .text-caption {
  color: var(--erp-text);
  opacity: 0.7;
  font-size: 0.75rem;
}

.project-assignees {
  display: flex;
  justify-content: flex-end;
}

.assignee-avatars {
  display: flex;
  align-items: center;
}
</style>
