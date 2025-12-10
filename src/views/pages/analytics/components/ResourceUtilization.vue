<template>
  <v-card class="resource-utilization" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Resource Utilization</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="utilization-overview">
          <div class="overview-item">
            <div class="overview-label">Allocation Efficiency</div>
            <div class="overview-value">{{ data?.allocationEfficiency || 'N/A' }}</div>
          </div>
        </div>
        
        <div class="capacity-vs-demand" v-if="data?.capacityVsDemand?.length">
          <h4 class="section-title">Capacity vs Demand</h4>
          <div class="capacity-items">
            <div 
              v-for="item in data.capacityVsDemand" 
              :key="item.capacityUnits"
              class="capacity-item"
            >
              <div class="capacity-info">
                <div class="capacity-label">Capacity Units</div>
                <div class="capacity-value">{{ item.capacityUnits }}</div>
              </div>
              <div class="demand-info">
                <div class="demand-label">Demand Units</div>
                <div class="demand-value">{{ item.demandUnits }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="utilization-rates" v-if="data?.utilizationRates?.length">
          <h4 class="section-title">Utilization Rates</h4>
          <div class="rates-list">
            <div 
              v-for="rate in data.utilizationRates" 
              :key="rate.metric"
              class="rate-item"
            >
              <div class="rate-metric">{{ rate.metric }}</div>
              <div class="rate-value">{{ rate.value }}</div>
            </div>
          </div>
        </div>
        
        <div class="optimization-section" v-if="data?.optimization?.length">
          <h4 class="section-title">Optimization Recommendations</h4>
          <div class="recommendations-list">
            <div 
              v-for="rec in data.optimization.slice(0, 3)" 
              :key="rec.recommendation"
              class="recommendation-item"
            >
              <v-icon color="primary" size="16" icon="mdi-lightbulb" />
              <span class="recommendation-text">{{ rec.recommendation }}</span>
            </div>
          </div>
        </div>
        
        <div class="cost-section" v-if="data?.costPerResource">
          <h4 class="section-title">Cost Per Resource</h4>
          <div class="cost-info">
            <div class="cost-value">{{ data.costPerResource }}</div>
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

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.resource-utilization {
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

.utilization-overview {
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

.resource-types {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.type-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.type-utilization {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.capacity-vs-demand, .utilization-rates, .optimization-section, .cost-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.capacity-items, .rates-list, .recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.capacity-item {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
}

.capacity-info, .demand-info {
  text-align: center;
}

.capacity-label, .demand-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.capacity-value, .demand-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.rate-item, .recommendation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.rate-metric {
  font-size: 0.875rem;
  color: #64748b;
}

.rate-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.recommendation-item {
  gap: 0.5rem;
  justify-content: flex-start;
}

.recommendation-text {
  font-size: 0.8125rem;
  color: #374151;
}

.cost-info {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
}

.cost-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}
</style>
