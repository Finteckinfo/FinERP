<template>
  <v-card class="live-dashboard" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Live Dashboard</h3>
        <div class="live-indicator">
          <v-icon size="12" color="success" icon="mdi-circle" />
          <span class="live-text">LIVE</span>
        </div>
      </div>
      
      <div class="widget-content">
        <div class="live-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon color="primary" icon="mdi-account-group" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.teamOnline?.length || 0 }}</div>
              <div class="stat-label">Online</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon color="success" icon="mdi-check-circle" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.activeTasks?.length || 0 }}</div>
              <div class="stat-label">Active Tasks</div>
            </div>
          </div>
        </div>
        
        <div class="status-section" v-if="data?.status?.length">
          <h4 class="section-title">Task Status</h4>
          <div class="status-items">
            <div 
              v-for="statusItem in data.status.slice(0, 4)" 
              :key="statusItem.status"
              class="status-item"
            >
              <div class="status-name">{{ statusItem.status }}</div>
              <div class="status-count">{{ statusItem.count }}</div>
            </div>
          </div>
        </div>
        
        <div class="alerts-section" v-if="data?.alerts?.length">
          <h4 class="section-title">Active Alerts</h4>
          <div class="alerts-list">
            <div 
              v-for="alert in data.alerts.slice(0, 3)" 
              :key="alert.type"
              class="alert-item"
            >
              <v-icon :color="getAlertColor(alert.severity)" size="16" :icon="getAlertIcon(alert.severity)" />
              <span class="alert-text">{{ alert.type }} ({{ alert.count }})</span>
            </div>
          </div>
        </div>
        
        <div class="system-health" v-if="data?.systemHealth?.length">
          <h4 class="section-title">System Health</h4>
          <div class="health-items">
            <div 
              v-for="health in data.systemHealth" 
              :key="health.service"
              class="health-item"
            >
              <v-icon :color="getHealthColor(health.status)" :icon="getHealthIcon(health.status)" />
              <span>{{ health.service }}: {{ health.status }}</span>
            </div>
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

const getAlertColor = (severity: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning', 
    'HIGH': 'error',
    'CRITICAL': 'error'
  };
  return colors[severity] || 'info';
};

const getAlertIcon = (severity: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert',
    'CRITICAL': 'mdi-alert-octagon'
  };
  return icons[severity] || 'mdi-information';
};

const getHealthColor = (status: string) => {
  const colors: Record<string, string> = {
    'healthy': 'success',
    'warning': 'warning',
    'error': 'error',
    'unknown': 'grey'
  };
  return colors[status] || 'grey';
};

const getHealthIcon = (status: string) => {
  const icons: Record<string, string> = {
    'healthy': 'mdi-check-circle',
    'warning': 'mdi-alert-circle',
    'error': 'mdi-alert-octagon',
    'unknown': 'mdi-help-circle'
  };
  return icons[status] || 'mdi-help-circle';
};
</script>

<style scoped>
.live-dashboard {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
}

.live-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.health-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
}

.status-section, .alerts-section, .system-health {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.status-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
}

.status-name {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.status-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.alert-text {
  font-size: 0.8125rem;
  color: #374151;
}
</style>
