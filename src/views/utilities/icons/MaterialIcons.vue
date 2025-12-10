<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: 'Material Icons' });
const breadcrumbs = ref([
  {
    title: 'Icons',
    disabled: false,
    href: '#'
  },
  {
    title: 'Material Icons',
    disabled: true,
    href: '#'
  }
]);
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="Material Icons">
        <iframe src="https://materialdesignicons.com/" frameborder="0" width="100%" height="1000" title="Material Icons Reference"></iframe>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
