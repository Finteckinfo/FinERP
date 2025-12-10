<template>
  <v-card class="project-performance" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Project Performance</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div v-if="!hasData" class="empty-state text-center py-6">
        <v-icon size="28" color="grey" icon="mdi-database-off" />
        <div class="mt-2 text-body-2 text-medium-emphasis">No data available</div>
      </div>
      <div v-else class="widget-content">
        <div class="performance-metrics">
          <div class="metric-item">
            <div class="metric-label">Health Score</div>
            <div class="metric-value">{{ data?.metrics?.averageHealthScore || 0 }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Completion Rate</div>
            <div class="metric-value">{{ data?.metrics?.totalCompletionRate || 0 }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Timeline Progress</div>
            <div class="metric-value">{{ data?.metrics?.averageTimelineProgress || 0 }}%</div>
          </div>
        </div>
        
        <div class="budget-section">
          <h4 class="section-title">Escrow Snapshot</h4>
          <div class="budget-info">
            <div class="budget-item">
              <span class="budget-label">Coverage</span>
              <span class="budget-value">{{ data?.metrics?.budgetUtilization ?? 'N/A' }}</span>
            </div>
          </div>
        </div>
        
        <div class="risks-section">
          <h4 class="section-title">Common Risks</h4>
          <div class="risks-list">
            <div 
              v-for="risk in data?.metrics?.commonRisks?.slice(0, 3)" 
              :key="risk.type"
              class="risk-item"
            >
              <v-icon :color="getRiskColor(risk.severity)" size="16">
                {{ getRiskIcon(risk.severity) }}
              </v-icon>
              <span class="risk-text">{{ risk.type }} ({{ risk.count }})</span>
            </div>
            <div v-if="!data?.metrics?.commonRisks?.length" class="no-risks">
              <v-icon color="success" size="16" icon="mdi-check-circle" />
              <span class="risk-text">No risks detected</span>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const getRiskColor = (severity: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning', 
    'HIGH': 'error',
    'CRITICAL': 'error'
  };
  return colors[severity] || 'info';
};

const getRiskIcon = (severity: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert',
    'CRITICAL': 'mdi-alert-octagon'
  };
  return icons[severity] || 'mdi-information';
};

const hasData = computed(() => {
  const m = props.data?.metrics || {};
  return (
    typeof m.averageHealthScore === 'number' ||
    typeof m.totalCompletionRate === 'number' ||
    typeof m.averageTimelineProgress === 'number' ||
    (Array.isArray(m.commonRisks) && m.commonRisks.length > 0)
  );
});
</script>

<style scoped>
.empty-state { border: 1px dashed rgba(0,0,0,0.08); border-radius: 8px; }
.project-performance {
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

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-item {
  text-align: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.metric-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.budget-section {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.budget-info {
  text-align: center;
}

.budget-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.budget-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.budget-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.risks-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.risks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.risk-item, .no-risks {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.risk-text {
  font-size: 0.8125rem;
  color: #374151;
}
</style>
