<template>
  <v-card class="analytics-settings" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Analytics Settings</h3>
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
        <div v-if="data" class="settings-content">
          <!-- User Info -->
          <div class="user-info">
            <v-chip 
              color="primary"
              variant="tonal"
              size="small"
              class="me-2"
            >
              User: {{ data.userId }}
            </v-chip>
            <v-chip 
              v-if="data.configType"
              color="info"
              variant="tonal"
              size="small"
            >
              {{ data.configType }}
            </v-chip>
          </div>

          <!-- Preferences -->
          <div v-if="data.preferences" class="preferences-section">
            <h4 class="section-title">Preferences</h4>
            <div class="preferences-grid">
              <div class="preference-item">
                <div class="preference-label">Theme</div>
                <div class="preference-value">{{ data.preferences.theme || 'Default' }}</div>
              </div>
              <div class="preference-item">
                <div class="preference-label">Default Date Range</div>
                <div class="preference-value">{{ data.preferences.defaultDateRange || '30d' }}</div>
              </div>
              <div class="preference-item">
                <div class="preference-label">Default Granularity</div>
                <div class="preference-value">{{ data.preferences.defaultGranularity || 'weekly' }}</div>
              </div>
            </div>
          </div>

          <!-- Layouts -->
          <div v-if="data.layouts?.length" class="layouts-section">
            <h4 class="section-title">Dashboard Layouts</h4>
            <div class="layouts-list">
              <div 
                v-for="layout in data.layouts" 
                :key="layout.dashboardId"
                class="layout-item"
              >
                <div class="layout-header">
                  <span class="layout-dashboard">{{ layout.dashboardId }}</span>
                  <v-chip 
                    color="success"
                    size="x-small"
                    variant="tonal"
                  >
                    Configured
                  </v-chip>
                </div>
                <div v-if="layout.updatedAt" class="layout-date">
                  Updated: {{ formatDate(layout.updatedAt) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Metric Configurations -->
          <div v-if="data.metricConfigs?.length" class="metrics-section">
            <h4 class="section-title">Metric Configurations</h4>
            <div class="metrics-list">
              <div 
                v-for="config in data.metricConfigs" 
                :key="config.metric"
                class="metric-config-item"
              >
                <div class="metric-config-header">
                  <span class="metric-name">{{ formatMetricName(config.metric) }}</span>
                  <v-switch
                    :model-value="config.enabled"
                    color="primary"
                    density="compact"
                    hide-details
                    readonly
                  />
                </div>
                <div v-if="config.thresholds" class="metric-thresholds">
                  <div 
                    v-for="(value, key) in config.thresholds" 
                    :key="key"
                    class="threshold-item"
                  >
                    <span class="threshold-label">{{ formatThresholdName(String(key)) }}:</span>
                    <span class="threshold-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Alert Settings -->
          <div v-if="data.alertSettings?.length" class="alerts-section">
            <h4 class="section-title">Alert Settings</h4>
            <div class="alerts-list">
              <div 
                v-for="alert in data.alertSettings" 
                :key="alert.type"
                class="alert-config-item"
              >
                <div class="alert-config-header">
                  <span class="alert-type">{{ formatAlertType(alert.type) }}</span>
                  <v-switch
                    :model-value="alert.enabled"
                    color="primary"
                    density="compact"
                    hide-details
                    readonly
                  />
                </div>
                <div class="alert-config-details">
                  <div v-if="alert.severityThreshold" class="alert-detail">
                    <span class="alert-label">Severity Threshold:</span>
                    <v-chip 
                      :color="getSeverityColor(alert.severityThreshold)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ alert.severityThreshold }}
                    </v-chip>
                  </div>
                  <div v-if="alert.channels?.length" class="alert-detail">
                    <span class="alert-label">Channels:</span>
                    <div class="channels-list">
                      <v-chip 
                        v-for="channel in alert.channels" 
                        :key="channel"
                        size="x-small"
                        variant="tonal"
                        color="secondary"
                        class="me-1"
                      >
                        {{ channel }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Views -->
          <div v-if="data.views?.length" class="views-section">
            <h4 class="section-title">Custom Views</h4>
            <div class="views-list">
              <div 
                v-for="view in data.views" 
                :key="view.id"
                class="view-item"
              >
                <div class="view-header">
                  <span class="view-name">{{ view.name }}</span>
                  <v-chip 
                    color="info"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ view.id }}
                  </v-chip>
                </div>
                <div v-if="view.createdAt" class="view-date">
                  Created: {{ formatDate(view.createdAt) }}
                </div>
                <div v-if="view.filters" class="view-filters">
                  <span class="view-label">Filters:</span>
                  <span class="view-filters-count">{{ Object.keys(view.filters).length }} applied</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.preferences && !data.layouts?.length && !data.metricConfigs?.length && !data.alertSettings?.length && !data.views?.length" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-cog" />
            <p class="text-body-2 text-medium-emphasis">No settings configured</p>
            <p class="text-caption text-medium-emphasis">Settings will appear here once configured</p>
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

const formatMetricName = (metric: string) => {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatThresholdName = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatAlertType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'error',
    'CRITICAL': 'error'
  };
  return colors[severity] || 'grey';
};
</script>

<style scoped>
.analytics-settings {
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-info {
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

.preferences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.preference-item {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.preference-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.preference-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.layouts-list,
.metrics-list,
.alerts-list,
.views-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.layout-item,
.metric-config-item,
.alert-config-item,
.view-item {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.layout-item:hover,
.metric-config-item:hover,
.alert-config-item:hover,
.view-item:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.layout-header,
.metric-config-header,
.alert-config-header,
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.layout-dashboard,
.metric-name,
.alert-type,
.view-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.layout-date,
.view-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.metric-thresholds {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.threshold-label {
  color: #6b7280;
  font-weight: 500;
}

.threshold-value {
  color: #374151;
  font-weight: 600;
}

.alert-config-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.alert-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.alert-label {
  color: #6b7280;
  font-weight: 500;
}

.channels-list {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.view-label {
  color: #6b7280;
  font-weight: 500;
}

.view-filters-count {
  color: #374151;
  font-weight: 600;
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
