<template>
  <div class="analytics-tab">
    <div class="tab-sections">
      <div
        v-for="section in sections"
        :key="section.id"
        class="section-container"
      >
        <!-- Section Header -->
        <div
          class="section-header"
          :class="{ 'section-header-collapsed': !isSectionOpen(section.id) }"
          @click="toggleSection(section.id)"
        >
          <div class="section-title-group">
            <div class="section-title">
              <v-icon
                :icon="getSectionIcon(section.id)"
                size="20"
                class="me-3"
                :color="getSectionColor(section.id)"
              />
              <span class="title-text">{{ section.title }}</span>
              <v-chip
                v-if="section.priority"
                :color="getPriorityColor(section.priority)"
                size="x-small"
                variant="tonal"
                class="ms-2"
              >
                {{ section.priority }}
              </v-chip>
            </div>
            <div class="section-description">
              {{ section.description }}
            </div>
          </div>
          
          <div class="section-actions">
            <v-btn
              v-if="isSectionOpen(section.id)"
              icon
              variant="text"
              size="small"
              @click.stop="refreshSection(section.id)"
              :loading="isSectionLoading(section.id)"
            >
              <v-icon size="16" icon="mdi-refresh" />
            </v-btn>
            
            <v-btn
              icon
              variant="text"
              size="small"
              @click.stop="toggleSection(section.id)"
            >
              <v-icon size="16">
                {{ isSectionOpen(section.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Section Content -->
        <v-expand-transition>
          <div v-if="isSectionOpen(section.id)" class="section-content">
            <div class="section-wrapper">
              <!-- Dynamic component rendering -->
              <component
                :is="section.component"
                :data="getSectionData(section.id)"
                :loading="isSectionLoading(section.id)"
                @refresh="() => refreshSection(section.id)"
                @export="(data: any) => handleSectionExport(section.id, data)"
              />
            </div>
          </div>
        </v-expand-transition>
      </div>
    </div>

    <!-- Empty state for tab with no sections -->
    <div v-if="!sections.length" class="empty-tab">
      <v-icon size="64" color="grey-lighten-2" icon="mdi-chart-line-variant" />
      <h3 class="text-h6 text-grey-darken-1 mt-4">No sections available</h3>
      <p class="text-body-2 text-grey">This tab doesn't have any analytics sections configured yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNextAuth } from '@/composables/useNextAuth';

// Import all analytics components
import AnalyticsOverview from './components/AnalyticsOverview.vue';
import ProjectPerformance from './components/ProjectPerformance.vue';
import TeamAnalytics from './components/TeamAnalytics.vue';
import DepartmentEfficiency from './components/DepartmentEfficiency.vue';
import ResourceUtilization from './components/ResourceUtilization.vue';
import WorkloadDistribution from './components/WorkloadDistribution.vue';
import TrendsAnalysis from './components/TrendsAnalysis.vue';
import PredictionsForecast from './components/PredictionsForecast.vue';
import BenchmarksComparison from './components/BenchmarksComparison.vue';
import QualityMetrics from './components/QualityMetrics.vue';
import UserPerformance from './components/UserPerformance.vue';
import UserDashboard from './components/UserDashboard.vue';
import ActivityFeed from './components/ActivityFeed.vue';
import AlertsPanel from './components/AlertsPanel.vue';
import CustomReports from './components/CustomReports.vue';
import AnalyticsSettings from './components/AnalyticsSettings.vue';
import WidgetConfiguration from './components/WidgetConfiguration.vue';
import CacheStatus from './components/CacheStatus.vue';
import DataFreshness from './components/DataFreshness.vue';
import LiveDashboard from './components/LiveDashboard.vue';
import TimelineAnalysis from './components/TimelineAnalysis.vue';
import CollaborationMetrics from './components/CollaborationMetrics.vue';

const { user } = useNextAuth();

interface Section {
  id: string;
  title: string;
  description: string;
  component: string;
  defaultOpen: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  sections: Section[];
  globalFilters: {
    dateRange: string;
    granularity: string;
    projectId: string | null;
  };
}

const props = defineProps<Props>();

interface Emits {
  (e: 'section-toggle', sectionId: string, isOpen: boolean): void;
  (e: 'refresh-section', sectionId: string): void;
}

const emit = defineEmits<Emits>();

// Section states
const sectionStates = ref<Record<string, boolean>>({});
const sectionLoading = ref<Record<string, boolean>>({});
const sectionData = ref<Record<string, any>>({});

// Component mapping
const componentMap = {
  'AnalyticsOverview': AnalyticsOverview,
  'ProjectPerformance': ProjectPerformance,
  'TeamAnalytics': TeamAnalytics,
  'DepartmentEfficiency': DepartmentEfficiency,
  'ResourceUtilization': ResourceUtilization,
  'WorkloadDistribution': WorkloadDistribution,
  'TrendsAnalysis': TrendsAnalysis,
  'PredictionsForecast': PredictionsForecast,
  'BenchmarksComparison': BenchmarksComparison,
  'QualityMetrics': QualityMetrics,
  'UserPerformance': UserPerformance,
  'UserDashboard': UserDashboard,
  'ActivityFeed': ActivityFeed,
  'AlertsPanel': AlertsPanel,
  'CustomReports': CustomReports,
  'AnalyticsSettings': AnalyticsSettings,
  'WidgetConfiguration': WidgetConfiguration,
  'CacheStatus': CacheStatus,
  'DataFreshness': DataFreshness,
  'LiveDashboard': LiveDashboard,
  'TimelineAnalysis': TimelineAnalysis,
  'CollaborationMetrics': CollaborationMetrics
};

// Methods
const isSectionOpen = (sectionId: string): boolean => {
  return sectionStates.value[sectionId] ?? false;
};

const isSectionLoading = (sectionId: string): boolean => {
  return sectionLoading.value[sectionId] ?? false;
};

const toggleSection = (sectionId: string) => {
  const isOpen = !isSectionOpen(sectionId);
  sectionStates.value[sectionId] = isOpen;
  
  emit('section-toggle', sectionId, isOpen);
  
  // Load data when section is opened
  if (isOpen && !sectionData.value[sectionId]) {
    loadSectionData(sectionId);
  }
};

const refreshSection = (sectionId: string) => {
  sectionLoading.value[sectionId] = true;
  emit('refresh-section', sectionId);
  
  // Simulate loading delay
  setTimeout(() => {
    sectionLoading.value[sectionId] = false;
  }, 1000);
};

const loadSectionData = async (sectionId: string) => {
  sectionLoading.value[sectionId] = true;
  
  try {
    // Load data for the specific section
    // This would integrate with the existing analytics API calls
    console.log(`Loading data for section: ${sectionId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data for demonstration
    sectionData.value[sectionId] = {
      id: sectionId,
      loadedAt: new Date().toISOString(),
      filters: props.globalFilters
    };
  } catch (error) {
    console.error(`Failed to load data for section ${sectionId}:`, error);
  } finally {
    sectionLoading.value[sectionId] = false;
  }
};

const getSectionData = (sectionId: string) => {
  return sectionData.value[sectionId] || null;
};

const handleSectionExport = (sectionId: string, data: any) => {
  console.log(`Export requested for section ${sectionId}:`, data);
};

// Section icons and colors
const getSectionIcon = (sectionId: string): string => {
  const iconMap: Record<string, string> = {
    'dashboard-overview': 'mdi-view-dashboard',
    'all-projects-performance': 'mdi-folder-multiple',
    'live-snapshot': 'mdi-pulse',
    'project-performance': 'mdi-chart-line',
    'timeline-analysis': 'mdi-timeline-clock',
    'benchmarks': 'mdi-target',
    'team-performance': 'mdi-account-group',
    'workload-distribution': 'mdi-scale-unbalanced',
    'collaboration-metrics': 'mdi-account-multiple',
    'department-efficiency': 'mdi-domain',
    'resource-utilization': 'mdi-cog',
    'trends-analysis': 'mdi-trending-up',
    'predictions-forecast': 'mdi-crystal-ball',
    'quality-metrics': 'mdi-check-circle',
    'my-performance': 'mdi-account-star',
    'my-dashboard': 'mdi-view-dashboard-variant',
    'activity-feed': 'mdi-history',
    'active-alerts': 'mdi-bell-alert',
    'custom-reports': 'mdi-file-document',
    'analytics-settings': 'mdi-cog',
    'widget-configuration': 'mdi-view-dashboard-variant',
    'cache-status': 'mdi-database',
    'data-freshness': 'mdi-database-sync'
  };
  return iconMap[sectionId] || 'mdi-chart-box';
};

const getSectionColor = (sectionId: string): string => {
  const colorMap: Record<string, string> = {
    'dashboard-overview': 'primary',
    'all-projects-performance': 'success',
    'live-snapshot': 'info',
    'project-performance': 'primary',
    'timeline-analysis': 'warning',
    'benchmarks': 'secondary',
    'team-performance': 'info',
    'workload-distribution': 'warning',
    'collaboration-metrics': 'success',
    'department-efficiency': 'primary',
    'resource-utilization': 'info',
    'trends-analysis': 'primary',
    'predictions-forecast': 'secondary',
    'quality-metrics': 'success',
    'my-performance': 'primary',
    'my-dashboard': 'info',
    'activity-feed': 'warning',
    'active-alerts': 'error',
    'custom-reports': 'secondary',
    'analytics-settings': 'grey',
    'widget-configuration': 'info',
    'cache-status': 'success',
    'data-freshness': 'warning'
  };
  return colorMap[sectionId] || 'primary';
};

const getPriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    'high': 'error',
    'medium': 'warning',
    'low': 'info'
  };
  return colorMap[priority] || 'grey';
};

// Initialize sections
const initializeSections = () => {
  props.sections.forEach(section => {
    // Load saved state or use default
    const savedState = localStorage.getItem(`analytics-section-${section.id}`);
    const isOpen = savedState ? savedState === 'true' : section.defaultOpen;
    
    sectionStates.value[section.id] = isOpen;
    
    // Load data for default open sections
    if (isOpen) {
      loadSectionData(section.id);
    }
  });
};

// Watch for filter changes to refresh open sections
const refreshOpenSections = () => {
  props.sections.forEach(section => {
    if (isSectionOpen(section.id)) {
      refreshSection(section.id);
    }
  });
};

// Lifecycle
onMounted(() => {
  initializeSections();
});

// Watch for global filter changes
import { watch } from 'vue';
watch(() => props.globalFilters, () => {
  refreshOpenSections();
}, { deep: true });
</script>

<style scoped>
.analytics-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-height: 400px;
}

.tab-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s ease;
}

.section-container:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.section-header:hover {
  background: rgba(248, 250, 252, 0.5);
}

.section-header-collapsed {
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.section-title-group {
  flex: 1;
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.title-text {
  flex: 1;
  min-width: 0;
}

.section-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.section-content {
  border-top: 1px solid rgba(226, 232, 240, 0.3);
}

.section-wrapper {
  padding: 0;
}

.empty-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Responsive design */
@media (max-width: 768px) {
  .analytics-tab {
    padding: 0.5rem;
  }
  
  .section-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .section-actions {
    align-self: flex-end;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .section-description {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .title-text {
    margin-bottom: 0;
  }
}
</style>
