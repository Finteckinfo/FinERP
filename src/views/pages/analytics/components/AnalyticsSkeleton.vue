<template>
  <div class="analytics-skeleton">
    <!-- Overview Skeleton -->
    <div v-if="type === 'overview'" class="overview-skeleton">
      <div class="skeleton-header">
        <v-skeleton-loader type="heading" width="300px" />
        <div class="skeleton-actions">
          <v-skeleton-loader type="button" width="200px" />
        </div>
      </div>
      
      <div class="skeleton-stats">
        <div v-for="i in 4" :key="i" class="skeleton-stat-card">
          <v-skeleton-loader type="avatar" width="48px" height="48px" />
          <div class="skeleton-stat-content">
            <v-skeleton-loader type="text" width="60px" />
            <v-skeleton-loader type="text" width="100px" />
            <v-skeleton-loader type="text" width="80px" />
          </div>
        </div>
      </div>
      
      <div class="skeleton-scores">
        <v-skeleton-loader type="heading" width="200px" />
        <div class="skeleton-score-cards">
          <div v-for="i in 3" :key="i" class="skeleton-score-card">
            <v-skeleton-loader type="text" width="120px" />
            <v-skeleton-loader type="text" width="80px" />
            <v-skeleton-loader type="linear-progress" />
            <v-skeleton-loader type="text" width="150px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Skeleton -->
    <div v-else-if="type === 'widget'" class="widget-skeleton">
      <div class="skeleton-widget-header">
        <v-skeleton-loader type="heading" width="200px" />
        <v-skeleton-loader type="button" width="32px" height="32px" />
      </div>
      
      <div class="skeleton-widget-content">
        <div v-for="i in 6" :key="i" class="skeleton-widget-item">
          <v-skeleton-loader type="avatar" width="32px" height="32px" />
          <div class="skeleton-widget-item-content">
            <v-skeleton-loader type="text" width="80%" />
            <v-skeleton-loader type="text" width="60%" />
          </div>
          <v-skeleton-loader type="chip" width="60px" />
        </div>
      </div>
    </div>

    <!-- Activity Skeleton -->
    <div v-else-if="type === 'activity'" class="activity-skeleton">
      <div class="skeleton-activity-header">
        <v-skeleton-loader type="heading" width="200px" />
        <v-skeleton-loader type="button" width="100px" />
      </div>
      
      <div class="skeleton-activity-list">
        <div v-for="i in 8" :key="i" class="skeleton-activity-item">
          <v-skeleton-loader type="avatar" width="40px" height="40px" />
          <div class="skeleton-activity-content">
            <v-skeleton-loader type="text" width="70%" />
            <v-skeleton-loader type="text" width="50%" />
            <v-skeleton-loader type="text" width="30%" />
          </div>
          <v-skeleton-loader type="chip" width="80px" />
        </div>
      </div>
    </div>

    <!-- Alerts Skeleton -->
    <div v-else-if="type === 'alerts'" class="alerts-skeleton">
      <div class="skeleton-alerts-header">
        <v-skeleton-loader type="heading" width="200px" />
        <v-skeleton-loader type="button" width="120px" />
      </div>
      
      <div class="skeleton-alerts-list">
        <div v-for="i in 5" :key="i" class="skeleton-alert-item">
          <v-skeleton-loader type="icon" width="24px" height="24px" />
          <div class="skeleton-alert-content">
            <v-skeleton-loader type="text" width="60%" />
            <v-skeleton-loader type="text" width="40%" />
          </div>
          <v-skeleton-loader type="chip" width="60px" />
        </div>
      </div>
    </div>

    <!-- Chart Skeleton -->
    <div v-else-if="type === 'chart'" class="chart-skeleton">
      <div class="skeleton-chart-header">
        <v-skeleton-loader type="heading" width="200px" />
        <div class="skeleton-chart-controls">
          <v-skeleton-loader type="button" width="80px" />
          <v-skeleton-loader type="button" width="80px" />
          <v-skeleton-loader type="button" width="80px" />
        </div>
      </div>
      
      <div class="skeleton-chart-content">
        <v-skeleton-loader type="image" height="300px" />
      </div>
    </div>

    <!-- Default Skeleton -->
    <div v-else class="default-skeleton">
      <v-skeleton-loader type="card" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'overview' | 'widget' | 'activity' | 'alerts' | 'chart' | 'default';
}

defineProps<Props>();
</script>

<style scoped>
.analytics-skeleton {
  background: color-mix(in srgb, var(--erp-surface, #ffffff) 90%, #ffffff);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
  padding: 1.5rem;
  border: 1px solid color-mix(in srgb, var(--erp-border, #cbd5f5) 70%, transparent);
  backdrop-filter: blur(12px);
}

:global(.dark-theme) .analytics-skeleton {
  background: rgba(13, 20, 36, 0.88);
  border-color: rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 45px rgba(2, 6, 23, 0.8);
}

/* Overview Skeleton */
.overview-skeleton {
  min-height: 400px;
}

.skeleton-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.skeleton-stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: color-mix(in srgb, var(--erp-surface, #f8fafc) 85%, #ffffff);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

:global(.dark-theme) .skeleton-stat-card {
  background: rgba(22, 32, 53, 0.8);
  border-color: rgba(148, 163, 184, 0.25);
}

.skeleton-stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-scores {
  background: color-mix(in srgb, var(--erp-surface, #f8fafc) 75%, transparent);
  border-radius: 12px;
  padding: 1.5rem;
}

:global(.dark-theme) .skeleton-scores {
  background: rgba(15, 24, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.skeleton-score-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.skeleton-score-card {
  background: color-mix(in srgb, var(--erp-surface, #ffffff) 90%, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:global(.dark-theme) .skeleton-score-card {
  background: rgba(25, 33, 55, 0.9);
  border-color: rgba(148, 163, 184, 0.25);
}

/* Widget Skeleton */
.widget-skeleton {
  min-height: 300px;
}

.skeleton-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.skeleton-widget-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-widget-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--erp-surface, #f8fafc) 70%, #ffffff);
  border-radius: 8px;
}

:global(.dark-theme) .skeleton-widget-item {
  background: rgba(24, 34, 56, 0.85);
}

.skeleton-widget-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Activity Skeleton */
.activity-skeleton {
  min-height: 400px;
}

.skeleton-activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.skeleton-activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--erp-surface, #f8fafc) 70%, #ffffff);
  border-radius: 8px;
}

:global(.dark-theme) .skeleton-activity-item {
  background: rgba(24, 34, 56, 0.85);
}

.skeleton-activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Alerts Skeleton */
.alerts-skeleton {
  min-height: 300px;
}

.skeleton-alerts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.skeleton-alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--erp-surface, #f8fafc) 70%, #ffffff);
  border-radius: 8px;
}

:global(.dark-theme) .skeleton-alert-item {
  background: rgba(24, 34, 56, 0.85);
}

.skeleton-alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Chart Skeleton */
.chart-skeleton {
  min-height: 400px;
}

.skeleton-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.skeleton-chart-controls {
  display: flex;
  gap: 0.5rem;
}

.skeleton-chart-content {
  margin-top: 1rem;
}

/* Default Skeleton */
.default-skeleton {
  min-height: 200px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .skeleton-stats {
    grid-template-columns: 1fr;
  }
  
  .skeleton-score-cards {
    grid-template-columns: 1fr;
  }
  
  .skeleton-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .skeleton-widget-header,
  .skeleton-activity-header,
  .skeleton-alerts-header,
  .skeleton-chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .analytics-skeleton {
    padding: 1rem;
  }
  
  .skeleton-stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .skeleton-widget-item,
  .skeleton-activity-item,
  .skeleton-alert-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
