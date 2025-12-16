<template>
  <div 
    class="logo"
    :class="{ 'dark-theme': isDark }"
  >
    <RouterLink to="/dashboard" class="logo-link">
      <span class="logo-text">FinPro</span>
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();
</script>

<style scoped>
.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--erp-accent-green) 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: var(--erp-accent-green);
  transition: all 0.3s ease;
}

.logo-link:hover .logo-text {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .logo-text {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1.125rem;
  }
}
</style>
