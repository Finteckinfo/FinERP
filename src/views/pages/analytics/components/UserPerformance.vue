<template>
  <v-card class="user-performance" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">User Performance</h3>
        <v-btn 
          size="small" 
          variant="text" 
          color="primary"
          @click="$emit('refresh')"
        >
          View Details
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div v-if="data" class="performance-content">
          <!-- Performance Metrics -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">
                <v-icon color="primary" size="24" icon="mdi-chart-line" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ data.performance.throughputPerDay.toFixed(1) }}</div>
                <div class="metric-label">Tasks/Day</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <v-icon color="success" size="24" icon="mdi-check-circle" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ data.performance.completionRate }}%</div>
                <div class="metric-label">Completion Rate</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <v-icon color="warning" size="24" icon="mdi-clock-check" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ data.performance.onTimeRate }}%</div>
                <div class="metric-label">On-Time Rate</div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <v-icon color="info" size="24" icon="mdi-timer" />
              </div>
              <div class="metric-content">
                <div class="metric-value">{{ data.performance.averageCycleTimeDays ? data.performance.averageCycleTimeDays.toFixed(1) : 'N/A' }}</div>
                <div class="metric-label">Avg Cycle Time</div>
              </div>
            </div>
          </div>

          <!-- Ranking Information -->
          <div v-if="data.ranking" class="ranking-section">
            <h4 class="section-title">Ranking</h4>
            <div class="ranking-info">
              <v-chip 
                :color="getRankingColor(data.ranking.rank, data.ranking.total)"
                variant="tonal"
                size="small"
              >
                Rank {{ data.ranking.rank || 'N/A' }} of {{ data.ranking.total || 'N/A' }}
              </v-chip>
              <span class="ranking-scope">{{ data.ranking.scope }}</span>
            </div>
          </div>

          <!-- Goals Section -->
          <div v-if="data.goals?.active?.length" class="goals-section">
            <h4 class="section-title">Active Goals</h4>
            <div class="goals-list">
              <div 
                v-for="goal in data.goals.active.slice(0, 3)" 
                :key="goal.id"
                class="goal-item"
              >
                <div class="goal-info">
                  <div class="goal-title">{{ goal.title }}</div>
                  <div class="goal-progress">
                    <v-progress-linear 
                      :model-value="goal.progress"
                      :color="getProgressColor(goal.progress)"
                      height="6"
                      rounded
                    />
                    <span class="goal-percentage">{{ goal.progress }}%</span>
                  </div>
                </div>
                <div class="goal-target">
                  Target: {{ goal.target }}
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements Section -->
          <div v-if="data.achievements?.length" class="achievements-section">
            <h4 class="section-title">Recent Achievements</h4>
            <div class="achievements-list">
              <div 
                v-for="achievement in data.achievements.slice(0, 3)" 
                :key="achievement.id"
                class="achievement-item"
              >
                <v-icon color="warning" size="20" icon="mdi-trophy" />
                <div class="achievement-content">
                  <div class="achievement-title">{{ achievement.title }}</div>
                  <div class="achievement-date">{{ formatDate(achievement.earnedAt) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.goals?.active?.length && !data.achievements?.length" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-account-star" />
            <p class="text-body-2 text-medium-emphasis">No goals or achievements yet</p>
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

const getRankingColor = (rank: number | null, total: number | null) => {
  if (!rank || !total) return 'grey';
  const percentage = (rank / total) * 100;
  if (percentage <= 25) return 'success';
  if (percentage <= 50) return 'primary';
  if (percentage <= 75) return 'warning';
  return 'error';
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success';
  if (progress >= 60) return 'primary';
  if (progress >= 40) return 'warning';
  return 'error';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
</script>

<style scoped>
.user-performance {
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

.performance-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.metric-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.metric-icon {
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ranking-section,
.goals-section,
.achievements-section {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.3);
  border-radius: 8px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.ranking-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ranking-scope {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: capitalize;
}

.goals-list,
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.goal-item,
.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.goal-info {
  flex: 1;
  min-width: 0;
}

.goal-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.goal-percentage {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 2.5rem;
}

.goal-target {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.achievement-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.empty-state p {
  margin-top: 1rem;
}
</style>
