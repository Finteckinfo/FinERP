<template>
  <div class="task-section">
    <div class="section-header">
      <div class="d-flex align-center">
        <v-icon 
          :color="color" 
          class="mr-2 cursor-pointer"
          @click="toggleCollapse"
        >
          {{ collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
        </v-icon>
        <h4 class="text-subtitle-1 font-weight-medium">{{ name }}</h4>
        <v-chip 
          :color="color" 
          size="small" 
          class="ml-3"
        >
          {{ tasks.length }}
        </v-chip>
      </div>
      <div class="section-actions">
        <v-btn icon size="small" variant="text" @click="$emit('section-menu')">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </div>
    </div>
    
    <div v-if="!collapsed" class="section-content">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        class="task-item"
        :class="{ 'completed': task.completed }"
      >
        <div class="task-checkbox">
          <v-checkbox
            v-model="task.completed"
            :color="color"
            hide-details
            density="compact"
            @change="$emit('task-toggle', task)"
          />
        </div>
        
        <div class="task-content">
          <div class="task-header">
            <h5 class="task-title">{{ task.title }}</h5>
            <div class="task-meta">
              <v-chip 
                :color="getPriorityColor(task.priority)" 
                size="small"
                variant="outlined"
              >
                {{ task.priority }}
              </v-chip>
              <span class="task-date">{{ formatDate(task.dueDate) }}</span>
            </div>
          </div>
          
          <p class="task-description">{{ task.description }}</p>
          
          <div class="task-footer">
            <div class="task-assignees">
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
            
            <div class="task-actions">
              <v-btn icon size="small" variant="text" @click="$emit('task-comment', task)">
                <v-icon>mdi-comment</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text" @click="$emit('task-attachment', task)">
                <v-icon>mdi-attachment</v-icon>
              </v-btn>
              <v-btn icon size="small" variant="text" @click="$emit('task-menu', task)">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
      
      <div class="add-task-placeholder" @click="$emit('add-task')">
        <v-icon color="grey" class="mr-2">mdi-plus</v-icon>
        <span class="text-grey">Add task to {{ name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Assignee {
  color: string;
  name?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  completed: boolean;
  assignees: Assignee[];
}

interface Props {
  id: number;
  name: string;
  color: string;
  tasks: Task[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'section-menu': [];
  'task-toggle': [task: Task];
  'task-comment': [task: Task];
  'task-attachment': [task: Task];
  'task-menu': [task: Task];
  'add-task': [];
}>();

const collapsed = ref(false);

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'success';
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
.task-section {
  background: var(--erp-card-bg);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--erp-border);
  overflow: hidden;
}

.section-header {
  padding: 16px 20px;
  background: var(--erp-surface);
  border-bottom: 1px solid var(--erp-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header h4 {
  margin: 0;
  color: var(--erp-text);
  font-size: 1rem;
}

.section-actions {
  display: flex;
  align-items: center;
}

.section-content {
  padding: 16px;
}

.task-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--erp-border);
  margin-bottom: 12px;
  background: var(--erp-card-bg);
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.7;
  background: var(--erp-surface);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--erp-text);
  opacity: 0.7;
}

.task-checkbox {
  flex-shrink: 0;
  margin-top: 4px;
}

.task-content {
  flex-grow: 1;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-date {
  color: var(--erp-text);
  opacity: 0.7;
  font-size: 0.75rem;
}

.task-description {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-assignees {
  display: flex;
  align-items: center;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-task-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--erp-text);
  opacity: 0.7;
  font-size: 0.875rem;
}

.add-task-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
