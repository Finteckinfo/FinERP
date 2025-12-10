<script setup lang="ts">
import { shallowRef, onMounted } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import sidebarItems from './sidebarItem';

import Logo from '@/assets/images/logos/Logo.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import NavGroup from './NavGroup/NavGroup.vue';
import NavItem from './NavItem/NavItem.vue';

const customizer = useCustomizerStore();
const sidebarMenu = shallowRef(sidebarItems);

// Debug: Log CSS variables
onMounted(() => {
  console.log('Sidebar CSS Variables:');
  console.log('--erp-sidebar-bg:', getComputedStyle(document.documentElement).getPropertyValue('--erp-sidebar-bg'));
  console.log('--erp-text:', getComputedStyle(document.documentElement).getPropertyValue('--erp-text'));
});
</script>

<template>
  <v-navigation-drawer
    left
    v-model="customizer.Sidebar_drawer"
    elevation="0"
    rail-width="75"
    mobile-breakpoint="lg"
    app
    class="leftSidebar"
    :style="{ 
      backgroundColor: 'var(--erp-sidebar-bg)',
      color: 'var(--erp-text)'
    }"
    :rail="customizer.mini_sidebar"
    expand-on-hover
  >
    <!---Logo part -->

    <div class="pa-5">
      <Logo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4" :style="{ background: 'transparent' }">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header" :key="item.header" />
          <!---Item Divider -->
          <v-divider class="my-3" v-else-if="item.divider" :style="{ borderColor: 'var(--erp-border)' }" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children && item.title" />
          <!---Single Item-->
          <NavItem :item="item" v-else-if="item.title" class="leftPadding" />
          <!---End Single Item-->
        </template>
      </v-list>
      <div class="pa-4">
        <!-- <ExtraBox /> -->
      </div>
      <div class="pa-4 text-center">
        <v-chip size="small" :style="{ backgroundColor: 'var(--erp-surface)', color: 'var(--erp-text)' }"> v1.3.0 </v-chip>
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
