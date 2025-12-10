<template>
  <v-card class="cache-status" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Cache Status</h3>
        <v-btn 
          size="small" 
          variant="text" 
          color="primary"
          @click="$emit('refresh')"
        >
          Refresh
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div v-if="data" class="cache-content">
          <!-- Cache Info -->
          <div class="cache-info">
            <v-chip 
              :color="getCacheTypeColor(data.cacheType)"
              variant="tonal"
              size="small"
              class="me-2"
            >
              {{ data.cacheType }}
            </v-chip>
            <v-chip 
              v-if="data.metricType"
              color="info"
              variant="tonal"
              size="small"
            >
              {{ data.metricType }}
            </v-chip>
          </div>

          <!-- Status Overview -->
          <div v-if="data.status" class="status-section">
            <h4 class="section-title">Cache Status</h4>
            <div class="status-grid">
              <div class="status-card">
                <div class="status-header">
                  <span class="status-label">Status</span>
                  <v-icon :color="data.status.enabled ? 'success' : 'error'" size="16">
                    {{ data.status.enabled ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </div>
                <div class="status-value">
                  {{ data.status.enabled ? 'Enabled' : 'Disabled' }}
                </div>
              </div>
              
              <div v-if="data.status.size !== null" class="status-card">
                <div class="status-header">
                  <span class="status-label">Size</span>
                  <v-icon color="info" size="16" icon="mdi-database" />
                </div>
                <div class="status-value">{{ formatSize(data.status.size) }}</div>
              </div>
              
              <div v-if="data.status.items !== null" class="status-card">
                <div class="status-header">
                  <span class="status-label">Items</span>
                  <v-icon color="primary" size="16" icon="mdi-counter" />
                </div>
                <div class="status-value">{{ data.status.items.toLocaleString() }}</div>
              </div>
            </div>
          </div>

          <!-- Hit Rates -->
          <div v-if="data.hitRates" class="hitrates-section">
            <h4 class="section-title">Hit Rates</h4>
            <div class="hitrates-grid">
              <div 
                v-for="(rate, period) in data.hitRates" 
                :key="period"
                class="hitrate-card"
                v-show="rate !== null"
              >
                <div class="hitrate-header">
                  <span class="hitrate-period">{{ formatPeriod(String(period)) }}</span>
                  <v-icon :color="getHitRateColor(rate)" size="16">
                    {{ getHitRateIcon(rate) }}
                  </v-icon>
                </div>
                <div class="hitrate-value">{{ (rate * 100).toFixed(1) }}%</div>
                <v-progress-linear 
                  :model-value="rate * 100"
                  :color="getHitRateColor(rate)"
                  height="4"
                  rounded
                />
              </div>
            </div>
          </div>

          <!-- Schedules -->
          <div v-if="data.schedules?.length" class="schedules-section">
            <h4 class="section-title">Scheduled Jobs</h4>
            <div class="schedules-list">
              <div 
                v-for="schedule in data.schedules" 
                :key="schedule.job"
                class="schedule-item"
              >
                <div class="schedule-header">
                  <span class="schedule-job">{{ schedule.job }}</span>
                  <v-chip 
                    :color="getScheduleColor(schedule.lastRunAt)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ schedule.schedule }}
                  </v-chip>
                </div>
                <div class="schedule-details">
                  <div v-if="schedule.lastRunAt" class="schedule-detail">
                    <v-icon color="info" size="14" class="me-1" icon="mdi-clock-outline" />
                    <span>Last: {{ formatDate(schedule.lastRunAt) }}</span>
                  </div>
                  <div v-if="schedule.nextRunAt" class="schedule-detail">
                    <v-icon color="success" size="14" class="me-1" icon="mdi-clock-alert" />
                    <span>Next: {{ formatDate(schedule.nextRunAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div v-if="data.recommendations?.length" class="recommendations-section">
            <h4 class="section-title">Recommendations</h4>
            <div class="recommendations-list">
              <div 
                v-for="rec in data.recommendations" 
                :key="rec.action"
                class="recommendation-item"
                :class="`impact-${rec.impact.toLowerCase()}`"
              >
                <div class="recommendation-icon">
                  <v-icon :color="getImpactColor(rec.impact)" size="20">
                    {{ getImpactIcon(rec.impact) }}
                  </v-icon>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-header">
                    <span class="recommendation-action">{{ rec.action }}</span>
                    <v-chip 
                      :color="getImpactColor(rec.impact)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ rec.impact }}
                    </v-chip>
                  </div>
                  <div class="recommendation-rationale">{{ rec.rationale }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance -->
          <div v-if="data.perf" class="performance-section">
            <h4 class="section-title">Performance</h4>
            <div class="performance-grid">
              <div v-if="data.perf.avgLatencyMs !== null" class="perf-card">
                <div class="perf-header">
                  <span class="perf-label">Avg Latency</span>
                  <v-icon :color="getLatencyColor(data.perf.avgLatencyMs)" size="16">
                    {{ getLatencyIcon(data.perf.avgLatencyMs) }}
                  </v-icon>
                </div>
                <div class="perf-value">{{ data.perf.avgLatencyMs }}ms</div>
              </div>
              
              <div v-if="data.perf.p95Ms !== null" class="perf-card">
                <div class="perf-header">
                  <span class="perf-label">P95 Latency</span>
                  <v-icon :color="getLatencyColor(data.perf.p95Ms)" size="16">
                    {{ getLatencyIcon(data.perf.p95Ms) }}
                  </v-icon>
                </div>
                <div class="perf-value">{{ data.perf.p95Ms }}ms</div>
              </div>
              
              <div v-if="data.perf.errors1h !== null" class="perf-card">
                <div class="perf-header">
                  <span class="perf-label">Errors (1h)</span>
                  <v-icon :color="getErrorColor(data.perf.errors1h)" size="16">
                    {{ getErrorIcon(data.perf.errors1h) }}
                  </v-icon>
                </div>
                <div class="perf-value">{{ data.perf.errors1h }}</div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.status && !data.hitRates && !data.schedules?.length && !data.recommendations?.length && !data.perf" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-database-off" />
            <p class="text-body-2 text-medium-emphasis">No cache data available</p>
            <p class="text-caption text-medium-emphasis">Cache status will appear here once configured</p>
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

const getCacheTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'memory': 'primary',
    'redis': 'success',
    'none': 'grey'
  };
  return colors[type] || 'grey';
};

const getHitRateColor = (rate: number) => {
  if (rate >= 0.8) return 'success';
  if (rate >= 0.6) return 'primary';
  if (rate >= 0.4) return 'warning';
  return 'error';
};

const getHitRateIcon = (rate: number) => {
  if (rate >= 0.8) return 'mdi-trending-up';
  if (rate >= 0.6) return 'mdi-trending-neutral';
  return 'mdi-trending-down';
};

const getScheduleColor = (lastRun: string | null) => {
  if (!lastRun) return 'grey';
  const lastRunDate = new Date(lastRun);
  const now = new Date();
  const diffHours = (now.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 1) return 'success';
  if (diffHours < 24) return 'warning';
  return 'error';
};

const getImpactColor = (impact: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'error'
  };
  return colors[impact] || 'grey';
};

const getImpactIcon = (impact: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert-octagon'
  };
  return icons[impact] || 'mdi-help';
};

const getLatencyColor = (latency: number) => {
  if (latency < 100) return 'success';
  if (latency < 500) return 'primary';
  if (latency < 1000) return 'warning';
  return 'error';
};

const getLatencyIcon = (latency: number) => {
  if (latency < 100) return 'mdi-speedometer';
  if (latency < 500) return 'mdi-timer';
  return 'mdi-clock-alert';
};

const getErrorColor = (errors: number) => {
  if (errors === 0) return 'success';
  if (errors < 5) return 'warning';
  return 'error';
};

const getErrorIcon = (errors: number) => {
  if (errors === 0) return 'mdi-check-circle';
  if (errors < 5) return 'mdi-alert-circle';
  return 'mdi-alert-octagon';
};

const formatPeriod = (period: string) => {
  const periods: Record<string, string> = {
    'last1h': 'Last 1h',
    'last24h': 'Last 24h',
    'overall': 'Overall'
  };
  return periods[period] || period;
};

const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
</script>

<style scoped>
.cache-status {
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

.cache-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cache-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.status-grid,
.hitrates-grid,
.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.status-card,
.hitrate-card,
.perf-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.status-card:hover,
.hitrate-card:hover,
.perf-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.status-header,
.hitrate-header,
.perf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.status-label,
.hitrate-period,
.perf-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.status-value,
.hitrate-value,
.perf-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.schedules-list,
.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item,
.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.recommendation-item.impact-low {
  border-left-color: #3b82f6;
}

.recommendation-item.impact-medium {
  border-left-color: #f59e0b;
}

.recommendation-item.impact-high {
  border-left-color: #ef4444;
}

.schedule-header,
.recommendation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.schedule-job,
.recommendation-action {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.schedule-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.schedule-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.recommendation-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.recommendation-rationale {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state p {
  margin-top: 1rem;
}
</style>
