<template>
  <v-card class="predictions-forecast" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Predictions Forecast</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="prediction-overview" v-if="data">
          <div class="overview-item">
            <div class="overview-label">Prediction Type</div>
            <div class="overview-value">{{ data.predictionType }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Horizon</div>
            <div class="overview-value">{{ data.horizon }}</div>
          </div>
        </div>
        
        <div class="predictions-list" v-if="data?.predictions?.length">
          <h4 class="section-title">Predictions</h4>
          <div class="prediction-items">
            <div 
              v-for="prediction in data.predictions" 
              :key="prediction.metric"
              class="prediction-item"
            >
              <div class="prediction-info">
                <div class="prediction-metric">{{ prediction.metric }}</div>
                <div class="prediction-value" :class="getValueClass(prediction.value, prediction.metric)">
                  {{ formatValue(prediction.value, prediction.metric) }}
                </div>
              </div>
              <div class="prediction-confidence" v-if="prediction.confidence !== undefined">
                <div class="confidence-label">Confidence</div>
                <div class="confidence-value">{{ Math.round(prediction.confidence * 100) }}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="risk-indicators" v-if="hasRiskIndicators">
          <h4 class="section-title">Risk Indicators</h4>
          <div class="risk-items">
            <template v-for="prediction in data.predictions" :key="prediction.metric">
              <div 
                v-if="isRiskMetric(prediction.metric)"
                class="risk-item"
              >
              <v-icon :color="getRiskColor(prediction.value)" size="20">
                {{ getRiskIcon(prediction.value) }}
              </v-icon>
                <div class="risk-info">
                  <div class="risk-metric">{{ prediction.metric }}</div>
                  <div class="risk-level">{{ prediction.value }}</div>
                </div>
              </div>
            </template>
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

const formatValue = (value: any, metric: string) => {
  if (value === null || value === undefined) return 'N/A';
  
  if (metric.includes('Probability') || metric.includes('Likelihood')) {
    return `${value}%`;
  }
  
  if (metric.includes('Days')) {
    return value ? `${value} days` : 'TBD';
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  return value;
};

const getValueClass = (value: any, metric: string) => {
  if (metric.includes('Risk') || metric.includes('Overrun')) {
    if (value === 'HIGH') return 'risk-high';
    if (value === 'MEDIUM') return 'risk-medium';
    if (value === 'LOW') return 'risk-low';
  }
  
  if (metric.includes('Trend')) {
    if (value === 'UP') return 'trend-up';
    if (value === 'DOWN') return 'trend-down';
    return 'trend-flat';
  }
  
  return '';
};

const hasRiskIndicators = computed(() => {
  return props.data?.predictions?.some((p: any) => isRiskMetric(p.metric));
});

const isRiskMetric = (metric: string) => {
  return metric.includes('Risk') || metric.includes('Overrun') || metric.includes('schedule');
};

const getRiskColor = (riskLevel: string) => {
  const colors: Record<string, string> = {
    'HIGH': 'error',
    'MEDIUM': 'warning',
    'LOW': 'success'
  };
  return colors[riskLevel] || 'info';
};

const getRiskIcon = (riskLevel: string) => {
  const icons: Record<string, string> = {
    'HIGH': 'mdi-alert-octagon',
    'MEDIUM': 'mdi-alert-circle',
    'LOW': 'mdi-check-circle'
  };
  return icons[riskLevel] || 'mdi-information';
};
</script>

<style scoped>
.predictions-forecast {
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

.prediction-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-item {
  text-align: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.overview-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.overview-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.predictions-list, .risk-indicators {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.prediction-items, .risk-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.prediction-info {
  flex: 1;
}

.prediction-metric {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.prediction-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.prediction-confidence {
  text-align: center;
  margin-left: 1rem;
}

.confidence-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.confidence-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.risk-high {
  color: #dc2626;
}

.risk-medium {
  color: #d97706;
}

.risk-low {
  color: #16a34a;
}

.trend-up {
  color: #dc2626;
}

.trend-down {
  color: #16a34a;
}

.trend-flat {
  color: #6b7280;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.risk-info {
  flex: 1;
}

.risk-metric {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.risk-level {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}
</style>
