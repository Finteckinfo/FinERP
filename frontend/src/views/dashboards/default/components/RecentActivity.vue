<script setup lang="ts">
import { ClockIcon, CheckIcon, AlertCircleIcon, PlusIcon, UsersIcon } from 'vue-tabler-icons';

interface Activity {
  id: string;
  type: 'task_completed' | 'project_created' | 'member_added' | 'payment_released' | 'deadline_approaching';
  title: string;
  description: string;
  projectName: string;
  timestamp: Date;
  user: string;
}

interface Props {
  activities: Activity[];
}

const props = defineProps<Props>();

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'task_completed':
      return { icon: CheckIcon, color: 'success' };
    case 'project_created':
      return { icon: PlusIcon, color: 'primary' };
    case 'member_added':
      return { icon: UsersIcon, color: 'info' };
    case 'payment_released':
      return { icon: CheckIcon, color: 'warning' };
    case 'deadline_approaching':
      return { icon: AlertCircleIcon, color: 'error' };
    default:
      return { icon: ClockIcon, color: 'grey' };
  }
};

const getActivityColor = (type: Activity['type']) => {
  return getActivityIcon(type).color;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};
</script>

<template>
  <v-card elevation="0">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h3 class="text-h4 font-weight-medium">Recent Activity</h3>
        <v-btn 
          size="small" 
          variant="text" 
          color="primary"
        >
          View All
        </v-btn>
      </div>

      <div class="activity-list">
        <div 
          v-for="activity in activities" 
          :key="activity.id"
          class="activity-item d-flex align-start mb-4"
        >
          <!-- Activity Icon -->
          <div class="mr-4 mt-1">
            <v-avatar 
              size="32" 
              :color="getActivityColor(activity.type)" 
              class="text-white"
            >
              <component 
                :is="getActivityIcon(activity.type).icon" 
                size="16" 
              />
            </v-avatar>
          </div>

          <!-- Activity Content -->
          <div class="flex-grow-1">
            <div class="d-flex align-center justify-space-between mb-1">
              <h6 class="text-body-1 font-weight-medium">{{ activity.title }}</h6>
              <span class="text-caption text-medium-emphasis">
                {{ formatTimeAgo(activity.timestamp) }}
              </span>
            </div>
            
            <p class="text-body-2 text-medium-emphasis mb-2">
              {{ activity.description }}
            </p>
            
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-chip 
                  size="small" 
                  variant="tonal" 
                  color="primary"
                  class="mr-2"
                >
                  {{ activity.projectName }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">
                  by {{ activity.user }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- No Activities State -->
        <div v-if="activities.length === 0" class="text-center pa-8">
          <v-avatar size="60" color="grey-lighten-3" class="mb-3">
            <ClockIcon size="30" color="grey" />
          </v-avatar>
          <h6 class="text-h6 text-medium-emphasis mb-2">No Recent Activity</h6>
          <p class="text-body-2 text-medium-emphasis">
            Start working on projects to see activity here
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.activity-item:last-child {
  margin-bottom: 0;
}
</style>
