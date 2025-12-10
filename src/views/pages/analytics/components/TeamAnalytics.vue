<template>
  <v-card class="team-analytics" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Team Analytics</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div v-if="!hasData" class="empty-state text-center py-6">
        <v-icon size="28" color="grey" icon="mdi-database-off" />
        <div class="mt-2 text-body-2 text-medium-emphasis">No data available</div>
      </div>
      <div v-else class="widget-content">
        <div class="team-overview">
          <div class="overview-item">
            <div class="overview-label">Team Members</div>
            <div class="overview-value">{{ data?.members?.length || 0 }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Avg Productivity</div>
            <div class="overview-value">{{ getAverageProductivity() }}%</div>
          </div>
        </div>
        
        <div class="team-members">
          <h4 class="section-title">Team Members</h4>
          <div class="members-list">
            <div 
              v-for="member in data?.members?.slice(0, 5)" 
              :key="member.userId"
              class="member-item"
            >
              <v-avatar size="32" color="primary">
                <span class="text-white">{{ getInitials(member.userId) }}</span>
              </v-avatar>
              <div class="member-info">
                <div class="member-name">{{ member.userId }}</div>
                <div class="member-role">{{ member.role }}</div>
              </div>
              <div class="member-metrics">
                <div class="metric">
                  <span class="metric-label">Completed</span>
                  <span class="metric-value">{{ member.completed }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Productivity</span>
                  <span class="metric-value">{{ member.productivityScore }}%</span>
                </div>
              </div>
            </div>
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

const getAverageProductivity = () => {
  if (!props.data?.members?.length) return 0;
  const total = props.data.members.reduce((sum: number, member: any) => sum + member.productivityScore, 0);
  return Math.round(total / props.data.members.length);
};

const getInitials = (userId: string) => {
  return userId.substring(0, 2).toUpperCase();
};

const hasData = computed(() => {
  const members = props.data?.members || [];
  return members.length > 0;
});
</script>

<style scoped>
.empty-state { border: 1px dashed rgba(0,0,0,0.08); border-radius: 8px; }
.team-analytics {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.team-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.overview-item {
  text-align: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.overview-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.overview-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.member-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.member-metrics {
  display: flex;
  gap: 1rem;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
</style>
