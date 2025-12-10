<template>
  <v-app-bar elevation="0" class="px-6 border-b erp-header">
    <!-- Back Button -->
    <div class="d-flex align-center">
      <v-btn icon @click="goBack" class="mr-4">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      
      <!-- Project Info -->
      <div class="d-flex align-center">
        <v-icon :color="'var(--erp-accent-green)'" class="mr-2">mdi-lock</v-icon>
        <h1 class="text-h5 font-weight-bold" :style="{ color: 'var(--erp-text)' }">{{ projectName }}</h1>
        <v-chip 
          v-if="status"
          :color="getStatusColor(status)" 
          size="small" 
          class="ml-3"
        >
          {{ status }}
        </v-chip>
      </div>
    </div>
    
    <!-- Team Members -->
    <div v-if="showTeamMembers" class="d-flex align-center mr-6">
      <div class="d-flex align-center mr-4">
        <div class="user-avatars">
          <v-avatar 
            v-for="(member, index) in teamMembers" 
            :key="index"
            size="32" 
            :color="getAvatarColor(member.color)"
            class="mr-n2"
          >
            <v-icon color="white" size="20">mdi-account</v-icon>
          </v-avatar>
        </div>
        <v-btn variant="outlined" size="small" class="ml-4">
          <v-icon class="mr-2">mdi-account-plus</v-icon>
          Invite
        </v-btn>
      </div>
    </div>
    
    <v-spacer />
    
    <!-- Actions -->
    <div class="d-flex align-center">
      <v-btn icon class="mr-2">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <v-btn icon class="mr-2">
        <v-icon>mdi-filter-variant</v-icon>
      </v-btn>
      <v-btn icon class="mr-4">
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-text-field
        :placeholder="searchPlaceholder"
        variant="outlined"
        density="compact"
        hide-details
        class="search-field"
        prepend-inner-icon="mdi-magnify"
        v-model="searchQuery"
        @input="$emit('search', searchQuery)"
      />
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

interface TeamMember {
  color: string;
  name?: string;
}

interface Props {
  projectName: string;
  status?: string;
  teamMembers?: TeamMember[];
  showTeamMembers?: boolean;
  searchPlaceholder?: string;
  backRoute?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showTeamMembers: true,
  searchPlaceholder: 'Search...',
  backRoute: '/dashboard/default'
});

const emit = defineEmits<{
  search: [query: string];
}>();

const router = useRouter();
const searchQuery = ref('');

const goBack = () => {
  router.push(props.backRoute);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'TODO': return 'grey';
    case 'IN_PROGRESS': return 'warning';
    case 'REVIEW': return 'info';
    case 'DONE': return 'success';
    case 'REWORK': return 'error';
    default: return 'primary';
  }
};

const getAvatarColor = (color: string) => {
  const colorMap: Record<string, string> = {
    'red': 'red',
    'purple': 'purple',
    'blue': 'blue',
    'green': 'green',
    'orange': 'orange',
    'black': 'grey-darken-2'
  };
  return colorMap[color] || 'grey';
};
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid var(--erp-border);
}

.search-field {
  max-width: 300px;
}

.user-avatars {
  display: flex;
  align-items: center;
}
</style>
