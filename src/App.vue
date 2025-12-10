<template>
  <v-app :class="{ 'dark-theme': isDark }">
    <v-main>
      <RouterView></RouterView>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import { useSSOWallet } from '@/composables/useSSOWallet';

const { isDark } = useTheme();

// Auto-connect wallet from SSO session
useSSOWallet();
</script>

<style>
.v-application {
  background-color: var(--theme-page-bg) !important;
  color: var(--theme-text-color) !important;
}

.v-main {
  background-color: transparent !important;
}
</style>
