<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

interface Props {
  item?: any;
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  item: undefined,
  level: 0
});

const { isDark } = useTheme();
</script>

<template>
  <div :class="{ 'dark-theme': isDark }" class="icon-wrapper">
    <template v-if="props.level && props.level > 0">
      <component :is="props.item" size="18" fill="none" stroke="currentColor" stroke-width="1.5" class="iconClass"></component>
    </template>
    <template v-else>
      <component :is="props.item" size="20" fill="none" stroke="currentColor" stroke-width="1.5" class="iconClass"></component>
    </template>
  </div>
</template>
