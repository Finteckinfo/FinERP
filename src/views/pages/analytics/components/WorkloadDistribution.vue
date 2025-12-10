<template>
  <v-card class="workload-distribution" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Workload Distribution</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="distribution-overview">
          <div class="overview-item">
            <div class="overview-label">Total Users</div>
            <div class="overview-value">{{ data?.distribution?.length || 0 }}</div>
          </div>
        </div>
        
        <div class="distribution-list" v-if="data?.distribution?.length">
          <h4 class="section-title">User Workload</h4>
          <div class="users-list">
            <div 
              v-for="user in data.distribution.slice(0, 5)" 
              :key="user.userId"
              class="user-item"
            >
              <div class="user-info">
                <div class="user-id">{{ user.userId }}</div>
                <div class="user-workload">
                  <span class="open-tasks">{{ user.open }} open</span>
                  <span class="total-tasks">{{ user.total }} total</span>
                </div>
              </div>
              <v-progress-linear
                :model-value="(user.open / user.total) * 100"
                :color="getWorkloadColor(user.open, user.total)"
                height="8"
                rounded
              />
            </div>
          </div>
        </div>
        
        <div class="capacity-planning" v-if="data?.capacityPlanning?.length">
          <h4 class="section-title">Capacity Planning</h4>
          <div class="planning-items">
            <div 
              v-for="plan in data.capacityPlanning.slice(0, 5)" 
              :key="plan.userId"
              class="planning-item"
            >
              <div class="plan-info">
                <div class="plan-user">{{ plan.userId }}</div>
                <div class="plan-stats">
                  <span class="current-open">{{ plan.open }} open</span>
                  <span class="target">{{ plan.target }} target</span>
                  <span class="delta" :class="getDeltaClass(plan.delta)">
                    {{ plan.delta > 0 ? '+' : '' }}{{ plan.delta }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="workload-balancing" v-if="data?.workloadBalancing?.length">
          <h4 class="section-title">Workload Balancing</h4>
          <div class="balancing-list">
            <div 
              v-for="balance in data.workloadBalancing.slice(0, 3)" 
              :key="balance.userId"
              class="balancing-item"
            >
              <v-icon color="warning" size="16" icon="mdi-scale-balance" />
              <span class="balancing-text">{{ balance.recommendation }}</span>
            </div>
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

const getWorkloadColor = (open: number, total: number) => {
  const ratio = open / total;
  if (ratio <= 0.5) return 'success';
  if (ratio <= 0.8) return 'warning';
  return 'error';
};

const getDeltaClass = (delta: number) => {
  if (delta > 0) return 'delta-positive';
  if (delta < 0) return 'delta-negative';
  return 'delta-neutral';
};
</script>

<style scoped>
.workload-distribution {
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

.distribution-overview {
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

.distribution-list, .capacity-planning, .workload-balancing {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.users-list, .planning-items, .balancing-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-item, .planning-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.user-info, .plan-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.user-id, .plan-user {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.user-workload {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.open-tasks {
  color: #ef4444;
  font-weight: 600;
}

.total-tasks {
  color: #64748b;
}

.plan-stats {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.current-open, .target {
  color: #64748b;
}

.delta {
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.delta-positive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.delta-negative {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.delta-neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.balancing-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.balancing-text {
  font-size: 0.8125rem;
  color: #374151;
}
</style>
