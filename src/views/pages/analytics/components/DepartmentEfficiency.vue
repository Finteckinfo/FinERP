<template>
  <v-card class="department-efficiency" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Department Efficiency</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="departments-list">
          <div 
            v-for="dept in data?.departmentComparison?.slice(0, 5)" 
            :key="dept.departmentId"
            class="department-item"
          >
            <div class="department-info">
              <div class="department-name">{{ dept.departmentName }}</div>
              <div class="department-stats">
                <span class="completion-rate">{{ dept.completionRate }}%</span>
              </div>
            </div>
            <div class="department-metrics">
              <div class="metric">
                <span class="metric-label">Total:</span>
                <span class="metric-value">{{ dept.total }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Completed:</span>
                <span class="metric-value">{{ dept.completed }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">In Progress:</span>
                <span class="metric-value">{{ dept.inProgress }}</span>
              </div>
            </div>
            <v-progress-linear
              :model-value="dept.completionRate"
              :color="getEfficiencyColor(dept.completionRate)"
              height="8"
              rounded
            />
          </div>
        </div>
        
        <div class="resource-utilization" v-if="data?.resourceUtilization?.length">
          <h4 class="section-title">Resource Utilization</h4>
          <div class="utilization-items">
            <div 
              v-for="resource in data.resourceUtilization" 
              :key="resource.metric"
              class="utilization-item"
            >
              <div class="utilization-metric">{{ resource.metric }}</div>
              <div class="utilization-value">{{ resource.value }}</div>
            </div>
          </div>
        </div>
        
        <div class="bottlenecks-section" v-if="data?.bottlenecks?.length">
          <h4 class="section-title">Bottlenecks</h4>
          <div class="bottlenecks-list">
            <div 
              v-for="bottleneck in data.bottlenecks.slice(0, 3)" 
              :key="bottleneck.departmentId"
              class="bottleneck-item"
            >
              <v-icon :color="getBottleneckColor(bottleneck.level)" size="16">
                {{ getBottleneckIcon(bottleneck.level) }}
              </v-icon>
              <span class="bottleneck-text">{{ bottleneck.reason }}</span>
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

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 80) return 'success';
  if (efficiency >= 60) return 'warning';
  return 'error';
};

const getBottleneckColor = (level: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning', 
    'HIGH': 'error',
    'CRITICAL': 'error'
  };
  return colors[level] || 'info';
};

const getBottleneckIcon = (level: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert',
    'CRITICAL': 'mdi-alert-octagon'
  };
  return icons[level] || 'mdi-information';
};
</script>

<style scoped>
.department-efficiency {
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

.departments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.department-item {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.department-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.department-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.department-efficiency {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.completion-rate {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.department-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.resource-utilization, .bottlenecks-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.utilization-items, .bottlenecks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.utilization-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.utilization-metric {
  font-size: 0.875rem;
  color: #64748b;
}

.utilization-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.bottleneck-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.bottleneck-text {
  font-size: 0.8125rem;
  color: #374151;
}
</style>
