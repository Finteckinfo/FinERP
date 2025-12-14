<template>
  <v-navigation-drawer
    v-model="localValue"
    location="right"
    width="400"
    temporary
  >
    <div class="analytics-drawer">
      <!-- Header -->
      <div class="drawer-header">
        <div class="header-content">
          <h2 class="drawer-title">
            <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
            Kanban Analytics
          </h2>
          <v-btn
            icon
            variant="text"
            size="small"
            @click="localValue = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        
        <!-- Time Range Selector -->
        <div class="time-range-selector">
          <v-btn-toggle
            v-model="selectedTimeRange"
            variant="outlined"
            density="compact"
            mandatory
            @update:model-value="loadMetrics"
          >
            <v-btn value="7d" size="small">7d</v-btn>
            <v-btn value="30d" size="small">30d</v-btn>
            <v-btn value="90d" size="small">90d</v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Content -->
      <div class="drawer-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-section">
          <v-skeleton-loader
            v-for="i in 4"
            :key="i"
            type="card"
            class="mb-4"
          />
        </div>

        <!-- Error State -->
        <v-alert
          v-if="error && !loading"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <div class="d-flex align-center justify-space-between">
            <span>{{ error }}</span>
            <v-btn
              variant="text"
              size="small"
              @click="loadMetrics"
            >
              Retry
            </v-btn>
          </div>
        </v-alert>

        <!-- Metrics -->
        <div v-if="!loading && !error && metrics" class="metrics-container">
          <!-- Key Metrics -->
          <div class="metrics-section">
            <h3 class="section-title">Key Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">{{ metrics.throughput }}</div>
                <div class="metric-label">Tasks Completed</div>
                <div class="metric-period">Last {{ selectedTimeRange }}</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value">{{ formatTime(metrics.averageCycleTime) }}</div>
                <div class="metric-label">Avg Cycle Time</div>
                <div class="metric-period">Days to complete</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value">{{ formatTime(metrics.averageLeadTime) }}</div>
                <div class="metric-label">Avg Lead Time</div>
                <div class="metric-period">From creation</div>
              </div>
              
              <div class="metric-card">
                <div class="metric-value">{{ metrics.tasksInProgress }}</div>
                <div class="metric-label">In Progress</div>
                <div class="metric-period">Currently active</div>
              </div>
            </div>
          </div>

          <!-- Bottlenecks -->
          <div class="metrics-section">
            <h3 class="section-title">Bottlenecks</h3>
            <div v-if="bottlenecks.length === 0" class="no-bottlenecks">
              <v-icon color="success" class="mb-2">mdi-check-circle</v-icon>
              <p class="text-body-2">No bottlenecks detected</p>
            </div>
            <div v-else class="bottlenecks-list">
              <div
                v-for="bottleneck in bottlenecks"
                :key="bottleneck.status"
                class="bottleneck-item"
                :class="{ 'is-bottleneck': bottleneck.isBottleneck }"
              >
                <div class="bottleneck-header">
                  <div class="bottleneck-status">
                    <v-icon
                      :color="bottleneck.isBottleneck ? 'warning' : 'success'"
                      size="16"
                    >
                      {{ bottleneck.isBottleneck ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                    </v-icon>
                    <span class="status-name">{{ getStatusTitle(bottleneck.status) }}</span>
                  </div>
                  <v-chip
                    :color="bottleneck.isBottleneck ? 'warning' : 'success'"
                    size="x-small"
                    variant="flat"
                  >
                    {{ bottleneck.taskCount }} tasks
                  </v-chip>
                </div>
                <div class="bottleneck-details">
                  <span class="avg-time">
                    Avg time: {{ formatTime(bottleneck.averageTimeInStatus) }} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Department Performance -->
          <div class="metrics-section">
            <h3 class="section-title">Department Performance</h3>
            <div class="department-list">
              <div
                v-for="dept in metrics.departmentPerformance"
                :key="dept.departmentId"
                class="department-item"
              >
                <div class="department-header">
                  <span class="department-name">{{ dept.departmentName }}</span>
                  <v-chip size="x-small" variant="outlined">
                    {{ dept.completedTasks }} tasks
                  </v-chip>
                </div>
                <div class="department-metrics">
                  <div class="department-metric">
                    <span class="metric-label">Cycle Time:</span>
                    <span class="metric-value">{{ formatTime(dept.averageCycleTime) }}d</span>
                  </div>
                  <v-progress-linear
                    :model-value="getDepartmentEfficiency(dept)"
                    :color="getEfficiencyColor(getDepartmentEfficiency(dept))"
                    height="4"
                    rounded
                    class="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Trends Chart -->
          <div class="metrics-section">
            <h3 class="section-title">Trends</h3>
            <div class="chart-container">
              <div class="trend-summary">
                <div class="trend-item">
                  <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
                  <div>
                    <div class="trend-value">+{{ getTrendValue('completed') }}%</div>
                    <div class="trend-label">Completion Rate</div>
                  </div>
                </div>
                <div class="trend-item">
                  <v-icon 
                    :color="getTrendValue('cycle') > 0 ? 'error' : 'success'" 
                    class="mr-2"
                  >
                    {{ getTrendValue('cycle') > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  <div>
                    <div class="trend-value">{{ getTrendValue('cycle') > 0 ? '+' : '' }}{{ getTrendValue('cycle') }}%</div>
                    <div class="trend-label">Cycle Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="metrics-section">
            <h3 class="section-title">Recommendations</h3>
            <div class="recommendations-list">
              <div
                v-for="recommendation in recommendations"
                :key="recommendation.id"
                class="recommendation-item"
              >
                <v-icon :color="recommendation.type" class="mr-2">
                  {{ getRecommendationIcon(recommendation.type) }}
                </v-icon>
                <div class="recommendation-content">
                  <div class="recommendation-title">{{ recommendation.title }}</div>
                  <div class="recommendation-description">{{ recommendation.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { kanbanApi } from '../services/kanbanApi';
import type { KanbanMetrics } from '../types/kanban';

interface Props {
  modelValue: boolean;
  projectIds?: string[];
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

interface Recommendation {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const loading = ref(false);
const error = ref<string | null>(null);
const metrics = ref<KanbanMetrics | null>(null);
const selectedTimeRange = ref('30d');

// Computed
const bottlenecks = computed(() => {
  if (!metrics.value) return [];
  return [...metrics.value.bottlenecks].sort((a, b) => {
    if (a.isBottleneck && !b.isBottleneck) return -1;
    if (!a.isBottleneck && b.isBottleneck) return 1;
    return b.taskCount - a.taskCount;
  });
});

const recommendations = computed(() => {
  const recs: Recommendation[] = [];
  
  if (!metrics.value) return recs;
  
  // Check for bottlenecks
  const bottleneckCount = metrics.value.bottlenecks.filter(b => b.isBottleneck).length;
  if (bottleneckCount > 0) {
    recs.push({
      id: 'bottleneck',
      type: 'warning',
      title: 'Address Bottlenecks',
      description: `${bottleneckCount} column(s) have bottlenecks. Consider redistributing work or increasing capacity.`
    });
  }
  
  // Check cycle time
  if (metrics.value.averageCycleTime > 7) {
    recs.push({
      id: 'cycle-time',
      type: 'warning',
      title: 'Reduce Cycle Time',
      description: 'Tasks are taking longer than a week to complete. Break down large tasks or remove blockers.'
    });
  }
  
  // Check work in progress
  if (metrics.value.tasksInProgress > metrics.value.throughput * 2) {
    recs.push({
      id: 'wip-limit',
      type: 'info',
      title: 'Consider WIP Limits',
      description: 'High work-in-progress may be slowing down completion. Consider implementing WIP limits.'
    });
  }
  
  // Positive feedback
  if (bottleneckCount === 0 && metrics.value.averageCycleTime <= 5) {
    recs.push({
      id: 'good-flow',
      type: 'success',
      title: 'Great Flow!',
      description: 'Your team has excellent flow with no bottlenecks and fast cycle times.'
    });
  }
  
  return recs;
});

// Methods
const loadMetrics = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    console.log('[KanbanAnalytics] Loading cross-project metrics with filters:', props.projectIds);
    const data = await kanbanApi.getKanbanMetrics(selectedTimeRange.value, props.projectIds);
    metrics.value = data;
    
  } catch (err: any) {
    console.error('[KanbanAnalytics] Failed to load metrics:', err);
    error.value = err.message || 'Failed to load analytics';
  } finally {
    loading.value = false;
  }
};

const getStatusTitle = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'APPROVED': 'Approved'
  };
  return statusMap[status] || status;
};

const formatTime = (days: number) => {
  if (days < 1) return Math.round(days * 24) + 'h';
  return Math.round(days * 10) / 10;
};

const getDepartmentEfficiency = (dept: any) => {
  if (!metrics.value) return 0;
  const maxCycleTime = Math.max(...metrics.value.departmentPerformance.map(d => d.averageCycleTime));
  return Math.max(0, 100 - (dept.averageCycleTime / maxCycleTime) * 100);
};

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 80) return 'success';
  if (efficiency >= 60) return 'warning';
  return 'error';
};

const getTrendValue = (type: 'completed' | 'cycle') => {
  // Mock trend data - in real app, this would come from API
  const trends = {
    completed: 15,
    cycle: -8
  };
  return trends[type];
};

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'warning': return 'mdi-alert-circle';
    case 'info': return 'mdi-information';
    case 'success': return 'mdi-check-circle';
    default: return 'mdi-lightbulb';
  }
};

// Watch for project changes
watch(() => props.projectIds, () => {
  loadMetrics();
}, { deep: true });

// Load metrics when drawer opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadMetrics();
  }
});

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    loadMetrics();
  }
});
</script>

<style scoped>
.analytics-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  flex-shrink: 0;
  padding: 1.5rem;
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.drawer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  display: flex;
  align-items: center;
}

.time-range-selector {
  display: flex;
  justify-content: center;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.loading-section {
  padding: 1rem 0;
}

.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.metrics-section {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 1rem 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.metric-card {
  text-align: center;
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 6px;
  border: 1px solid var(--erp-border);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 0.25rem;
}

.metric-period {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.no-bottlenecks {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.bottlenecks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bottleneck-item {
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 6px;
  border: 1px solid var(--erp-border);
}

.bottleneck-item.is-bottleneck {
  border-color: rgba(245, 158, 11, 0.5);
  background: rgba(245, 158, 11, 0.05);
}

.bottleneck-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.bottleneck-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-name {
  font-weight: 500;
  color: var(--erp-text);
}

.bottleneck-details {
  font-size: 0.8125rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.department-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.department-item {
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 6px;
  border: 1px solid var(--erp-border);
}

.department-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.department-name {
  font-weight: 500;
  color: var(--erp-text);
}

.department-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.department-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.chart-container {
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 6px;
  border: 1px solid var(--erp-border);
}

.trend-summary {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.trend-item {
  display: flex;
  align-items: center;
  text-align: center;
}

.trend-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--erp-text);
}

.trend-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 6px;
  border: 1px solid var(--erp-border);
}

.recommendation-content {
  flex: 1;
}

.recommendation-title {
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 0.25rem;
}

.recommendation-description {
  font-size: 0.8125rem;
  color: var(--erp-text);
  opacity: 0.8;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .analytics-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .trend-summary {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .drawer-header {
    padding: 1rem;
  }
  
  .drawer-content {
    padding: 1rem;
  }
  
  .metrics-section {
    padding: 1rem;
  }
  
  .metric-card {
    padding: 0.75rem;
  }
  
  .metric-value {
    font-size: 1.25rem;
  }
  
  .section-title {
    font-size: 0.875rem;
  }
  
  .bottleneck-item,
  .department-item,
  .recommendation-item {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .analytics-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }
  
  .metrics-grid {
    gap: 0.5rem;
  }
  
  .drawer-header {
    padding: 0.75rem;
  }
  
  .drawer-content {
    padding: 0.75rem;
  }
  
  .metrics-section {
    padding: 0.75rem;
  }
  
  .metric-card {
    padding: 0.5rem;
  }
  
  .metric-value {
    font-size: 1.125rem;
  }
  
  .section-title {
    font-size: 0.8125rem;
  }
  
  .bottleneck-item,
  .department-item,
  .recommendation-item {
    padding: 0.5rem;
  }
  
  .time-range-selector .v-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.75rem;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .analytics-drawer {
    width: 450px !important;
    max-width: 450px !important;
  }
  
  .drawer-header {
    padding: 2rem;
  }
  
  .drawer-content {
    padding: 2rem;
  }
  
  .metrics-section {
    padding: 2rem;
  }
  
  .metric-card {
    padding: 1.5rem;
  }
  
  .metric-value {
    font-size: 1.75rem;
  }
  
  .section-title {
    font-size: 1.125rem;
  }
  
  .bottleneck-item,
  .department-item,
  .recommendation-item {
    padding: 1.5rem;
  }
  
  .time-range-selector .v-btn {
    min-width: 52px;
    height: 52px;
    font-size: 0.875rem;
  }
}

@media (min-width: 1920px) {
  .analytics-drawer {
    width: 500px !important;
    max-width: 500px !important;
  }
  
  .drawer-header {
    padding: 2.5rem;
  }
  
  .drawer-content {
    padding: 2.5rem;
  }
  
  .metrics-section {
    padding: 2.5rem;
  }
  
  .metric-card {
    padding: 2rem;
  }
  
  .metric-value {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .bottleneck-item,
  .department-item,
  .recommendation-item {
    padding: 2rem;
  }
  
  .time-range-selector .v-btn {
    min-width: 56px;
    height: 56px;
    font-size: 1rem;
  }
}
</style>
