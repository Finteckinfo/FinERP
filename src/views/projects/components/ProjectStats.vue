<template>
  <v-row class="mb-6">
    <v-col 
      v-for="stat in stats" 
      :key="stat.key"
      cols="12" 
      sm="6" 
      md="3"
    >
      <v-card elevation="0" class="pa-4 text-center stat-card" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
        <v-icon size="32" :color="stat.color" class="mb-2">{{ stat.icon }}</v-icon>
        <h3 class="text-h4 font-weight-bold" :style="{ color: 'var(--erp-text)' }">{{ stat.value }}</h3>
        <p class="mb-0" :style="{ color: 'var(--erp-text)', opacity: 0.7 }">{{ stat.label }}</p>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
interface StatItem {
  key: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface Props {
  stats: StatItem[];
}

defineProps<Props>();
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--erp-border);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
