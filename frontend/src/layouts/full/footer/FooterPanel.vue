<script setup lang="ts">
import { shallowRef } from 'vue';
import { RouterLink } from 'vue-router';

const footerLink = shallowRef([
  { title: 'Home', url: '/' },
  { title: 'Documentation', url: '#!' },
  { title: 'Support', url: '#!' }
]);
</script>
<template>
  <v-footer
    class="px-0 footer"
    :style="{
      background: 'var(--erp-header-bg)',
      color: 'var(--erp-text)',
      borderTop: '1px solid var(--erp-border)',
      width: '100%',
      margin: '0',
      paddingLeft: '0',
      paddingRight: '0',
      borderRadius: '0'
    }"
  >
    <v-row justify="center" align="center" no-gutters style="width: 100%">
      <v-col cols="12" sm="6">
        <p class="text-body-1 mb-0 text-sm-left text-center">
          Built at <a href="https://siz.land" target="_blank" rel="noopener noreferrer" class="footer-link" style="text-decoration: none; color: var(--erp-accent-indigo);">Siz.land</a>
        </p>
      </v-col>
      <v-col class="text-sm-right text-center" cols="12" sm="6">
        <RouterLink
          v-for="(item, i) in footerLink"
          :key="i"
          class="mx-2 text-body-1 text-decoration-none cursor-pointer footer-link"
          :to="item.url"
          :style="{ color: 'var(--erp-text)' }"
        >
          {{ item.title }}
        </RouterLink>
      </v-col>
    </v-row>
  </v-footer>
</template>

<style lang="scss">
.v-footer {
  position: unset;
}
.footer-link:hover {
  color: var(--erp-accent-indigo) !important;
}
</style>
