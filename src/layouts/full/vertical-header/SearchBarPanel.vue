<script setup>
import { SearchIcon, AdjustmentsHorizontalIcon, XIcon } from 'vue-tabler-icons';

const props = defineProps({
  closesearch: {
    type: Function,
    required: false
  }
});
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- searchbar -->
  <!-- ---------------------------------------------- -->
  <v-text-field persistent-placeholder placeholder="Search" variant="outlined" hide-details class="erp-dropdown-surface" :style="{ background: 'transparent' }">
    <template v-slot:prepend-inner>
      <SearchIcon stroke-width="1.5" size="17" />
    </template>
    <template v-slot:append-inner>
      <v-btn icon rounded="sm" variant="flat" size="small" class="erp-icon-btn SearchSetting">
        <AdjustmentsHorizontalIcon stroke-width="1.5" size="20" />
      </v-btn>
      <v-btn
        icon
        rounded="sm"
        variant="flat"
        size="small"
        class="SearchSetting ml-3 d-block d-lg-none erp-icon-btn"
        @click="props.closesearch"
      >
        <XIcon stroke-width="1.5" size="20" />
      </v-btn>
    </template>
  </v-text-field>
</template>
