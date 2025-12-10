<template>
  <v-card 
    elevation="0" 
    class="project-card-skeleton"
    :class="{ 'dark-theme': isDark }"
    :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <!-- Project name skeleton -->
        <div class="skeleton-text" style="width: 60%; height: 24px; border-radius: 4px;"></div>
        <!-- Project type skeleton -->
        <div class="skeleton-chip" style="width: 80px; height: 24px; border-radius: 12px;"></div>
      </div>
      
      <!-- Description skeleton -->
      <div class="skeleton-text mb-3" style="width: 100%; height: 16px; border-radius: 4px;"></div>
      <div class="skeleton-text mb-4" style="width: 70%; height: 16px; border-radius: 4px;"></div>
      
      <!-- Stats row skeleton -->
      <div class="d-flex justify-space-between mb-3">
        <div class="skeleton-text" style="width: 40px; height: 16px; border-radius: 4px;"></div>
        <div class="skeleton-text" style="width: 40px; height: 16px; border-radius: 4px;"></div>
        <div class="skeleton-text" style="width: 40px; height: 16px; border-radius: 4px;"></div>
      </div>
      
      <!-- Progress bar skeleton -->
      <div class="skeleton-progress mb-3" style="width: 100%; height: 8px; border-radius: 4px;"></div>
      
      <!-- Bottom row skeleton -->
      <div class="d-flex align-center justify-space-between">
        <div class="skeleton-text" style="width: 100px; height: 16px; border-radius: 4px;"></div>
        <div class="skeleton-chip" style="width: 60px; height: 20px; border-radius: 10px;"></div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.project-card-skeleton {
  transition: all 0.3s ease;
}

.skeleton-text,
.skeleton-chip,
.skeleton-progress {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark-theme .skeleton-text,
.dark-theme .skeleton-chip,
.dark-theme .skeleton-progress {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
