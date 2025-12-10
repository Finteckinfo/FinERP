<template>
  <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
    <h4 class="text-subtitle-1 font-weight-medium mb-3">{{ title }}</h4>
    <div class="d-flex flex-column gap-2">
      <v-btn 
        v-for="action in actions" 
        :key="action.key"
        :color="action.color" 
        variant="outlined" 
        size="small"
        @click="$emit('action-click', action.key)"
      >
        <v-icon class="mr-2">{{ action.icon }}</v-icon>
        {{ action.label }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
interface ActionItem {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface Props {
  title?: string;
  actions: ActionItem[];
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Quick Actions'
});

const emit = defineEmits<{
  'action-click': [actionKey: string];
}>();
</script>

<style scoped>
.border {
  border: 1px solid var(--erp-border);
}
</style>
