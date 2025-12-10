<template>
  <v-card class="quality-metrics" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Quality Metrics</h3>
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
        <div v-if="data" class="quality-content">
          <!-- Filter Summary -->
          <div class="filter-summary">
            <v-chip 
              v-if="data.qualityType"
              color="primary"
              variant="tonal"
              size="small"
              class="me-2"
            >
              {{ data.qualityType }}
            </v-chip>
            <v-chip 
              color="info"
              variant="tonal"
              size="small"
            >
              {{ data.dateRange }}
            </v-chip>
          </div>

          <!-- Quality Overview -->
          <div v-if="data.taskQuality?.length" class="quality-overview">
            <h4 class="section-title">Quality Overview</h4>
            <div class="quality-metrics-grid">
              <div 
                v-for="metric in data.taskQuality" 
                :key="metric.metric"
                class="quality-metric-card"
              >
                <div class="metric-header">
                  <span class="metric-name">{{ formatMetricName(metric.metric) }}</span>
                  <v-icon :color="getMetricColor(metric.metric)" size="16">
                    {{ getMetricIcon(metric.metric) }}
                  </v-icon>
                </div>
                <div class="metric-value">
                  {{ metric.value !== null ? formatMetricValue(metric.value, metric.metric) : 'N/A' }}
                </div>
                <div v-if="metric.value !== null" class="metric-bar">
                  <v-progress-linear 
                    :model-value="getMetricPercentage(metric.value, metric.metric)"
                    :color="getMetricColor(metric.metric)"
                    height="4"
                    rounded
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Revisions -->
          <div v-if="data.revisions?.length" class="revisions-section">
            <h4 class="section-title">Task Revisions</h4>
            <div class="revisions-list">
              <div 
                v-for="revision in data.revisions.slice(0, 5)" 
                :key="revision.taskId"
                class="revision-item"
              >
                <div class="revision-icon">
                  <v-icon color="warning" size="20" icon="mdi-file-edit" />
                </div>
                <div class="revision-content">
                  <div class="revision-header">
                    <span class="revision-task">{{ revision.taskId }}</span>
                    <v-chip 
                      :color="getRevisionColor(revision.revisionCount)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ revision.revisionCount }} revisions
                    </v-chip>
                  </div>
                  <div v-if="revision.lastRevisedAt" class="revision-date">
                    Last revised: {{ formatDate(revision.lastRevisedAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Approval Times -->
          <div v-if="data.approvalTimes?.length" class="approval-section">
            <h4 class="section-title">Approval Times</h4>
            <div class="approval-list">
              <div 
                v-for="approval in data.approvalTimes.slice(0, 5)" 
                :key="approval.taskId"
                class="approval-item"
              >
                <div class="approval-icon">
                  <v-icon color="success" size="20" icon="mdi-check-circle" />
                </div>
                <div class="approval-content">
                  <div class="approval-header">
                    <span class="approval-task">{{ approval.taskId }}</span>
                    <v-chip 
                      :color="getApprovalColor(approval.hoursToApprove)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ approval.hoursToApprove !== null ? `${approval.hoursToApprove}h` : 'N/A' }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Defects -->
          <div v-if="data.defects?.length" class="defects-section">
            <h4 class="section-title">Defects</h4>
            <div class="defects-list">
              <div 
                v-for="defect in data.defects.slice(0, 5)" 
                :key="defect.taskId"
                class="defect-item"
                :class="`severity-${defect.severity.toLowerCase()}`"
              >
                <div class="defect-icon">
                  <v-icon :color="getDefectColor(defect.severity)" size="20">
                    {{ getDefectIcon(defect.severity) }}
                  </v-icon>
                </div>
                <div class="defect-content">
                  <div class="defect-header">
                    <span class="defect-task">{{ defect.taskId }}</span>
                    <v-chip 
                      :color="getDefectColor(defect.severity)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ defect.severity }}
                    </v-chip>
                  </div>
                  <div class="defect-count">
                    {{ defect.defectCount }} defect{{ defect.defectCount !== 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trends -->
          <div v-if="data.trends?.length" class="trends-section">
            <h4 class="section-title">Quality Trends</h4>
            <div class="trends-chart">
              <div class="trends-summary">
                <div class="trend-item" v-for="trend in getTrendSummary()" :key="trend.metric">
                  <span class="trend-metric">{{ formatMetricName(trend.metric) }}</span>
                  <span class="trend-value">{{ trend.average.toFixed(1) }}</span>
                  <v-icon 
                    :color="trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'info'"
                    size="16"
                  >
                    {{ trend.direction === 'up' ? 'mdi-trending-up' : trend.direction === 'down' ? 'mdi-trending-down' : 'mdi-trending-neutral' }}
                  </v-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.taskQuality?.length && !data.revisions?.length && !data.approvalTimes?.length && !data.defects?.length && !data.trends?.length" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-chart-line-variant" />
            <p class="text-body-2 text-medium-emphasis">No quality metrics available</p>
            <p class="text-caption text-medium-emphasis">Quality data will appear here once available</p>
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

const getMetricColor = (metric: string) => {
  const colors: Record<string, string> = {
    'completion_rate': 'success',
    'defect_rate': 'error',
    'approval_time': 'warning',
    'revision_count': 'info'
  };
  return colors[metric] || 'primary';
};

const getMetricIcon = (metric: string) => {
  const icons: Record<string, string> = {
    'completion_rate': 'mdi-check-circle',
    'defect_rate': 'mdi-alert-circle',
    'approval_time': 'mdi-clock',
    'revision_count': 'mdi-file-edit'
  };
  return icons[metric] || 'mdi-chart-line';
};

const getRevisionColor = (count: number) => {
  if (count <= 2) return 'success';
  if (count <= 5) return 'warning';
  return 'error';
};

const getApprovalColor = (hours: number | null) => {
  if (hours === null) return 'grey';
  if (hours <= 24) return 'success';
  if (hours <= 72) return 'warning';
  return 'error';
};

const getDefectColor = (severity: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'error'
  };
  return colors[severity] || 'grey';
};

const getDefectIcon = (severity: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert-octagon'
  };
  return icons[severity] || 'mdi-help';
};

const formatMetricName = (metric: string) => {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatMetricValue = (value: number, metric: string) => {
  if (metric.includes('rate') || metric.includes('percentage')) {
    return `${value.toFixed(1)}%`;
  }
  if (metric.includes('time') || metric.includes('hours')) {
    return `${value.toFixed(1)}h`;
  }
  return value.toFixed(1);
};

const getMetricPercentage = (value: number, metric: string) => {
  if (metric.includes('rate') || metric.includes('percentage')) {
    return value;
  }
  if (metric.includes('time')) {
    // Assume 168 hours (1 week) as max for approval times
    return Math.min((value / 168) * 100, 100);
  }
  if (metric.includes('count')) {
    // Assume 10 as max for revision counts
    return Math.min((value / 10) * 100, 100);
  }
  return Math.min(value * 10, 100);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getTrendSummary = () => {
  if (!props.data?.trends?.length) return [];
  
  const trendsByMetric = props.data.trends.reduce((acc: any, trend: any) => {
    if (!acc[trend.metric]) {
      acc[trend.metric] = [];
    }
    acc[trend.metric].push(trend.value);
    return acc;
  }, {});

  return Object.entries(trendsByMetric).map(([metric, values]: [string, any]) => {
    const average = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length;
    
    let direction = 'neutral';
    if (secondAvg > firstAvg * 1.1) direction = 'up';
    else if (secondAvg < firstAvg * 0.9) direction = 'down';
    
    return { metric, average, direction };
  });
};
</script>

<style scoped>
.quality-metrics {
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

.quality-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.quality-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quality-metric-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.quality-metric-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.metric-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.metric-bar {
  margin-top: 0.5rem;
}

.revisions-list,
.approval-list,
.defects-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.revision-item,
.approval-item,
.defect-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.defect-item.severity-low {
  border-left: 3px solid #3b82f6;
}

.defect-item.severity-medium {
  border-left: 3px solid #f59e0b;
}

.defect-item.severity-high {
  border-left: 3px solid #ef4444;
}

.revision-icon,
.approval-icon,
.defect-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.revision-content,
.approval-content,
.defect-content {
  flex: 1;
  min-width: 0;
}

.revision-header,
.approval-header,
.defect-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.revision-task,
.approval-task,
.defect-task {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.revision-date,
.defect-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.trends-chart {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.3);
  border-radius: 8px;
}

.trends-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.trend-metric {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.trend-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
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
