<script setup lang="ts">
import { useCustomizerStore } from '@/stores/customizer';

const customizer = useCustomizerStore();
</script>

<!------------------------------------->
<!-- AI Assistant Coming Soon Panel  -->
<!------------------------------------->
<template>
  <v-navigation-drawer
    app
    temporary
    elevation="10"
    location="right"
    v-model="customizer.Customizer_drawer"
    width="360"
    :style="{ background: 'var(--erp-sidebar-bg)', color: 'var(--erp-text)', zIndex: 9999 }"
  >
    <div class="pa-6" :style="{ borderBottom: '1px solid var(--erp-border)' }">
      <div class="d-flex justify-space-between align-center">
        <div class="text-subtitle-1 font-weight-medium">AI Assistant</div>
        <v-btn
          variant="text"
          icon
          density="compact"
          class="erp-icon-btn"
          @click.stop="customizer.SET_CUSTOMIZER_DRAWER(!customizer.Customizer_drawer)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="pa-6">
      <div class="text-center mb-6">
        <v-avatar size="72" :style="{ background: 'var(--erp-accent-indigo)' }">
          <span class="text-h4" style="color: #fff">🤖</span>
        </v-avatar>
      </div>
      <h3 class="text-h5 text-center mb-2">Coming Soon</h3>
      <p class="text-body-2 text-medium-emphasis text-center mb-6">
        An AI-powered assistant is on the way to help you navigate, summarize data,
        and automate routine actions across your workspace.
      </p>
      <v-divider class="mb-6"></v-divider>
      <div class="mb-4">
        <div class="d-flex align-center mb-3">
          <v-avatar size="28" class="mr-3" :style="{ background: 'var(--erp-surface)' }">
            <v-icon size="18">mdi-lightbulb-on</v-icon>
          </v-avatar>
          <span class="text-body-2">Context-aware suggestions</span>
        </div>
        <div class="d-flex align-center mb-3">
          <v-avatar size="28" class="mr-3" :style="{ background: 'var(--erp-surface)' }">
            <v-icon size="18">mdi-robot</v-icon>
          </v-avatar>
          <span class="text-body-2">Quick actions & automation</span>
        </div>
        <div class="d-flex align-center">
          <v-avatar size="28" class="mr-3" :style="{ background: 'var(--erp-surface)' }">
            <v-icon size="18">mdi-shield-check</v-icon>
          </v-avatar>
          <span class="text-body-2">Your data stays private</span>
        </div>
      </div>
      <v-alert type="info" variant="tonal" :style="{ background: 'var(--erp-surface)' }">
        Beta access will roll out soon. Stay tuned!
      </v-alert>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
/* Ensure customizer panel has the highest z-index */
.v-navigation-drawer {
  z-index: 9999 !important;
}
</style>
