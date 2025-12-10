<template>
  <v-card class="activity-feed" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Activity Feed</h3>
        <v-btn 
          size="small" 
          variant="text" 
          color="primary"
          @click="$emit('refresh')"
        >
          View All
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="activities-list">
          <div 
            v-for="activity in data?.activities?.slice(0, 8)" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon">
              <v-avatar 
                size="32" 
                :color="getActivityColor(activity.type)"
                class="text-white"
              >
                <v-icon size="16">{{ getActivityIcon(activity.type) }}</v-icon>
              </v-avatar>
            </div>
            
            <div class="activity-content">
              <div class="activity-title">{{ formatActivityTitle(activity) }}</div>
              <div class="activity-description">{{ formatActivityDescription(activity) }}</div>
              <div class="activity-meta">
                <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                <v-chip 
                  v-if="activity.projectId"
                  size="x-small" 
                  variant="tonal" 
                  color="primary"
                >
                  {{ activity.projectId }}
                </v-chip>
                <v-chip 
                  v-if="activity.actorUserId"
                  size="x-small" 
                  variant="tonal" 
                  color="secondary"
                >
                  {{ activity.actorUserId }}
                </v-chip>
              </div>
            </div>
          </div>
          
          <div v-if="!data?.activities?.length" class="no-activities">
            <v-icon size="48" color="grey" icon="mdi-history" />
            <p class="text-body-2 text-medium-emphasis">No recent activities</p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    'TASK_CREATED': 'mdi-plus-circle',
    'STATUS_CHANGED': 'mdi-swap-horizontal',
    'COMMENT_ADDED': 'mdi-comment',
    'ASSIGNMENT_CHANGED': 'mdi-account-switch',
    'DEADLINE_CHANGED': 'mdi-clock-edit'
  };
  return icons[type] || 'mdi-circle';
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    'TASK_CREATED': 'primary',
    'STATUS_CHANGED': 'info',
    'COMMENT_ADDED': 'secondary',
    'ASSIGNMENT_CHANGED': 'warning',
    'DEADLINE_CHANGED': 'error'
  };
  return colors[type] || 'grey';
};

const formatActivityTitle = (activity: any) => {
  const titles: Record<string, string> = {
    'TASK_CREATED': 'Task Created',
    'STATUS_CHANGED': 'Status Changed',
    'COMMENT_ADDED': 'Comment Added',
    'ASSIGNMENT_CHANGED': 'Assignment Changed',
    'DEADLINE_CHANGED': 'Deadline Changed'
  };
  return titles[activity.type] || activity.type;
};

const formatActivityDescription = (activity: any) => {
  if (activity.type === 'STATUS_CHANGED') {
    return `Changed from ${activity.oldValue} to ${activity.newValue}`;
  }
  if (activity.taskId) {
    return `Task: ${activity.taskId}`;
  }
  if (activity.departmentId) {
    return `Department: ${activity.departmentId}`;
  }
  return activity.type.toLowerCase().replace(/_/g, ' ');
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};
</script>

<style scoped>
.activity-feed {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.activity-icon {
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-description {
  color: #6b7280;
  font-size: 0.8125rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.no-activities {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.no-activities p {
  margin-top: 1rem;
}
</style>
