<script setup lang="ts">
import { computed } from 'vue';
import { CalendarIcon, UsersIcon, FolderIcon } from 'vue-tabler-icons';
import { type Project, type Task, type UserRole } from '@/services/projectApi';
import { useTheme } from '@/composables/useTheme';

interface ProjectCardData {
  project: Project;
  tasks: Task[];
  teamMembers: UserRole[];
}

interface Props {
  project: Project;
  tasks: Task[];
  teamMembers: UserRole[];
  userRole: string;
}

const props = defineProps<Props>();
const { isDark } = useTheme();

// Computed properties
const projectTypeColor = computed(() => {
  return props.project.type === 'PROGRESSIVE' ? 'success' : 'warning';
});

const roleColor = computed(() => {
  switch (props.userRole) {
    case 'PROJECT_OWNER':
      return 'primary';
    case 'PROJECT_MANAGER':
      return 'info';
    case 'EMPLOYEE':
      return 'secondary';
    case 'CLIENT':
      return 'secondary';
    default:
      return 'grey';
  }
});

const progressPercentage = computed(() => {
  const projectTasks = props.tasks.filter(task => task.departmentId === props.project.id);
  if (projectTasks.length === 0) return 0;
  
  const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED' || task.status === 'APPROVED');
  return Math.round((completedTasks.length / projectTasks.length) * 100);
});

const taskCount = computed(() => {
  return props.tasks.filter(task => task.departmentId === props.project.id).length;
});

const completedTasks = computed(() => {
  const projectTasks = props.tasks.filter(task => task.departmentId === props.project.id);
  return projectTasks.filter(task => task.status === 'COMPLETED' || task.status === 'APPROVED').length;
});

const departmentCount = computed(() => {
  // For now, return 1 as a default since departments are not directly linked in the current schema
  // In a real implementation, this would come from the project's departments
  return 1;
});

const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(dateObj);
};
</script>

<template>
  <v-card 
    elevation="2" 
    class="project-card h-100 cursor-pointer transition-all duration-300 hover:elevation-8"
    :class="{ 'dark-theme': isDark }"
    @click="$router.push(`/projects/${project.id}/workspace`)"
  >
    <v-card-text class="pa-6">
      <!-- Project Header -->
      <div class="d-flex align-start justify-space-between mb-4">
        <div class="d-flex align-center">
          <v-avatar 
            size="40" 
            :color="projectTypeColor" 
            class="mr-3"
          >
            <FolderIcon size="20" color="white" />
          </v-avatar>
          <div>
            <h5 class="text-h6 font-weight-medium mb-1">{{ project.name }}</h5>
            <v-chip 
              :color="projectTypeColor" 
              size="small" 
              variant="tonal"
              class="text-caption"
            >
              {{ project.type }}
            </v-chip>
          </div>
        </div>
        
        <!-- Role Badge -->
        <v-chip 
          :color="roleColor" 
          size="small" 
          variant="flat"
          class="text-caption font-weight-medium"
        >
          {{ props.userRole.replace('_', ' ') }}
        </v-chip>
      </div>

      <!-- Project Description -->
      <p v-if="project.description" class="text-body-2 text-medium-emphasis mb-4">
        {{ project.description }}
      </p>

      <!-- Project Stats -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="d-flex align-center">
          <UsersIcon size="16" class="mr-2 text-medium-emphasis" />
          <span class="text-caption text-medium-emphasis">{{ departmentCount }} depts</span>
        </div>
        <div class="d-flex align-center">
          <CalendarIcon size="16" class="mr-2 text-medium-emphasis" />
          <span class="text-caption text-medium-emphasis">{{ formatDate(project.createdAt) }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="mb-3">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption font-weight-medium">Progress</span>
          <span class="text-caption text-medium-emphasis">{{ progressPercentage }}%</span>
        </div>
        <v-progress-linear
          :model-value="progressPercentage"
          :color="projectTypeColor"
          height="6"
          rounded
        ></v-progress-linear>
      </div>

      <!-- Task Count -->
      <div class="d-flex align-center justify-space-between">
        <span class="text-caption text-medium-emphasis">
          {{ completedTasks }} of {{ taskCount }} tasks completed
        </span>
        <v-btn 
          size="small" 
          variant="text" 
          color="primary"
          class="text-caption"
        >
          View Details
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.project-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.project-card:hover {
  transform: translateY(-2px);
  border-color: rgb(var(--v-theme-primary));
}

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}

.hover\:elevation-8:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
