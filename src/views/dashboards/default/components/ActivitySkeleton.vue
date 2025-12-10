<template>
  <v-card elevation="0" class="activity-skeleton" :class="{ 'dark-theme': isDark }">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="skeleton-text" style="width: 180px; height: 32px; border-radius: 4px;"></div>
        <div class="skeleton-chip" style="width: 80px; height: 32px; border-radius: 16px;"></div>
      </div>
      
      <!-- Activity items skeleton -->
      <div v-for="i in 5" :key="i" class="activity-item-skeleton mb-4">
        <div class="d-flex align-start">
          <div class="skeleton-avatar" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; flex-shrink: 0;"></div>
          <div class="flex-grow-1">
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="skeleton-text" style="width: 120px; height: 18px; border-radius: 4px;"></div>
              <div class="skeleton-text" style="width: 80px; height: 14px; border-radius: 4px;"></div>
            </div>
            <div class="skeleton-text mb-1" style="width: 200px; height: 16px; border-radius: 4px;"></div>
            <div class="skeleton-text" style="width: 150px; height: 14px; border-radius: 4px;"></div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.activity-skeleton {
  background: var(--erp-card-bg) !important;
  border: 1px solid var(--erp-border) !important;
}

.activity-item-skeleton {
  padding: 12px;
  border: 1px solid var(--erp-border) !important;
  border-radius: 8px;
  background: var(--erp-surface) !important;
}

.skeleton-text,
.skeleton-chip,
.skeleton-avatar {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark-theme .skeleton-text,
.dark-theme .skeleton-chip,
.dark-theme .skeleton-avatar {
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
