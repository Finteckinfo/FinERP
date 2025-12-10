<template>
  <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-medium">Project Overview</h3>
      <v-btn 
        v-if="showEditButton"
        :color="'var(--erp-accent-green)'" 
        variant="outlined" 
        size="small"
        @click="$emit('edit')"
      >
        <v-icon class="mr-2">mdi-pencil</v-icon>
        Edit
      </v-btn>
    </div>
    
    <p class="text-body-2 text-medium-emphasis mb-4">{{ description }}</p>
    
    <div class="project-stats">
      <div 
        v-for="stat in stats" 
        :key="stat.key"
        class="stat-item"
      >
        <v-icon size="20" :color="stat.color">{{ stat.icon }}</v-icon>
        <span class="stat-label">{{ stat.label }}:</span>
        <span class="stat-value">{{ stat.value }}</span>
      </div>
    </div>
  </v-card>
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
  description: string;
  stats: StatItem[];
  showEditButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showEditButton: true
});

const emit = defineEmits<{
  edit: [];
}>();
</script>

<style scoped>
.border {
  border: 1px solid var(--erp-border);
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-label {
  color: var(--erp-text);
  opacity: 0.7;
  font-size: 0.875rem;
}

.stat-value {
  color: var(--erp-text);
  font-weight: 500;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .project-stats {
    grid-template-columns: 1fr;
  }
}
</style>
