<template>
  <div 
    class="logo"
    :class="{ 'dark-theme': isDark }"
  >
    <RouterLink to="/dashboard">
      <img src="/images/banner3.png" alt="FinERP Logo" width="92" height="76" class="logo-img" />
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.logo-img {
  object-fit: contain;
}
</style>
