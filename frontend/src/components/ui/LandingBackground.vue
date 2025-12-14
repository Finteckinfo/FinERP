<template>
  <div :class="['landing-page', { 'dark-theme': isDark }]">
    <div v-if="showThemeToggle" class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>

    <div class="landing-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';

const props = withDefaults(defineProps<{ showThemeToggle?: boolean }>(), {
  showThemeToggle: true,
});

const { isDark } = useTheme();
const showThemeToggle = computed(() => props.showThemeToggle);
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  position: relative;
  background-color: var(--erp-page-bg);
  color: var(--erp-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.landing-page.dark-theme {
  background-color: var(--erp-page-bg);
  color: var(--erp-text);
}

.theme-toggle-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
}

@media (max-width: 768px) {
  .theme-toggle-container {
    top: 16px;
    right: 16px;
  }
}

.landing-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

