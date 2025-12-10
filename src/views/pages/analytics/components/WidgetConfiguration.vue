<template>
  <v-card class="widget-configuration" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Widget Configuration</h3>
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
        <div v-if="data" class="widget-content">
          <!-- Dashboard Info -->
          <div class="dashboard-info">
            <v-chip 
              color="primary"
              variant="tonal"
              size="small"
              class="me-2"
            >
              {{ data.dashboardId }}
            </v-chip>
            <v-chip 
              v-if="data.widgetType"
              color="info"
              variant="tonal"
              size="small"
            >
              {{ data.widgetType }}
            </v-chip>
          </div>

          <!-- Widgets Grid -->
          <div v-if="data.widgets?.length" class="widgets-section">
            <h4 class="section-title">Configured Widgets ({{ data.widgets.length }})</h4>
            <div class="widgets-grid">
              <div 
                v-for="widget in data.widgets" 
                :key="widget.id"
                class="widget-card"
                :class="`widget-${widget.type}`"
              >
                <div class="widget-header">
                  <div class="widget-title">{{ widget.title }}</div>
                  <v-chip 
                    :color="getWidgetTypeColor(widget.type)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ widget.type }}
                  </v-chip>
                </div>
                
                <!-- Position Info -->
                <div class="widget-position">
                  <div class="position-label">Position</div>
                  <div class="position-grid">
                    <div class="position-item">
                      <span class="position-key">X:</span>
                      <span class="position-value">{{ widget.position.x }}</span>
                    </div>
                    <div class="position-item">
                      <span class="position-key">Y:</span>
                      <span class="position-value">{{ widget.position.y }}</span>
                    </div>
                    <div class="position-item">
                      <span class="position-key">W:</span>
                      <span class="position-value">{{ widget.position.w }}</span>
                    </div>
                    <div class="position-item">
                      <span class="position-key">H:</span>
                      <span class="position-value">{{ widget.position.h }}</span>
                    </div>
                  </div>
                </div>

                <!-- Data Source -->
                <div v-if="widget.dataSource" class="widget-datasource">
                  <div class="datasource-label">Data Source</div>
                  <div class="datasource-endpoint">{{ widget.dataSource.endpoint }}</div>
                  <div v-if="widget.dataSource.params" class="datasource-params">
                    <div 
                      v-for="(value, key) in widget.dataSource.params" 
                      :key="key"
                      class="param-item"
                    >
                      <span class="param-key">{{ key }}:</span>
                      <span class="param-value">{{ formatParamValue(value) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Refresh Settings -->
                <div v-if="widget.refresh" class="widget-refresh">
                  <div class="refresh-label">Refresh Settings</div>
                  <div class="refresh-details">
                    <div class="refresh-item">
                      <v-icon :color="widget.refresh.autoRefresh ? 'success' : 'grey'" size="16" class="me-1">
                        {{ widget.refresh.autoRefresh ? 'mdi-autorenew' : 'mdi-pause' }}
                      </v-icon>
                      <span>{{ widget.refresh.autoRefresh ? 'Auto' : 'Manual' }} refresh</span>
                    </div>
                    <div v-if="widget.refresh.intervalSec" class="refresh-item">
                      <v-icon color="info" size="16" class="me-1" icon="mdi-timer" />
                      <span>{{ formatInterval(widget.refresh.intervalSec) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Options -->
                <div v-if="widget.options" class="widget-options">
                  <div class="options-label">Options</div>
                  <div class="options-preview">
                    <v-chip 
                      size="x-small"
                      variant="tonal"
                      color="secondary"
                    >
                      {{ Object.keys(widget.options).length }} configured
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-view-dashboard-variant" />
            <p class="text-body-2 text-medium-emphasis">No widgets configured</p>
            <p class="text-caption text-medium-emphasis">Widgets will appear here once configured</p>
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

const getWidgetTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'kpi': 'primary',
    'chart': 'success',
    'table': 'info',
    'calendar': 'warning'
  };
  return colors[type] || 'grey';
};

const formatParamValue = (value: any) => {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value.toString();
};

const formatInterval = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
};
</script>

<style scoped>
.widget-configuration {
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

.widget-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-info {
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

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.widget-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 12px;
  border-left: 4px solid;
  transition: all 0.2s ease;
}

.widget-card.widget-kpi {
  border-left-color: #3b82f6;
}

.widget-card.widget-chart {
  border-left-color: #10b981;
}

.widget-card.widget-table {
  border-left-color: #06b6d4;
}

.widget-card.widget-calendar {
  border-left-color: #f59e0b;
}

.widget-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.widget-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.widget-position,
.widget-datasource,
.widget-refresh,
.widget-options {
  margin-bottom: 1rem;
}

.widget-position:last-child,
.widget-datasource:last-child,
.widget-refresh:last-child,
.widget-options:last-child {
  margin-bottom: 0;
}

.position-label,
.datasource-label,
.refresh-label,
.options-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.position-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
}

.position-key {
  color: #6b7280;
  font-weight: 500;
}

.position-value {
  color: #374151;
  font-weight: 600;
}

.datasource-endpoint {
  font-size: 0.8125rem;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.datasource-params {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.param-key {
  color: #6b7280;
  font-weight: 500;
  min-width: 3rem;
}

.param-value {
  color: #374151;
  font-weight: 600;
  font-family: monospace;
}

.refresh-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.refresh-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #374151;
}

.options-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
