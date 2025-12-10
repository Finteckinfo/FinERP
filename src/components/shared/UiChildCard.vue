<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const props = defineProps({
  title: String
});

const { isDark } = useTheme();
</script>

<template>
  <v-card 
    variant="outlined" 
    :class="{ 'dark-theme': isDark }"
    class="theme-aware-card"
  >
    <v-card-item class="py-3">
      <v-card-title class="text-h5">{{ props.title }}</v-card-title>
    </v-card-item>
    <v-divider />
    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>
