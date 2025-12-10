<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import LogoDark from './LogoDark.vue';

const { isDark } = useTheme();
</script>

<template>
  <div :class="{ 'dark-theme': isDark }">
    <LogoDark />
  </div>
</template>
