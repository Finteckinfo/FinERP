<template>
  <v-card class="alerts-panel" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Active Alerts</h3>
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
        <div v-if="!hasData" class="empty-state text-center py-6">
          <v-icon size="28" color="grey" icon="mdi-database-off" />
          <div class="mt-2 text-body-2 text-medium-emphasis">No data available</div>
        </div>
        <div v-else class="alerts-list">
          <div 
            v-for="alert in data?.alerts?.slice(0, 6)" 
            :key="alert.id"
            class="alert-item"
            :class="`alert-${alert.severity}`"
          >
            <div class="alert-icon">
              <v-icon :color="getSeverityColor(alert.severity)" :icon="getSeverityIcon(alert.severity)" />
            </div>
            
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-description">{{ alert.description }}</div>
              <div class="alert-meta">
                <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
                <v-chip 
                  :color="getSeverityColor(alert.severity)"
                  size="x-small" 
                  variant="tonal"
                >
                  {{ alert.severity }}
                </v-chip>
                <v-chip 
                  v-if="alert.type"
                  :color="getTypeColor(alert.type)"
                  size="x-small" 
                  variant="tonal"
                >
                  {{ alert.type }}
                </v-chip>
                <v-chip 
                  v-if="alert.acknowledged"
                  color="success"
                  size="x-small" 
                  variant="tonal"
                >
                  Acknowledged
                </v-chip>
              </div>
            </div>
            
            <div class="alert-actions">
              <v-btn
                icon
                variant="text"
                size="small"
                @click="dismissAlert(alert.id)"
              >
                <v-icon size="16" icon="mdi-close" />
              </v-btn>
            </div>
          </div>
          
          <div v-if="!data?.alerts?.length" class="no-alerts">
            <v-icon size="48" color="success" icon="mdi-check-circle" />
            <p class="text-body-2 text-medium-emphasis">No active alerts</p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dismissedAlerts = ref(new Set<string>());

const getSeverityIcon = (severity: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert',
    'CRITICAL': 'mdi-alert-octagon'
  };
  return icons[severity] || 'mdi-information';
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'error',
    'CRITICAL': 'error'
  };
  return colors[severity] || 'info';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'DEADLINE': 'error',
    'BUDGET': 'warning',
    'RISK': 'info',
    'SYSTEM': 'secondary'
  };
  return colors[type] || 'grey';
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

const dismissAlert = (alertId: string) => {
  dismissedAlerts.value.add(alertId);
  // In a real app, you'd call an API to dismiss the alert
  console.log('Alert dismissed:', alertId);
};

const hasData = computed(() => {
  return Array.isArray(props.data?.alerts) ? props.data.alerts.length > 0 : false;
});
</script>

<style scoped>
.alerts-panel {
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

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.alert-item.alert-LOW {
  background: rgba(59, 130, 246, 0.05);
  border-left-color: #3b82f6;
}

.alert-item.alert-MEDIUM {
  background: rgba(245, 158, 11, 0.05);
  border-left-color: #f59e0b;
}

.alert-item.alert-HIGH {
  background: rgba(239, 68, 68, 0.05);
  border-left-color: #ef4444;
}

.alert-item.alert-CRITICAL {
  background: rgba(220, 38, 38, 0.1);
  border-left-color: #dc2626;
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.alert-description {
  color: #6b7280;
  font-size: 0.8125rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.alert-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.alert-actions {
  flex-shrink: 0;
}

.no-alerts {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.no-alerts p {
  margin-top: 1rem;
}
</style>
