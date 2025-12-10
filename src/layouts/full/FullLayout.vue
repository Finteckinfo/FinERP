<script setup lang="ts">
import { RouterView } from 'vue-router';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/CustomizerPanel.vue';
import FooterPanel from './footer/FooterPanel.vue';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { useCustomizerStore } from '../../stores/customizer';
const customizer = useCustomizerStore();
</script>

<template>
  <v-locale-provider>
    <v-app
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '']"
      :style="{ backgroundColor: 'var(--erp-header-bg)' }"
    >
      <Customizer />
      <VerticalSidebarVue />
      <VerticalHeaderVue />

      <v-main>
        <v-container fluid class="page-wrapper" :style="{ backgroundColor: 'var(--erp-page-bg)', position: 'relative' }">
          <!-- Interactive Grid Pattern Background -->
          <InteractiveGridPattern
            :square-size="50"
            :stroke-width="1"
            stroke-color="rgba(148, 163, 184, 0.1)"
            :interactive="true"
            active-color="rgba(59, 130, 246, 0.3)"
            :duration="400"
            :max-opacity="0.4"
          />
          
          <div class="page-content-wrapper">
            <v-card 
              class="page-content-card" 
              elevation="0" 
              :style="{ 
                backgroundColor: 'var(--erp-sidebar-bg)',
                border: '1px solid var(--erp-border)'
              }"
            >
              <RouterView />
            </v-card>
            <v-btn
              class="customizer-btn"
              size="large"
              icon
              variant="flat"
              :color="'var(--erp-accent-indigo)'"
              @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
              style="z-index: 9998;"
            >
              <SettingsIcon class="icon" />
            </v-btn>
          </div>
        </v-container>
       
          <div>
            <FooterPanel />
          </div>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  overflow: hidden;
}

.page-content-wrapper {
  position: relative;
  min-height: calc(100vh - 200px); /* Account for header and footer */
  z-index: 1;
}

.page-content-card {
  margin: 24px;
  border-radius: 16px;
  padding: 24px;
  min-height: calc(100vh - 280px); /* Account for margins and padding */
  position: relative;
  z-index: 2;
  backdrop-filter: blur(8px);
  background-color: rgba(var(--erp-sidebar-bg-rgb), 0.95) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-content-card {
    margin: 16px;
    padding: 16px;
  }
}
</style>
