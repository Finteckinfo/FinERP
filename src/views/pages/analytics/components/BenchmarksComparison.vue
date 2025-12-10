<template>
  <v-card class="benchmarks-comparison" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Benchmarks Comparison</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="benchmark-overview" v-if="data">
          <div class="overview-item">
            <div class="overview-label">Benchmark Type</div>
            <div class="overview-value">{{ data.benchmarkType }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Project ID</div>
            <div class="overview-value">{{ data.projectId }}</div>
          </div>
        </div>
        
        <div class="benchmarks-section" v-if="data?.benchmarks?.length">
          <h4 class="section-title">Benchmarks</h4>
          <div class="benchmarks-list">
            <div 
              v-for="benchmark in data.benchmarks" 
              :key="benchmark.metric"
              class="benchmark-item"
            >
              <div class="benchmark-info">
                <div class="benchmark-metric">{{ benchmark.metric }}</div>
                <div class="benchmark-comparison">
                  <div class="project-value">
                    <span class="value-label">Project:</span>
                    <span class="value-number">{{ formatValue(benchmark.projectValue) }}</span>
                  </div>
                  <div class="benchmark-value">
                    <span class="value-label">Benchmark:</span>
                    <span class="value-number">{{ formatValue(benchmark.benchmarkValue) }}</span>
                  </div>
                </div>
              </div>
              <div class="benchmark-delta" :class="getDeltaClass(benchmark.delta)">
                <v-icon size="16" :color="getDeltaColor(benchmark.delta)">
                  {{ getDeltaIcon(benchmark.delta) }}
                </v-icon>
                <span>{{ formatDelta(benchmark.delta) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="rankings-section" v-if="data?.rankings?.length">
          <h4 class="section-title">Rankings</h4>
          <div class="rankings-list">
            <div 
              v-for="ranking in data.rankings.slice(0, 5)" 
              :key="`${ranking.scope}-${ranking.metric}`"
              class="ranking-item"
            >
              <div class="ranking-info">
                <div class="ranking-scope">{{ ranking.scope }}</div>
                <div class="ranking-metric">{{ ranking.metric }}</div>
              </div>
              <div class="ranking-position">
                <span class="rank-badge">#{{ ranking.rank }}</span>
                <span class="rank-total">of {{ ranking.total }}</span>
              </div>
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

const formatValue = (value: any) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return value.toFixed(1);
  }
  return value.toString();
};

const formatDelta = (delta: any) => {
  if (delta === null || delta === undefined) return 'N/A';
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}`;
};

const getDeltaClass = (delta: any) => {
  if (delta === null || delta === undefined) return 'delta-neutral';
  if (delta > 0) return 'delta-positive';
  if (delta < 0) return 'delta-negative';
  return 'delta-neutral';
};

const getDeltaColor = (delta: any) => {
  if (delta === null || delta === undefined) return 'grey';
  if (delta > 0) return 'success';
  if (delta < 0) return 'error';
  return 'grey';
};

const getDeltaIcon = (delta: any) => {
  if (delta === null || delta === undefined) return 'mdi-minus';
  if (delta > 0) return 'mdi-trending-up';
  if (delta < 0) return 'mdi-trending-down';
  return 'mdi-minus';
};
</script>

<style scoped>
.benchmarks-comparison {
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

.benchmark-overview {
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
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.benchmarks-section, .rankings-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.benchmarks-list, .rankings-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.benchmark-item, .ranking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.benchmark-info, .ranking-info {
  flex: 1;
}

.benchmark-metric, .ranking-scope {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.ranking-metric {
  font-size: 0.75rem;
  color: #64748b;
}

.benchmark-comparison {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.project-value, .benchmark-value {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.value-number {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.benchmark-delta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.delta-positive {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.delta-negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.delta-neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.ranking-position {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.rank-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 700;
}

.rank-total {
  font-size: 0.75rem;
  color: #64748b;
}
</style>
