<template>
  <v-card elevation="0" class="stats-skeleton" :class="{ 'dark-theme': isDark }">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div class="skeleton-text" style="width: 200px; height: 32px; border-radius: 4px;"></div>
        <div class="skeleton-chip" style="width: 100px; height: 32px; border-radius: 16px;"></div>
      </div>
      
      <!-- Stats grid skeleton -->
      <v-row>
        <v-col v-for="i in 4" :key="i" cols="12" sm="6" lg="3">
          <div class="stat-card-skeleton pa-4">
            <div class="d-flex align-center mb-3">
              <div class="skeleton-avatar" style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px;"></div>
              <div>
                <div class="skeleton-text mb-1" style="width: 80px; height: 20px; border-radius: 4px;"></div>
                <div class="skeleton-text" style="width: 60px; height: 16px; border-radius: 4px;"></div>
              </div>
            </div>
            <div class="skeleton-text mb-2" style="width: 60px; height: 32px; border-radius: 4px;"></div>
            <div class="skeleton-progress" style="width: 100%; height: 6px; border-radius: 3px;"></div>
          </div>
        </v-col>
      </v-row>
      
      <!-- Progress bars skeleton -->
      <v-row class="mt-6">
        <v-col cols="12" lg="6">
          <div class="mb-4">
            <div class="skeleton-text mb-2" style="width: 120px; height: 20px; border-radius: 4px;"></div>
            <div class="skeleton-progress" style="width: 100%; height: 12px; border-radius: 6px;"></div>
          </div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="mb-4">
            <div class="skeleton-text mb-2" style="width: 140px; height: 20px; border-radius: 4px;"></div>
            <div class="skeleton-progress" style="width: 100%; height: 12px; border-radius: 6px;"></div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.stats-skeleton {
  background: var(--erp-card-bg) !important;
  border: 1px solid var(--erp-border) !important;
}

.stat-card-skeleton {
  border: 1px solid var(--erp-border) !important;
  border-radius: 8px;
  background: var(--erp-surface) !important;
}

.skeleton-text,
.skeleton-chip,
.skeleton-progress,
.skeleton-avatar {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark-theme .skeleton-text,
.dark-theme .skeleton-chip,
.dark-theme .skeleton-progress,
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
