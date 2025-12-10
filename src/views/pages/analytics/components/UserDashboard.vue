<template>
  <v-card class="user-dashboard" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Personal Dashboard</h3>
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
        <div v-if="data" class="dashboard-content">
          <!-- Metrics Overview -->
          <div class="metrics-section">
            <h4 class="section-title">Quick Stats</h4>
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-icon">
                  <v-icon color="primary" size="20" icon="mdi-clipboard-list" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ data.metrics.openTasks }}</div>
                  <div class="metric-label">Open Tasks</div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-icon">
                  <v-icon color="warning" size="20" icon="mdi-clock-alert" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ data.metrics.tasksDueThisWeek }}</div>
                  <div class="metric-label">Due This Week</div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-icon">
                  <v-icon color="success" size="20" icon="mdi-check" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ data.metrics.completedLast7d }}</div>
                  <div class="metric-label">Completed (7d)</div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-icon">
                  <v-icon color="info" size="20" icon="mdi-timer-check" />
                </div>
                <div class="metric-info">
                  <div class="metric-value">{{ data.metrics.onTimeRate }}%</div>
                  <div class="metric-label">On-Time Rate</div>
                </div>
              </div>
            </div>
          </div>

          <!-- KPIs Section -->
          <div class="kpis-section">
            <h4 class="section-title">Key Performance Indicators</h4>
            <div class="kpis-grid">
              <div class="kpi-card">
                <div class="kpi-header">
                  <span class="kpi-title">Productivity Score</span>
                  <v-icon :color="getKPIColor(data.kpis.productivityScore)" size="16">
                    {{ getKPIIcon(data.kpis.productivityScore) }}
                  </v-icon>
                </div>
                <div class="kpi-value">{{ data.kpis.productivityScore }}%</div>
                <v-progress-linear 
                  :model-value="data.kpis.productivityScore"
                  :color="getKPIColor(data.kpis.productivityScore)"
                  height="4"
                  rounded
                />
              </div>
              
              <div v-if="data.kpis.focusRatio !== null" class="kpi-card">
                <div class="kpi-header">
                  <span class="kpi-title">Focus Ratio</span>
                  <v-icon :color="getFocusColor(data.kpis.focusRatio)" size="16">
                    {{ getFocusIcon(data.kpis.focusRatio) }}
                  </v-icon>
                </div>
                <div class="kpi-value">{{ (data.kpis.focusRatio * 100).toFixed(1) }}%</div>
                <v-progress-linear 
                  :model-value="data.kpis.focusRatio * 100"
                  :color="getFocusColor(data.kpis.focusRatio)"
                  height="4"
                  rounded
                />
              </div>
              
              <div class="kpi-card">
                <div class="kpi-header">
                  <span class="kpi-title">Backlog Trend</span>
                  <v-icon :color="getTrendColor(data.kpis.backlogTrend)" size="16">
                    {{ getTrendIcon(data.kpis.backlogTrend) }}
                  </v-icon>
                </div>
                <div class="kpi-value">{{ data.kpis.backlogTrend }}</div>
                <div class="kpi-description">Task backlog direction</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div v-if="data.quickActions?.length" class="actions-section">
            <h4 class="section-title">Quick Actions</h4>
            <div class="actions-grid">
              <v-btn
                v-for="action in data.quickActions.slice(0, 4)"
                :key="action.id"
                :color="getActionColor(action.action)"
                variant="tonal"
                size="small"
                class="action-btn"
                @click="handleAction(action)"
              >
                <v-icon size="16" class="me-2">{{ getActionIcon(action.action) }}</v-icon>
                {{ action.label }}
              </v-btn>
            </div>
          </div>

          <!-- Recent Activity -->
          <div v-if="data.recentActivity?.length" class="activity-section">
            <h4 class="section-title">Recent Activity</h4>
            <div class="activity-list">
              <div 
                v-for="activity in data.recentActivity.slice(0, 4)" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <v-icon :color="getActivityColor(activity.type)" size="16">
                    {{ getActivityIcon(activity.type) }}
                  </v-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-summary">{{ activity.summary }}</div>
                  <div class="activity-meta">
                    <span class="activity-project">{{ activity.projectId }}</span>
                    <span class="activity-time">{{ formatTime(activity.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Deadlines -->
          <div v-if="data.upcomingDeadlines?.length" class="deadlines-section">
            <h4 class="section-title">Upcoming Deadlines</h4>
            <div class="deadlines-list">
              <div 
                v-for="deadline in data.upcomingDeadlines.slice(0, 3)" 
                :key="deadline.taskId"
                class="deadline-item"
                :class="{ 'urgent': isUrgent(deadline.dueDate) }"
              >
                <div class="deadline-icon">
                  <v-icon :color="getDeadlineColor(deadline.dueDate)" size="16">
                    {{ getDeadlineIcon(deadline.dueDate) }}
                  </v-icon>
                </div>
                <div class="deadline-content">
                  <div class="deadline-title">{{ deadline.title }}</div>
                  <div class="deadline-meta">
                    <span class="deadline-project">{{ deadline.projectId }}</span>
                    <span class="deadline-date">{{ formatDeadline(deadline.dueDate) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!data.quickActions?.length && !data.recentActivity?.length && !data.upcomingDeadlines?.length" class="empty-state">
            <v-icon size="48" color="grey" icon="mdi-view-dashboard" />
            <p class="text-body-2 text-medium-emphasis">Dashboard data will appear here</p>
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
const emit = defineEmits<Emits>();

const getKPIColor = (score: number) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'primary';
  if (score >= 40) return 'warning';
  return 'error';
};

const getKPIIcon = (score: number) => {
  if (score >= 80) return 'mdi-trending-up';
  if (score >= 60) return 'mdi-trending-neutral';
  return 'mdi-trending-down';
};

const getFocusColor = (ratio: number) => {
  if (ratio >= 0.8) return 'success';
  if (ratio >= 0.6) return 'primary';
  if (ratio >= 0.4) return 'warning';
  return 'error';
};

const getFocusIcon = (ratio: number) => {
  if (ratio >= 0.8) return 'mdi-target';
  if (ratio >= 0.6) return 'mdi-crosshairs';
  return 'mdi-crosshairs-gps';
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'UP': return 'error';
    case 'DOWN': return 'success';
    case 'FLAT': return 'info';
    default: return 'grey';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'UP': return 'mdi-trending-up';
    case 'DOWN': return 'mdi-trending-down';
    case 'FLAT': return 'mdi-trending-neutral';
    default: return 'mdi-help';
  }
};

const getActionColor = (action: string) => {
  if (action.includes('create')) return 'primary';
  if (action.includes('view')) return 'info';
  if (action.includes('edit')) return 'warning';
  return 'secondary';
};

const getActionIcon = (action: string) => {
  if (action.includes('create')) return 'mdi-plus';
  if (action.includes('view')) return 'mdi-eye';
  if (action.includes('edit')) return 'mdi-pencil';
  if (action.includes('report')) return 'mdi-chart-bar';
  return 'mdi-cog';
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    'TASK_CREATED': 'primary',
    'STATUS_CHANGED': 'info',
    'COMMENT_ADDED': 'secondary',
    'ASSIGNMENT_CHANGED': 'warning'
  };
  return colors[type] || 'grey';
};

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    'TASK_CREATED': 'mdi-plus-circle',
    'STATUS_CHANGED': 'mdi-swap-horizontal',
    'COMMENT_ADDED': 'mdi-comment',
    'ASSIGNMENT_CHANGED': 'mdi-account-switch'
  };
  return icons[type] || 'mdi-circle';
};

const getDeadlineColor = (dueDate: string) => {
  const days = getDaysUntilDeadline(dueDate);
  if (days < 1) return 'error';
  if (days <= 3) return 'warning';
  return 'info';
};

const getDeadlineIcon = (dueDate: string) => {
  const days = getDaysUntilDeadline(dueDate);
  if (days < 1) return 'mdi-alert-circle';
  if (days <= 3) return 'mdi-clock-alert';
  return 'mdi-clock';
};

const getDaysUntilDeadline = (dueDate: string) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isUrgent = (dueDate: string) => {
  return getDaysUntilDeadline(dueDate) <= 1;
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const formatDeadline = (dueDate: string) => {
  const days = getDaysUntilDeadline(dueDate);
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

const handleAction = (action: any) => {
  console.log('Action clicked:', action);
  // In a real app, you'd navigate or trigger the action
};
</script>

<style scoped>
.user-dashboard {
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.metric-icon {
  flex-shrink: 0;
}

.metric-info {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 1.125rem;
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

.kpis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.kpi-card {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.kpi-card:hover {
  background: rgba(248, 250, 252, 0.8);
  transform: translateY(-1px);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.kpi-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.kpi-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.action-btn {
  justify-content: flex-start;
}

.activity-list,
.deadlines-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item,
.deadline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.deadline-item.urgent {
  background: rgba(239, 68, 68, 0.05);
  border-left: 3px solid #ef4444;
}

.activity-icon,
.deadline-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.activity-content,
.deadline-content {
  flex: 1;
  min-width: 0;
}

.activity-summary,
.deadline-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.activity-meta,
.deadline-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.activity-project,
.deadline-project {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.activity-time,
.deadline-date {
  font-weight: 500;
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
