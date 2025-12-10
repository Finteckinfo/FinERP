<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import NavItem from '../NavItem/NavItem.vue';
import Icon from '../IconSet.vue';

interface NavItem {
  title?: string;
  icon?: any;
  subCaption?: string;
  children?: NavItem[];
  to?: string;
  type?: string;
  disabled?: boolean;
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
  <!-- ---------------------------------------------- -->
  <!---Item Childern -->
  <!-- ---------------------------------------------- -->
  <v-list-group 
    no-action
    :class="{ 'dark-theme': isDark }"
  >
    <!-- ---------------------------------------------- -->
    <!---Dropdown  -->
    <!-- ---------------------------------------------- -->
    <template v-slot:activator="{ props: activatorProps }">
      <v-list-item v-bind="activatorProps" :value="item?.title" rounded class="mb-1 erp-hover" :style="{ color: 'var(--erp-text)' }">
        <!---Icon  -->
        <template v-slot:prepend>
          <Icon :item="item?.icon" :level="level" />
        </template>
        <!---Title  -->
        <v-list-item-title class="mr-auto">{{ item?.title }}</v-list-item-title>
        <!---If Caption-->
        <v-list-item-subtitle v-if="item?.subCaption" class="text-caption mt-n1 hide-menu">
          {{ item.subCaption }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <!-- ---------------------------------------------- -->
    <!---Sub Item-->
    <!-- ---------------------------------------------- -->
    <template v-for="(subitem, i) in item?.children" :key="i">
      <NavCollapse :item="subitem" v-if="subitem.children" :level="(level || 0) + 1" />
      <NavItem :item="subitem" :level="(level || 0) + 1" v-else></NavItem>
    </template>
  </v-list-group>

  <!-- ---------------------------------------------- -->
  <!---End Item Sub Header -->
  <!-- ---------------------------------------------- -->
</template>
