<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

interface NavGroupItem {
  header?: string;
}

interface Props {
  item?: NavGroupItem;
}

const props = withDefaults(defineProps<Props>(), {
  item: undefined
});

const { isDark } = useTheme();
</script>

<template>
  <v-list-subheader 
    color="darkText" 
    class="smallCap sidebar-header"
    :class="{ 'dark-theme': isDark }"
    :style="{ 
      backgroundColor: 'transparent !important',
      color: 'var(--erp-text)',
      opacity: 0.8
    }"
  >
    {{ props.item?.header }}
  </v-list-subheader>
</template>
