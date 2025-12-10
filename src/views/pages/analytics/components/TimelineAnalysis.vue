<template>
  <v-card class="timeline-analysis" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Timeline Analysis</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="timeline-metrics">
          <div class="metric-item">
            <div class="metric-label">Deadline Adherence</div>
            <div class="metric-value">{{ data?.deadlineAdherence || 0 }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Schedule Variance</div>
            <div class="metric-value">{{ data?.scheduleVariance || 0 }} days</div>
          </div>
        </div>
        
        <div class="risks-section" v-if="data?.risks?.length">
          <h4 class="section-title">Timeline Risks</h4>
          <div class="risks-list">
            <div 
              v-for="risk in data.risks.slice(0, 3)" 
              :key="risk.type"
              class="risk-item"
            >
              <v-icon :color="getRiskColor(risk.severity)" size="16">
                {{ getRiskIcon(risk.severity) }}
              </v-icon>
              <span class="risk-text">{{ risk.type }} ({{ risk.count }})</span>
            </div>
          </div>
        </div>
        
        <div class="predictions-section" v-if="data?.deliveryPredictions?.length">
          <h4 class="section-title">Delivery Predictions</h4>
          <div class="predictions-list">
            <div 
              v-for="prediction in data.deliveryPredictions" 
              :key="prediction.metric"
              class="prediction-item"
            >
              <div class="prediction-metric">{{ prediction.metric }}</div>
              <div class="prediction-value">{{ prediction.value || 'TBD' }}</div>
            </div>
          </div>
        </div>
        
        <div class="milestones-section">
          <h4 class="section-title">Milestones</h4>
          <div class="milestones-list">
            <div 
              v-for="milestone in data?.milestones?.slice(0, 5)" 
              :key="milestone.id"
              class="milestone-item"
            >
              <v-icon :color="milestone.completed ? 'success' : 'warning'">
                {{ milestone.completed ? 'mdi-check-circle' : 'mdi-clock' }}
              </v-icon>
              <div class="milestone-info">
                <div class="milestone-name">{{ milestone.name }}</div>
                <div class="milestone-date">{{ milestone.dueDate }}</div>
              </div>
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
</script>

<style scoped>
.timeline-analysis {
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

.timeline-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.milestone-info {
  flex: 1;
}

.milestone-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.milestone-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.risks-section, .predictions-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.risks-list, .predictions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.risk-item, .prediction-item {
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

.prediction-item {
  justify-content: space-between;
}

.prediction-metric {
  font-size: 0.875rem;
  color: #64748b;
}

.prediction-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
</style>
