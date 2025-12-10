<template>
  <v-card class="bottlenecks-analysis" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Bottlenecks Analysis</h3>
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
        <div v-if="data" class="bottlenecks-content">
          <!-- Filter Summary -->
          <div class="filter-summary">
            <v-chip 
              v-if="data.severity"
              :color="getSeverityColor(data.severity)"
              variant="tonal"
              size="small"
              class="me-2"
            >
              {{ data.severity }} Severity
            </v-chip>
            <v-chip 
              color="info"
              variant="tonal"
              size="small"
            >
              {{ data.dateRange }}
            </v-chip>
          </div>

          <!-- Bottlenecks List -->
          <div v-if="data.bottlenecks?.length" class="bottlenecks-section">
            <h4 class="section-title">Identified Bottlenecks</h4>
            <div class="bottlenecks-list">
              <div 
                v-for="bottleneck in data.bottlenecks" 
                :key="`${bottleneck.area}-${bottleneck.key}`"
                class="bottleneck-item"
                :class="`severity-${bottleneck.severity.toLowerCase()}`"
              >
                <div class="bottleneck-icon">
                  <v-icon :color="getSeverityColor(bottleneck.severity)" size="20">
                    {{ getBottleneckIcon(bottleneck.area) }}
                  </v-icon>
                </div>
                <div class="bottleneck-content">
                  <div class="bottleneck-header">
                    <span class="bottleneck-area">{{ formatArea(bottleneck.area) }}</span>
                    <v-chip 
                      :color="getSeverityColor(bottleneck.severity)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ bottleneck.severity }}
                    </v-chip>
                  </div>
                  <div class="bottleneck-key">{{ bottleneck.key }}</div>
                  <div class="bottleneck-metrics">
                    <span class="metric">
                      <strong>{{ bottleneck.count }}</strong> items
                    </span>
                    <span v-if="bottleneck.avgTimeDays" class="metric">
                      <strong>{{ bottleneck.avgTimeDays.toFixed(1) }}</strong> avg days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Impact Analysis -->
          <div v-if="data.impact?.length" class="impact-section">
            <h4 class="section-title">Impact Analysis</h4>
            <div class="impact-list">
              <div 
                v-for="impact in data.impact" 
                :key="`${impact.area}-${impact.key}`"
                class="impact-item"
              >
                <div class="impact-header">
                  <span class="impact-area">{{ formatArea(impact.area) }}</span>
                  <span class="impact-key">{{ impact.key }}</span>
                </div>
                <div class="impact-metrics">
                  <div class="impact-metric">
                    <v-icon color="error" size="16" class="me-1">mdi-clipboard-alert</v-icon>
                    {{ impact.affectedTasks }} tasks affected
                  </div>
                  <div v-if="impact.scheduleImpactDays" class="impact-metric">
                    <v-icon color="warning" size="16" class="me-1">mdi-clock-alert</v-icon>
                    {{ impact.scheduleImpactDays }} days delay
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
                :key="`${rec.area}-${rec.key}`"
                class="recommendation-item"
                :class="`priority-${rec.priority.toLowerCase()}`"
              >
                <div class="recommendation-icon">
                  <v-icon :color="getPriorityColor(rec.priority)" size="20">
                    {{ getPriorityIcon(rec.priority) }}
                  </v-icon>
                </div>
                <div class="recommendation-content">
                  <div class="recommendation-header">
                    <span class="recommendation-area">{{ formatArea(rec.area) }}</span>
                    <v-chip 
                      :color="getPriorityColor(rec.priority)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ rec.priority }}
                    </v-chip>
                  </div>
                  <div class="recommendation-key">{{ rec.key }}</div>
                  <div class="recommendation-action">{{ rec.action }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Prevention Measures -->
          <div v-if="data.prevention?.length" class="prevention-section">
            <h4 class="section-title">Prevention Measures</h4>
            <div class="prevention-list">
              <div 
                v-for="prevention in data.prevention" 
                :key="`${prevention.area}-${prevention.key}`"
                class="prevention-item"
              >
                <div class="prevention-icon">
                  <v-icon color="success" size="20">mdi-shield-check</v-icon>
                </div>
                <div class="prevention-content">
                  <div class="prevention-header">
                    <span class="prevention-area">{{ formatArea(prevention.area) }}</span>
                    <span class="prevention-key">{{ prevention.key }}</span>
                  </div>
                  <div class="prevention-measure">{{ prevention.measure }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.bottlenecks?.length && !data.impact?.length && !data.recommendations?.length && !data.prevention?.length" class="empty-state">
            <v-icon size="48" color="success">mdi-check-circle</v-icon>
            <p class="text-body-2 text-medium-emphasis">No bottlenecks identified</p>
            <p class="text-caption text-medium-emphasis">Your project is running smoothly!</p>
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

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'error'
  };
  return colors[severity] || 'grey';
};

const getBottleneckIcon = (area: string) => {
  const icons: Record<string, string> = {
    'status': 'mdi-progress-clock',
    'department': 'mdi-domain',
    'assignee': 'mdi-account'
  };
  return icons[area] || 'mdi-alert';
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'error'
  };
  return colors[priority] || 'grey';
};

const getPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = {
    'LOW': 'mdi-information',
    'MEDIUM': 'mdi-alert-circle',
    'HIGH': 'mdi-alert-octagon'
  };
  return icons[priority] || 'mdi-help';
};

const formatArea = (area: string) => {
  return area.charAt(0).toUpperCase() + area.slice(1);
};
</script>

<style scoped>
.bottlenecks-analysis {
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

.bottlenecks-content {
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

.bottlenecks-list,
.impact-list,
.recommendations-list,
.prevention-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bottleneck-item,
.impact-item,
.recommendation-item,
.prevention-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.bottleneck-item.severity-low {
  border-left-color: #3b82f6;
}

.bottleneck-item.severity-medium {
  border-left-color: #f59e0b;
}

.bottleneck-item.severity-high {
  border-left-color: #ef4444;
}

.recommendation-item.priority-low {
  border-left-color: #3b82f6;
}

.recommendation-item.priority-medium {
  border-left-color: #f59e0b;
}

.recommendation-item.priority-high {
  border-left-color: #ef4444;
}

.bottleneck-icon,
.impact-icon,
.recommendation-icon,
.prevention-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.bottleneck-content,
.impact-content,
.recommendation-content,
.prevention-content {
  flex: 1;
  min-width: 0;
}

.bottleneck-header,
.recommendation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.bottleneck-area,
.recommendation-area,
.impact-area,
.prevention-area {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.bottleneck-key,
.recommendation-key,
.impact-key,
.prevention-key {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.bottleneck-metrics,
.impact-metrics {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.impact-metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.recommendation-action,
.prevention-measure {
  font-size: 0.875rem;
  color: #374151;
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
