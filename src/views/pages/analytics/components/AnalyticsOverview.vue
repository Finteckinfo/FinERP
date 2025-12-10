<template>
  <v-card class="analytics-overview" elevation="0">
    <v-card-text class="pa-6">
      <div v-if="!hasData" class="empty-state text-center py-6">
        <v-icon size="28" color="grey" icon="mdi-database-off" />
        <div class="mt-2 text-body-2 text-medium-emphasis">No data available</div>
      </div>
      <template v-else>
      <!-- Header -->
      <div class="overview-header mb-6">
        <div class="d-flex align-center justify-space-between">
          <h3 class="text-h4 font-weight-medium">Analytics Overview</h3>
          <div class="header-actions">
            <v-btn-toggle
              v-model="selectedTimeRange"
              variant="outlined"
              density="compact"
              mandatory
              @update:model-value="handleTimeRangeChange"
            >
              <v-btn value="7d" size="small">7d</v-btn>
              <v-btn value="30d" size="small">30d</v-btn>
              <v-btn value="90d" size="small">90d</v-btn>
              <v-btn value="1y" size="small">1y</v-btn>
            </v-btn-toggle>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="$emit('refresh')"
            >
              <v-icon icon="mdi-refresh" />
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Totals Grid -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="primary" class="text-white">
                <v-icon icon="mdi-folder-multiple" />
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.totalProjects || 0 }}</div>
              <div class="stat-label">Total Projects</div>
              <div class="stat-change positive">
                <v-icon size="16" color="success" icon="mdi-trending-up" />
                <span>+12%</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="success" class="text-white">
                <v-icon icon="mdi-play-circle" />
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.activeProjects || 0 }}</div>
              <div class="stat-label">Active Projects</div>
              <div class="stat-change positive">
                <v-icon size="16" color="success" icon="mdi-trending-up" />
                <span>+8%</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="info" class="text-white">
                <v-icon icon="mdi-check-circle" />
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.completedTasks || 0 }}</div>
              <div class="stat-label">Completed Tasks</div>
              <div class="stat-change positive">
                <v-icon size="16" color="success" icon="mdi-trending-up" />
                <span>+15%</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="warning" class="text-white">
                <v-icon icon="mdi-account-group" />
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.teamMembers || 0 }}</div>
              <div class="stat-label">Team Members</div>
              <div class="stat-change neutral">
                <v-icon size="16" color="grey" icon="mdi-minus" />
                <span>0%</span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Performance Scores -->
      <div class="performance-scores">
        <h4 class="text-h6 font-weight-medium mb-4">Performance Scores</h4>
        <v-row>
          <v-col cols="12" md="4">
            <div class="score-card">
              <div class="score-header">
                <v-icon color="primary" class="mr-2" icon="mdi-speedometer" />
                <span class="score-title">Productivity</span>
              </div>
              <div class="score-value">{{ data?.scores?.productivity || 0 }}%</div>
              <v-progress-linear
                :model-value="data?.scores?.productivity || 0"
                color="primary"
                height="8"
                rounded
                class="mt-2"
              />
              <div class="score-description">
                Team productivity score based on task completion and efficiency
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="score-card">
              <div class="score-header">
                <v-icon color="success" class="mr-2" icon="mdi-cash" />
                <span class="score-title">Escrow Coverage</span>
              </div>
              <div class="score-value">
                <template v-if="budgetScore !== null">{{ budgetScore }}%</template>
                <template v-else>N/A</template>
              </div>
              <v-progress-linear
                v-if="budgetScore !== null"
                :model-value="budgetScore"
                :color="getBudgetColor(budgetScore)"
                height="8"
                rounded
                class="mt-2"
              />
              <div class="score-description">
                {{ budgetScore !== null ? 'Escrow capacity versus active obligations' : 'No escrow utilization data yet' }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="score-card">
              <div class="score-header">
                <v-icon color="info" class="mr-2" icon="mdi-clock" />
                <span class="score-title">Timeline Adherence</span>
              </div>
              <div class="score-value">{{ data?.scores?.timelineAdherence || 0 }}%</div>
              <v-progress-linear
                :model-value="data?.scores?.timelineAdherence || 0"
                :color="getTimelineColor(data?.scores?.timelineAdherence || 0)"
                height="8"
                rounded
                class="mt-2"
              />
              <div class="score-description">
                On-time delivery and deadline adherence rate
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Quick Insights -->
      <div class="quick-insights mt-6">
        <h4 class="text-h6 font-weight-medium mb-4">Quick Insights</h4>
        <v-row>
          <v-col cols="12" md="6">
            <v-alert
              type="success"
              variant="tonal"
              density="compact"
              class="insight-card"
            >
              <template #prepend>
                <v-icon icon="mdi-trending-up" />
              </template>
              <div class="insight-content">
                <div class="insight-title">Productivity Up</div>
                <div class="insight-description">
                  Team productivity increased by 12% compared to last period
                </div>
              </div>
            </v-alert>
          </v-col>

          <v-col cols="12" md="6">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="insight-card"
            >
              <template #prepend>
                <v-icon icon="mdi-clock-fast" />
              </template>
              <div class="insight-content">
                <div class="insight-title">Faster Delivery</div>
                <div class="insight-description">
                  Average project completion time reduced by 8 days
                </div>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'timeRangeChange', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedTimeRange = ref('30d');

const handleTimeRangeChange = (value: string) => {
  selectedTimeRange.value = value;
  emit('timeRangeChange', value);
};

const budgetScore = computed(() => {
  const value = props.data?.scores?.budgetUtilization;
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
});

const getBudgetColor = (value: number) => {
  if (value <= 60) return 'success';
  if (value <= 80) return 'warning';
  return 'error';
};

const getTimelineColor = (value: number) => {
  if (value >= 90) return 'success';
  if (value >= 70) return 'warning';
  return 'error';
};

const hasData = computed(() => {
  if (!props.data) return false;
  const totals = props.data.totals || {};
  const scores = props.data.scores || {};
  return (
    Boolean(totals.totalProjects) ||
    Boolean(totals.activeProjects) ||
    Boolean(totals.completedTasks) ||
    Boolean(totals.teamMembers) ||
    typeof scores.productivity === 'number' ||
    typeof scores.timelineAdherence === 'number'
  );
});
</script>

<style scoped>
.empty-state {
  border: 1px dashed rgba(0,0,0,0.08);
  border-radius: 8px;
}
.analytics-overview {
  background: var(--v-theme-surface);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.overview-header {
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding-bottom: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--v-theme-surface-variant);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--v-theme-outline) 50%, transparent);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-change.neutral {
  color: #6b7280;
}

.performance-scores {
  background: color-mix(in srgb, var(--erp-surface, var(--v-theme-surface)) 75%, transparent);
  border-radius: 12px;
  padding: 1.5rem;
}

.score-card {
  background: color-mix(in srgb, var(--erp-surface, #ffffff) 94%, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--erp-border, #d4d9e8) 70%, transparent);
  height: 100%;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.score-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--erp-primary, #22d3ee) 50%, transparent);
}

.score-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.score-title {
  font-weight: 600;
  color: color-mix(in srgb, var(--erp-text, #0f172a) 85%, #1f2937);
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: color-mix(in srgb, var(--erp-text, #0f172a) 95%, #020617);
  margin-bottom: 0.5rem;
}

.score-description {
  font-size: 0.8125rem;
  color: color-mix(in srgb, var(--erp-text, #0f172a) 65%, #64748b);
  margin-top: 0.75rem;
  line-height: 1.4;
}

:global(.dark-theme) .analytics-overview .performance-scores {
  background: rgba(10, 18, 32, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

:global(.dark-theme) .analytics-overview .score-card {
  background: rgba(18, 26, 42, 0.92);
  border-color: rgba(148, 163, 184, 0.28);
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.75);
}

:global(.dark-theme) .analytics-overview .score-title {
  color: rgba(226, 232, 240, 0.9);
}

:global(.dark-theme) .analytics-overview .score-value {
  color: #f8fafc;
}

:global(.dark-theme) .analytics-overview .score-description {
  color: rgba(226, 232, 240, 0.7);
}

.quick-insights {
  background: color-mix(in srgb, var(--v-theme-surface) 60%, transparent);
  border-radius: 12px;
  padding: 1.5rem;
}

.insight-card {
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.insight-content {
  margin-left: 0.5rem;
}

.insight-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.insight-description {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .score-value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .analytics-overview {
    margin: 0 -0.5rem;
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
