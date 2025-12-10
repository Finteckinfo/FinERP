<template>
  <div :class="{ 'dark-theme': isDark }">
    <AuthGuard>
      <CreateProject />
    </AuthGuard>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import AuthGuard from '@/components/shared/AuthGuard.vue';
import CreateProject from './CreateProject.vue';

const { isDark } = useTheme();
</script>
