<template>
  <v-card class="data-freshness" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Data Freshness</h3>
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
        <div v-if="data" class="freshness-content">
          <!-- Data Info -->
          <div class="data-info">
            <v-chip 
              :color="getDataTypeColor(data.dataType)"
              variant="tonal"
              size="small"
              class="me-2"
            >
              {{ data.dataType }}
            </v-chip>
            <v-chip 
              :color="getSourceColor(data.source)"
              variant="tonal"
              size="small"
            >
              {{ data.source }}
            </v-chip>
          </div>

          <!-- Freshness Overview -->
          <div class="freshness-overview">
            <h4 class="section-title">Data Freshness</h4>
            <div class="freshness-grid">
              <div class="freshness-card">
                <div class="freshness-header">
                  <span class="freshness-label">Last Update</span>
                  <v-icon :color="getFreshnessColor(data.staleness)" size="16">
                    {{ getFreshnessIcon(data.staleness) }}
                  </v-icon>
                </div>
                <div class="freshness-value">
                  {{ data.lastUpdate ? formatDate(data.lastUpdate) : 'Unknown' }}
                </div>
              </div>
              
              <div v-if="data.staleness !== null" class="freshness-card">
                <div class="freshness-header">
                  <span class="freshness-label">Staleness</span>
                  <v-icon :color="getFreshnessColor(data.staleness)" size="16">
                    {{ getFreshnessIcon(data.staleness) }}
                  </v-icon>
                </div>
                <div class="freshness-value">{{ formatStaleness(data.staleness) }}</div>
                <v-progress-linear 
                  :model-value="getStalenessPercentage(data.staleness)"
                  :color="getFreshnessColor(data.staleness)"
                  height="4"
                  rounded
                />
              </div>
              
              <div class="freshness-card">
                <div class="freshness-header">
                  <span class="freshness-label">Real-time</span>
                  <v-icon :color="data.realtime ? 'success' : 'error'" size="16">
                    {{ data.realtime ? 'mdi-wifi' : 'mdi-wifi-off' }}
                  </v-icon>
                </div>
                <div class="freshness-value">
                  {{ data.realtime ? 'Enabled' : 'Disabled' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Sync Status -->
          <div v-if="data.sync" class="sync-section">
            <h4 class="section-title">Sync Status</h4>
            <div class="sync-card">
              <div class="sync-header">
                <span class="sync-label">Status</span>
                <v-chip 
                  :color="getSyncColor(data.sync.status)"
                  variant="tonal"
                  size="small"
                >
                  {{ data.sync.status }}
                </v-chip>
              </div>
              <div v-if="data.sync.lastError" class="sync-error">
                <v-icon color="error" size="16" class="me-2" icon="mdi-alert-circle" />
                <span class="error-message">{{ data.sync.lastError }}</span>
              </div>
            </div>
          </div>

          <!-- Schedules -->
          <div v-if="data.schedules?.length" class="schedules-section">
            <h4 class="section-title">Data Schedules</h4>
            <div class="schedules-list">
              <div 
                v-for="schedule in data.schedules" 
                :key="schedule.dataType"
                class="schedule-item"
              >
                <div class="schedule-header">
                  <span class="schedule-datatype">{{ schedule.dataType }}</span>
                  <v-chip 
                    :color="getScheduleColor(schedule.lastRunAt)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ schedule.frequency }}
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

          <!-- Freshness Timeline -->
          <div class="timeline-section">
            <h4 class="section-title">Freshness Timeline</h4>
            <div class="timeline-card">
              <div class="timeline-item">
                <div class="timeline-marker fresh"></div>
                <div class="timeline-content">
                  <span class="timeline-label">Fresh (0-15 min)</span>
                  <span class="timeline-description">Data is up-to-date</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker stale"></div>
                <div class="timeline-content">
                  <span class="timeline-label">Stale (15-60 min)</span>
                  <span class="timeline-description">Data may be outdated</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker outdated"></div>
                <div class="timeline-content">
                  <span class="timeline-label">Outdated (1+ hours)</span>
                  <span class="timeline-description">Data needs refresh</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.lastUpdate && !data.staleness && !data.sync && !data.schedules?.length" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-database-sync" />
            <p class="text-body-2 text-medium-emphasis">No freshness data available</p>
            <p class="text-caption text-medium-emphasis">Data freshness will appear here once configured</p>
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

const getDataTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'tasks': 'primary',
    'activities': 'success',
    'alerts': 'warning',
    'metrics': 'info'
  };
  return colors[type] || 'grey';
};

const getSourceColor = (source: string) => {
  const colors: Record<string, string> = {
    'primary': 'primary',
    'replica': 'secondary',
    'external': 'info'
  };
  return colors[source] || 'grey';
};

const getFreshnessColor = (staleness: number | null) => {
  if (staleness === null) return 'grey';
  if (staleness <= 15) return 'success';
  if (staleness <= 60) return 'warning';
  return 'error';
};

const getFreshnessIcon = (staleness: number | null) => {
  if (staleness === null) return 'mdi-help';
  if (staleness <= 15) return 'mdi-check-circle';
  if (staleness <= 60) return 'mdi-clock-alert';
  return 'mdi-alert-octagon';
};

const getSyncColor = (status: string) => {
  const colors: Record<string, string> = {
    'healthy': 'success',
    'degraded': 'warning',
    'down': 'error'
  };
  return colors[status] || 'grey';
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const formatStaleness = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getStalenessPercentage = (minutes: number) => {
  // Scale: 0-15min = 0-25%, 15-60min = 25-75%, 60min+ = 75-100%
  if (minutes <= 15) {
    return (minutes / 15) * 25;
  }
  if (minutes <= 60) {
    return 25 + ((minutes - 15) / 45) * 50;
  }
  return Math.min(75 + ((minutes - 60) / 60) * 25, 100);
};
</script>

<style scoped>
.data-freshness {
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

.freshness-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.data-info {
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

.freshness-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.freshness-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.freshness-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.freshness-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.freshness-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.freshness-value {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.sync-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.sync-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.sync-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.sync-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
  border-left: 3px solid #ef4444;
}

.error-message {
  font-size: 0.8125rem;
  color: #dc2626;
  font-weight: 500;
}

.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.schedule-item:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.schedule-datatype {
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

.timeline-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-marker.fresh {
  background: #10b981;
}

.timeline-marker.stale {
  background: #f59e0b;
}

.timeline-marker.outdated {
  background: #ef4444;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.timeline-description {
  font-size: 0.8125rem;
  color: #6b7280;
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
