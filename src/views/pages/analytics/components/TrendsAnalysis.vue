<template>
  <v-card class="trends-analysis" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Trends Analysis</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="trends-overview" v-if="data">
          <div class="trend-item">
            <div class="trend-label">Metric Type</div>
            <div class="trend-value">
              <span>{{ data.metricType }}</span>
            </div>
          </div>
          <div class="trend-item">
            <div class="trend-label">Date Range</div>
            <div class="trend-value">
              <span>{{ data.dateRange }}</span>
            </div>
          </div>
          <div class="trend-item">
            <div class="trend-label">Granularity</div>
            <div class="trend-value">
              <span>{{ data.granularity }}</span>
            </div>
          </div>
        </div>
        
        <div class="trends-data" v-if="data?.trends?.length">
          <h4 class="section-title">Trend Data</h4>
          <div class="trends-list">
            <div 
              v-for="trend in data.trends.slice(0, 5)" 
              :key="trend.date"
              class="trend-data-item"
            >
              <div class="trend-date">{{ formatDate(trend.date) }}</div>
              <div class="trend-value-display">{{ trend.value }}</div>
              <div class="trend-project" v-if="trend.projectId">{{ trend.projectId }}</div>
            </div>
          </div>
        </div>
        
        <div class="comparisons-section" v-if="data?.comparisons?.length">
          <h4 class="section-title">Project Comparisons</h4>
          <div class="comparisons-list">
            <div 
              v-for="comparison in data.comparisons.slice(0, 5)" 
              :key="comparison.projectId"
              class="comparison-item"
            >
              <div class="comparison-info">
                <div class="comparison-project">{{ comparison.projectId }}</div>
                <div class="comparison-metric">{{ comparison.metric }}</div>
              </div>
              <div class="comparison-rank">
                <span class="rank-badge">#{{ comparison.rank }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="trend-chart">
          <div class="chart-placeholder">
            <v-icon size="48" color="grey" icon="mdi-chart-line" />
            <p class="chart-text">Trend chart will be displayed here</p>
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

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
};
</script>

<style scoped>
.trends-analysis {
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

.trends-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.trend-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.trend-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
}

.trend-value.positive {
  color: #059669;
}

.trend-value.negative {
  color: #dc2626;
}

.trend-chart {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.chart-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.trends-data, .comparisons-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.trends-list, .comparisons-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trend-data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
}

.trend-date {
  font-size: 0.875rem;
  color: #64748b;
  min-width: 80px;
}

.trend-value-display {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  text-align: center;
}

.trend-project {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 60px;
  text-align: right;
}

.comparison-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
}

.comparison-info {
  flex: 1;
}

.comparison-project {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.comparison-metric {
  font-size: 0.75rem;
  color: #64748b;
}

.comparison-rank {
  margin-left: 1rem;
}

.rank-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>
