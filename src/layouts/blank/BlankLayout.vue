// ===============================|| Blank Layout ||=============================== //
<template>
  <div :class="['blank-layout', { 'dark-theme': isDark }]">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  width: 100%;
  background: transparent !important;
  background-color: transparent !important;
}
</style>
