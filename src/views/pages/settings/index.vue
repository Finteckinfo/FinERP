<template>
  <div class="settings-page">
    <SettingsTabs />
  </div>
</template>

<script setup lang="ts">
import SettingsTabs from './SettingsTabs.vue';
</script>

<style scoped>
.settings-page {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
}
</style>

