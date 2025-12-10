<script setup lang="ts">
import { computed } from 'vue';
import { FolderIcon, UsersIcon, CheckIcon, ClockIcon } from 'vue-tabler-icons';
import { useTheme } from '@/composables/useTheme';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  totalDepartments: number;
}

interface Props {
  stats: ProjectStats;
}

const props = defineProps<Props>();
const { isDark } = useTheme();

const completionRate = computed(() => {
  if (props.stats.totalTasks === 0) return 0;
  return Math.round((props.stats.completedTasks / props.stats.totalTasks) * 100);
});

const activeRate = computed(() => {
  if (props.stats.totalProjects === 0) return 0;
  return Math.round((props.stats.activeProjects / props.stats.totalProjects) * 100);
});
</script>

<template>
  <v-card 
    elevation="0" 
    :class="{ 'dark-theme': isDark }"
    :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)', border: '1px solid var(--erp-border)' }"
  >
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h3 class="text-h4 font-weight-medium">Project Overview</h3>
        <v-avatar size="50" :style="{ background: 'var(--erp-accent-indigo)', color: '#fff' }">
          <FolderIcon size="24" />
        </v-avatar>
      </div>

      <v-row>
        <!-- Total Projects -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 rounded-lg" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" :style="{ background: 'var(--erp-accent-indigo)', color: '#fff' }">
                <FolderIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold mb-1" :style="{ color: 'var(--erp-accent-indigo)' }">{{ stats.totalProjects }}</h4>
            <p class="text-body-2 text-medium-emphasis">Total Projects</p>
            <v-chip 
              size="small" 
              variant="tonal"
              class="mt-2"
              :style="{ background: 'color-mix(in srgb, var(--erp-accent-green) 20%, transparent)', color: 'var(--erp-text)' }"
            >
              {{ activeRate }}% Active
            </v-chip>
          </div>
        </v-col>

        <!-- Active Projects -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 rounded-lg" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" :style="{ background: 'var(--erp-accent-green)', color: '#fff' }">
                <CheckIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold mb-1" :style="{ color: 'var(--erp-accent-green)' }">{{ stats.activeProjects }}</h4>
            <p class="text-body-2 text-medium-emphasis">Active Projects</p>
            <v-chip 
              size="small" 
              variant="tonal"
              class="mt-2"
              :style="{ background: 'color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent)', color: 'var(--erp-text)' }"
            >
              {{ stats.completedProjects }} Completed
            </v-chip>
          </div>
        </v-col>

        <!-- Total Tasks -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 rounded-lg" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" :style="{ background: 'var(--erp-accent-indigo)', color: '#fff' }">
                <ClockIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold mb-1" :style="{ color: 'var(--erp-accent-indigo)' }">{{ stats.totalTasks }}</h4>
            <p class="text-body-2 text-medium-emphasis">Total Tasks</p>
            <v-chip 
              size="small" 
              variant="tonal"
              class="mt-2"
              :style="{ background: 'color-mix(in srgb, var(--erp-accent-green) 20%, transparent)', color: 'var(--erp-text)' }"
            >
              {{ completionRate }}% Done
            </v-chip>
          </div>
        </v-col>

        <!-- Team Members -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 rounded-lg" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" :style="{ background: 'var(--erp-accent-green)', color: '#fff' }">
                <UsersIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold mb-1" :style="{ color: 'var(--erp-accent-green)' }">{{ stats.teamMembers }}</h4>
            <p class="text-body-2 text-medium-emphasis">Team Members</p>
            <v-chip 
              size="small" 
              variant="tonal"
              class="mt-2"
              :style="{ background: 'color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent)', color: 'var(--erp-text)' }"
            >
              {{ stats.totalDepartments }} Depts
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Progress Summary -->
      <div class="mt-6 pa-4 rounded-lg" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
        <h6 class="text-h6 font-weight-medium mb-3">Overall Progress</h6>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-body-2">Task Completion</span>
          <span class="text-body-2 font-weight-medium">{{ completionRate }}%</span>
        </div>
        <v-progress-linear
          :model-value="completionRate"
          height="8"
          rounded
          :class="{ 'task-completion-progress': isDark }"
          class="mb-3"
        ></v-progress-linear>
        
        <div class="d-flex align-center justify-space-between">
          <span class="text-body-2">Project Activity</span>
          <span class="text-body-2 font-weight-medium">{{ activeRate }}%</span>
        </div>
        <v-progress-linear
          :model-value="activeRate"
          height="8"
          rounded
          :class="{ 'project-activity-progress': isDark }"
        ></v-progress-linear>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
/* Progress bar styling using theme variables */
.task-completion-progress :deep(.v-progress-linear__determinate) {
  background-color: var(--erp-accent-green, #5BC85B) !important;
}

.project-activity-progress :deep(.v-progress-linear__determinate) {
  background-color: var(--erp-accent-indigo, #615fff) !important;
}

/* Ensure the progress bars have proper styling in dark mode */
.dark-theme .task-completion-progress :deep(.v-progress-linear__determinate) {
  background-color: var(--erp-accent-green, #5BC85B) !important;
}

.dark-theme .project-activity-progress :deep(.v-progress-linear__determinate) {
  background-color: var(--erp-accent-indigo, #615fff) !important;
}
</style>
