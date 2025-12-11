<script setup lang="ts">
import { RouterView } from 'vue-router';
import VerticalSidebarVue from './vertical-sidebar/VerticalSidebar.vue';
import VerticalHeaderVue from './vertical-header/VerticalHeader.vue';
import Customizer from './customizer/CustomizerPanel.vue';
import FooterPanel from './footer/FooterPanel.vue';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import { useCustomizerStore } from '../../stores/customizer';
import { SettingsIcon } from 'vue-tabler-icons';
import { useTheme } from '@/composables/useTheme';

const customizer = useCustomizerStore();
const { isDark } = useTheme();
</script>

<template>
  <v-locale-provider>
    <v-app
      :class="[customizer.fontTheme, customizer.mini_sidebar ? 'mini-sidebar' : '', customizer.inputBg ? 'inputWithbg' : '', { 'dark-theme': isDark }]"
      :style="{ backgroundColor: 'var(--erp-header-bg)' }"
    >
      <Customizer />
      <VerticalSidebarVue />
      <VerticalHeaderVue />

      <v-main>
        <v-container fluid class="page-wrapper" :style="{ backgroundColor: 'transparent', position: 'relative' }">
          <!-- Interactive Grid Pattern Background -->
          <InteractiveGridPattern
            v-if="!isDark"
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
                backgroundColor: isDark ? 'rgba(26, 26, 26, 0.85)' : 'var(--erp-sidebar-bg)',
                border: isDark ? '1px solid rgba(91, 200, 91, 0.3)' : '1px solid var(--erp-border)',
                boxShadow: isDark ? 'var(--erp-shadow-lg), 0 0 30px rgba(91, 200, 91, 0.2)' : 'var(--erp-shadow-md)'
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
  overflow-x: hidden;
  min-height: 100vh;
  padding: 0 !important;
}

.page-content-wrapper {
  position: relative;
  min-height: calc(100vh - 200px);
  z-index: 1;
  width: 100%;
  max-width: 100%;
}

.page-content-card {
  margin: 24px;
  border-radius: 20px;
  padding: 24px;
  min-height: calc(100vh - 280px);
  position: relative;
  z-index: 2;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-content-card:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .page-content-card {
    margin: 20px;
    padding: 20px;
    border-radius: 16px;
  }
}

@media (max-width: 768px) {
  .page-content-card {
    margin: 12px;
    padding: 16px;
    border-radius: 12px;
    min-height: calc(100vh - 200px);
  }
  
  .page-content-wrapper {
    min-height: calc(100vh - 150px);
  }
}

@media (max-width: 480px) {
  .page-content-card {
    margin: 8px;
    padding: 12px;
    border-radius: 10px;
    min-height: calc(100vh - 180px);
  }
  
  .page-content-wrapper {
    min-height: calc(100vh - 120px);
  }
}

/* Glowing effect for customizer button */
.customizer-btn {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  box-shadow: 0 0 20px rgba(91, 200, 91, 0.4) !important;
  transition: all 0.3s ease;
}

.customizer-btn:hover {
  box-shadow: 0 0 30px rgba(91, 200, 91, 0.6), 0 0 50px rgba(91, 200, 91, 0.3) !important;
  transform: scale(1.1) rotate(90deg);
}

@media (max-width: 768px) {
  .customizer-btn {
    bottom: 16px;
    right: 16px;
    width: 48px !important;
    height: 48px !important;
  }
}
</style>
