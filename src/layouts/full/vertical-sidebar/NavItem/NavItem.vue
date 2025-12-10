<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import Icon from '../IconSet.vue';

interface NavItem {
  title?: string;
  icon?: any;
  subCaption?: string;
  to?: string;
  type?: string;
  disabled?: boolean;
  chip?: string;
  chipColor?: string;
  chipIcon?: string;
  chipVariant?: string;
}

interface Props {
  item?: NavItem;
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  item: undefined,
  level: 0
});

const { isDark } = useTheme();
</script>

<template>
  <!---Single Item-->
  <v-list-item
    :to="item?.type === 'external' ? '' : item?.to"
    :href="item?.type === 'external' ? item?.to : ''"
    rounded
    class="mb-1 erp-hover erp-item"
    active-class="erp-item--active"
    :disabled="item?.disabled"
    :target="item?.type === 'external' ? '_blank' : ''"
    :class="{ 'dark-theme': isDark }"
    :style="{ color: 'var(--erp-text)' }"
  >
    <!---If icon-->
    <template v-slot:prepend>
      <Icon :item="item?.icon" :level="level" />
    </template>
    <v-list-item-title>{{ item?.title }}</v-list-item-title>
    <!---If Caption-->
    <v-list-item-subtitle v-if="item?.subCaption" class="text-caption mt-n1 hide-menu">
      {{ item.subCaption }}
    </v-list-item-subtitle>
    <!---If any chip or label-->
    <template v-slot:append v-if="item?.chip">
      <v-chip
        :color="item.chipColor"
        class="sidebarchip hide-menu"
        :size="item.chipIcon ? 'small' : 'default'"
        :variant="(item.chipVariant as 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain') || 'flat'"
        :prepend-icon="item.chipIcon"
      >
        {{ item.chip }}
      </v-chip>
    </template>
  </v-list-item>
</template>
