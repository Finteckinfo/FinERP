<template>
  <div class="analytics-tabs">
    <!-- Global Filters -->
    <div class="global-filters">
      <v-card class="filter-card" elevation="0">
        <v-card-text class="pa-4">
          <div class="filters-row">
            <div class="filter-group">
              <v-select
                v-model="globalFilters.dateRange"
                :items="dateRangeOptions"
                label="Date Range"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 120px"
                @update:model-value="onFiltersChange"
              />
            </div>
            
            <div class="filter-group">
              <v-select
                v-model="globalFilters.granularity"
                :items="granularityOptions"
                label="Granularity"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 120px"
                @update:model-value="onFiltersChange"
              />
            </div>
            
            <div class="filter-group">
              <v-select
                v-model="globalFilters.projectId"
                :items="projectOptions"
                label="Project"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                style="min-width: 150px"
                @update:model-value="onFiltersChange"
              />
            </div>
            
            <div class="filter-actions">
              <v-btn
                color="primary"
                variant="text"
                size="small"
                @click="refreshCurrentTab"
                :loading="isRefreshing"
              >
                <v-icon size="16" class="me-1" icon="mdi-refresh" />
                Refresh
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Tab Navigation -->
    <v-card class="tabs-card" elevation="0">
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="analytics-tabs-nav"
        @update:model-value="(value: unknown) => onTabChange(String(value))"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="tab-item"
        >
          <v-icon :icon="tab.icon" size="20" class="me-2" />
          {{ tab.label }}
          <v-chip
            v-if="tab.badge"
            :color="tab.badgeColor"
            size="x-small"
            class="ms-2"
          >
            {{ tab.badge }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-card-text class="tab-content pa-0">
        <v-window v-model="activeTab" class="analytics-window">
          <!-- Overview Tab -->
          <v-window-item value="overview">
            <div class="tab-content">
              <!-- Dashboard Overview -->
              <div class="section-container">
                <div class="section-header" @click="toggleSection('dashboard-overview')">
                  <div class="section-title-group">
                    <div class="section-title">
                      <v-icon icon="mdi-view-dashboard" size="20" class="me-3" color="primary" />
                      <span class="title-text">Dashboard Overview</span>
                      <v-chip color="error" size="x-small" variant="tonal" class="ms-2">high</v-chip>
                    </div>
                    <div class="section-description">Key performance indicators and summary metrics</div>
                  </div>
                  <div class="section-actions">
                    <v-btn icon variant="text" size="small" @click.stop="props.loadOverview" :loading="props.loading.overview">
                    <v-icon size="16" icon="mdi-refresh" />
                    </v-btn>
                    <v-btn icon variant="text" size="small">
                      <v-icon size="16">{{ isSectionOpen('dashboard-overview') ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                  </div>
                </div>
                <v-expand-transition>
                  <div v-if="isSectionOpen('dashboard-overview')" class="section-content">
                    <AnalyticsOverview 
                      v-if="!props.loading.overview"
                      :data="props.overviewData"
                      @refresh="props.loadOverview"
                    />
                    <AnalyticsSkeleton v-else type="overview" />
                  </div>
                </v-expand-transition>
              </div>

              <!-- All Projects Performance -->
              <div class="section-container">
                <div class="section-header" @click="toggleSection('all-projects-performance')">
                  <div class="section-title-group">
                    <div class="section-title">
                      <v-icon icon="mdi-folder-multiple" size="20" class="me-3" color="success" />
                      <span class="title-text">All Projects Performance</span>
                      <v-chip color="error" size="x-small" variant="tonal" class="ms-2">high</v-chip>
                    </div>
                    <div class="section-description">Aggregated performance metrics across all projects</div>
                  </div>
                  <div class="section-actions">
                    <v-btn icon variant="text" size="small" @click.stop="props.loadPerformance" :loading="props.loading.performance">
                    <v-icon size="16" icon="mdi-refresh" />
                    </v-btn>
                    <v-btn icon variant="text" size="small">
                      <v-icon size="16">{{ isSectionOpen('all-projects-performance') ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                  </div>
                </div>
                <v-expand-transition>
                  <div v-if="isSectionOpen('all-projects-performance')" class="section-content">
                    <ProjectPerformance 
                      v-if="!props.loading.performance"
                      :data="props.performanceData"
                      @refresh="props.loadPerformance"
                    />
                    <AnalyticsSkeleton v-else type="widget" />
                  </div>
                </v-expand-transition>
              </div>

              <!-- Live Snapshot -->
              <div class="section-container">
                <div class="section-header" @click="toggleSection('live-snapshot')">
                  <div class="section-title-group">
                    <div class="section-title">
                      <v-icon icon="mdi-pulse" size="20" class="me-3" color="info" />
                      <span class="title-text">Live Snapshot</span>
                      <v-chip color="warning" size="x-small" variant="tonal" class="ms-2">medium</v-chip>
                    </div>
                    <div class="section-description">Real-time project status and active tasks</div>
                  </div>
                  <div class="section-actions">
                    <v-btn icon variant="text" size="small" @click.stop="props.loadLive" :loading="props.loading.live">
                    <v-icon size="16" icon="mdi-refresh" />
                    </v-btn>
                    <v-btn icon variant="text" size="small">
                      <v-icon size="16">{{ isSectionOpen('live-snapshot') ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                  </div>
                </div>
                <v-expand-transition>
                  <div v-if="isSectionOpen('live-snapshot')" class="section-content">
                    <LiveDashboard 
                      v-if="!props.loading.live"
                      :data="props.liveData"
                      @refresh="props.loadLive"
                    />
                    <AnalyticsSkeleton v-else type="widget" />
                  </div>
                </v-expand-transition>
              </div>
            </div>
          </v-window-item>

          <!-- Projects Tab -->
          <v-window-item value="projects">
            <AnalyticsTab
              :sections="projectsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Teams Tab -->
          <v-window-item value="teams">
            <AnalyticsTab
              :sections="teamsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Departments Tab -->
          <v-window-item value="departments">
            <AnalyticsTab
              :sections="departmentsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Trends Tab -->
          <v-window-item value="trends">
            <AnalyticsTab
              :sections="trendsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Quality Tab -->
          <v-window-item value="quality">
            <AnalyticsTab
              :sections="qualitySections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- User Tab -->
          <v-window-item value="user">
            <AnalyticsTab
              :sections="userSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Reports Tab -->
          <v-window-item value="reports">
            <AnalyticsTab
              :sections="reportsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Settings Tab -->
          <v-window-item value="settings">
            <AnalyticsTab
              :sections="settingsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useNextAuth } from '@/composables/useNextAuth';

// Import all analytics components
import AnalyticsOverview from './components/AnalyticsOverview.vue';
import ProjectPerformance from './components/ProjectPerformance.vue';
import TeamAnalytics from './components/TeamAnalytics.vue';
import FinancialOverview from './components/FinancialOverview.vue';
import TimelineAnalysis from './components/TimelineAnalysis.vue';
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
import BottlenecksAnalysis from './components/BottlenecksAnalysis.vue';
import CollaborationMetrics from './components/CollaborationMetrics.vue';
import AnalyticsSkeleton from './components/AnalyticsSkeleton.vue';

const { user } = useNextAuth();

// Props from parent component
const props = defineProps<{
  overviewData: any;
  performanceData: any;
  teamData: any;
  financialData: any;
  timelineData: any;
  departmentData: any;
  resourceData: any;
  workloadData: any;
  trendsData: any;
  predictionsData: any;
  benchmarksData: any;
  liveData: any;
  activityData: any;
  alertsData: any;
  userPerformanceData: any;
  userDashboardData: any;
  bottlenecksData: any;
  qualityData: any;
  collaborationData: any;
  customReportData: any;
  configSettingsData: any;
  widgetConfigData: any;
  cacheStatusData: any;
  dataFreshnessData: any;
  loading: any;
  loadOverview: () => void;
  loadPerformance: () => void;
  loadTeam: () => void;
  loadFinancial: () => void;
  loadTimeline: () => void;
  loadDepartments: () => void;
  loadResources: () => void;
  loadWorkload: () => void;
  loadTrends: () => void;
  loadPredictions: () => void;
  loadBenchmarks: () => void;
  loadLive: () => void;
  loadActivity: () => void;
  loadAlerts: () => void;
  loadUserPerformance: () => void;
  loadUserDashboard: () => void;
  loadBottlenecks: () => void;
  loadQuality: () => void;
  loadCollaboration: () => void;
  loadCustomReport: () => void;
  handleExportReport: (data: any) => void;
  handleShareDashboard: (data: any) => void;
  loadConfigSettings: () => void;
  loadWidgetConfig: () => void;
  loadCacheStatus: () => void;
  loadDataFreshness: () => void;
}>();

// Global filters
const globalFilters = ref({
  dateRange: '30d',
  granularity: 'weekly',
  projectId: null as any
});

// Filter options
const dateRangeOptions = [
  { title: 'Last 7 days', value: '7d' },
  { title: 'Last 30 days', value: '30d' },
  { title: 'Last 90 days', value: '90d' },
  { title: 'Last year', value: '1y' }
];

const granularityOptions = [
  { title: 'Daily', value: 'daily' },
  { title: 'Weekly', value: 'weekly' },
  { title: 'Monthly', value: 'monthly' }
];

const projectOptions = ref([
  // Will be populated from user projects
]);

// Tab configuration
const tabs = [
  { value: 'overview', label: 'Overview', icon: 'mdi-view-dashboard', badge: null, badgeColor: 'primary' },
  { value: 'projects', label: 'Projects', icon: 'mdi-folder-multiple', badge: null, badgeColor: 'success' },
  { value: 'teams', label: 'Teams', icon: 'mdi-account-group', badge: null, badgeColor: 'info' },
  { value: 'departments', label: 'Departments', icon: 'mdi-domain', badge: null, badgeColor: 'warning' },
  { value: 'trends', label: 'Trends', icon: 'mdi-trending-up', badge: null, badgeColor: 'primary' },
  { value: 'quality', label: 'Quality', icon: 'mdi-check-circle', badge: null, badgeColor: 'success' },
  { value: 'user', label: 'User', icon: 'mdi-account', badge: null, badgeColor: 'info' },
  { value: 'reports', label: 'Reports', icon: 'mdi-file-document', badge: null, badgeColor: 'secondary' },
  { value: 'settings', label: 'Settings', icon: 'mdi-cog', badge: null, badgeColor: 'grey' }
];

// Active tab
const activeTab = ref('overview');
const isRefreshing = ref(false);

// Section states
const sectionStates = ref<Record<string, boolean>>({
  'dashboard-overview': true,
  'all-projects-performance': true,
  'live-snapshot': false
});

// Section management
const isSectionOpen = (sectionId: string): boolean => {
  return sectionStates.value[sectionId] ?? false;
};

const toggleSection = (sectionId: string) => {
  sectionStates.value[sectionId] = !sectionStates.value[sectionId];
};

// Section configurations for each tab
const overviewSections = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Key performance indicators and summary metrics',
    component: 'AnalyticsOverview',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'all-projects-performance',
    title: 'All Projects Performance',
    description: 'Aggregated performance metrics across all projects',
    component: 'ProjectPerformance',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'live-snapshot',
    title: 'Live Snapshot',
    description: 'Real-time project status and active tasks',
    component: 'LiveDashboard',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const projectsSections = [
  {
    id: 'project-performance',
    title: 'Project Performance',
    description: 'Detailed performance metrics for individual projects',
    component: 'ProjectPerformance',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'timeline-analysis',
    title: 'Timeline Analysis',
    description: 'Project timeline tracking and deadline adherence',
    component: 'TimelineAnalysis',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'benchmarks',
    title: 'Benchmarks Comparison',
    description: 'Compare project performance against industry standards',
    component: 'BenchmarksComparison',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const teamsSections = [
  {
    id: 'team-performance',
    title: 'Team Performance',
    description: 'Team productivity and collaboration metrics',
    component: 'TeamAnalytics',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'workload-distribution',
    title: 'Workload Distribution',
    description: 'Task distribution and capacity planning',
    component: 'WorkloadDistribution',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'collaboration-metrics',
    title: 'Collaboration Metrics',
    description: 'Team communication and knowledge sharing',
    component: 'CollaborationMetrics',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const departmentsSections = [
  {
    id: 'department-efficiency',
    title: 'Department Efficiency',
    description: 'Department productivity and resource utilization',
    component: 'DepartmentEfficiency',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'resource-utilization',
    title: 'Resource Utilization',
    description: 'Resource allocation and optimization insights',
    component: 'ResourceUtilization',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const trendsSections = [
  {
    id: 'trends-analysis',
    title: 'Trends Analysis',
    description: 'Historical trends and pattern analysis',
    component: 'TrendsAnalysis',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'predictions-forecast',
    title: 'Predictions & Forecast',
    description: 'AI-powered predictions and forecasting',
    component: 'PredictionsForecast',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const qualitySections = [
  {
    id: 'quality-metrics',
    title: 'Quality Metrics',
    description: 'Quality tracking, defects, and approval metrics',
    component: 'QualityMetrics',
    defaultOpen: true,
    priority: 'high' as 'high'
  }
];

const userSections = [
  {
    id: 'my-performance',
    title: 'My Performance',
    description: 'Personal productivity and performance metrics',
    component: 'UserPerformance',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'my-dashboard',
    title: 'My Dashboard',
    description: 'Personalized dashboard with quick actions',
    component: 'UserDashboard',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'activity-feed',
    title: 'Activity Feed',
    description: 'Recent activities and project updates',
    component: 'ActivityFeed',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'active-alerts',
    title: 'Active Alerts',
    description: 'System alerts and notifications',
    component: 'AlertsPanel',
    defaultOpen: false,
    priority: 'low' as 'low'
  }
];

const reportsSections = [
  {
    id: 'custom-reports',
    title: 'Custom Reports',
    description: 'Generate and view custom analytics reports',
    component: 'CustomReports',
    defaultOpen: true,
    priority: 'high' as 'high'
  }
];

const settingsSections = [
  {
    id: 'analytics-settings',
    title: 'Analytics Settings',
    description: 'User preferences and configuration settings',
    component: 'AnalyticsSettings',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'widget-configuration',
    title: 'Widget Configuration',
    description: 'Dashboard widget settings and layouts',
    component: 'WidgetConfiguration',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'cache-status',
    title: 'Cache Status',
    description: 'System cache performance and optimization',
    component: 'CacheStatus',
    defaultOpen: false,
    priority: 'low' as 'low'
  },
  {
    id: 'data-freshness',
    title: 'Data Freshness',
    description: 'Data synchronization and freshness monitoring',
    component: 'DataFreshness',
    defaultOpen: false,
    priority: 'low' as 'low'
  }
];

// Methods
const onTabChange = (newTab: string) => {
  activeTab.value = newTab;
  saveTabState();
  // Lazy load data for the new tab
  loadTabData(newTab);
};

const onFiltersChange = () => {
  saveFiltersState();
  // Refresh current tab data with new filters
  refreshCurrentTab();
};

const onSectionToggle = (sectionId: string, isOpen: boolean) => {
  saveSectionState(activeTab.value, sectionId, isOpen);
};

const onRefreshSection = (sectionId: string) => {
  // Trigger refresh for specific section
  console.log(`Refreshing section: ${sectionId}`);
};

const refreshCurrentTab = async () => {
  isRefreshing.value = true;
  try {
    // Refresh all open sections in current tab
    console.log(`Refreshing tab: ${activeTab.value}`);
    // Implementation will trigger refresh for all open sections
  } finally {
    isRefreshing.value = false;
  }
};

const loadTabData = (tab: string) => {
  // Lazy load data for the specified tab
  console.log(`Loading data for tab: ${tab}`);
  // Implementation will load data for visible sections only
};

// State persistence
const saveTabState = () => {
  localStorage.setItem('analytics-active-tab', activeTab.value);
};

const saveFiltersState = () => {
  localStorage.setItem('analytics-filters', JSON.stringify(globalFilters.value));
};

const saveSectionState = (tab: string, sectionId: string, isOpen: boolean) => {
  const key = `analytics-section-${tab}-${sectionId}`;
  localStorage.setItem(key, isOpen.toString());
};

const loadSavedState = () => {
  // Load saved tab
  const savedTab = localStorage.getItem('analytics-active-tab');
  if (savedTab && tabs.find(t => t.value === savedTab)) {
    activeTab.value = savedTab;
  }

  // Load saved filters
  const savedFilters = localStorage.getItem('analytics-filters');
  if (savedFilters) {
    try {
      const filters = JSON.parse(savedFilters);
      globalFilters.value = { ...globalFilters.value, ...filters };
    } catch (e) {
      console.warn('Failed to parse saved filters:', e);
    }
  }
};

// Lifecycle
onMounted(() => {
  loadSavedState();
  // Load initial data for the active tab
  loadTabData(activeTab.value);
});
</script>

<style scoped>
.analytics-tabs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--v-theme-background);
  min-height: 100vh;
}

.global-filters {
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-card {
  background: var(--v-theme-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  flex-shrink: 0;
}

.filter-actions {
  margin-left: auto;
}

.tabs-card {
  background: var(--v-theme-surface);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.analytics-tabs-nav {
  background: var(--v-theme-surface-variant);
  border-bottom: 1px solid color-mix(in srgb, var(--v-theme-outline) 40%, transparent);
}

.tab-item {
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
}

.tab-content {
  background: color-mix(in srgb, var(--v-theme-surface) 30%, transparent);
}

/* Theming sweep: normalize analytics component surfaces to theme tokens */
:deep(.section-content .v-card) {
  background: var(--v-theme-surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 16px;
}

/* Common container classes across analytics widgets */
:deep(.project-performance),
:deep(.team-analytics),
:deep(.alerts-panel),
:deep(.live-dashboard),
:deep(.financial-overview),
:deep(.timeline-analysis),
:deep(.department-efficiency),
:deep(.resource-utilization),
:deep(.workload-distribution),
:deep(.trends-analysis),
:deep(.predictions-forecast),
:deep(.benchmarks-comparison),
:deep(.quality-metrics),
:deep(.user-performance),
:deep(.user-dashboard),
:deep(.custom-reports),
:deep(.analytics-settings),
:deep(.widget-configuration),
:deep(.cache-status),
:deep(.data-freshness) {
  background: var(--v-theme-surface);
}

/* Light panels within widgets
   Replace translucent whites with surface variants and outline tokens */
:deep(.widget-content),
:deep(.performance-scores),
:deep(.quick-insights),
:deep(.projections-section),
:deep(.status-section),
:deep(.alerts-section),
:deep(.system-health) {
  background: color-mix(in srgb, var(--v-theme-surface) 60%, transparent);
  border-radius: 12px;
}

/* Cards/lists inside widgets */
:deep(.stat-card),
:deep(.metric-item),
:deep(.member-item),
:deep(.risk-item),
:deep(.no-risks),
:deep(.projection-item),
:deep(.status-item),
:deep(.alert-item),
:deep(.health-item) {
  background: var(--v-theme-surface-variant);
  border: 1px solid color-mix(in srgb, var(--v-theme-outline) 40%, transparent);
}

.analytics-window {
  background: transparent;
}

/* Responsive design */
@media (max-width: 768px) {
  .analytics-tabs {
    padding: 0;
    gap: 0.5rem;
    background: transparent !important;
  }
  
  .global-filters {
    position: sticky;
    top: 0;
    z-index: 100;
    background: transparent !important;
    margin-bottom: 1rem;
  }
  
  .filter-card {
    border-radius: 8px;
    background: var(--erp-surface) !important;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-group .v-select {
    width: 100% !important;
    min-width: auto !important;
  }
  
  .filter-actions {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .tabs-card {
    border-radius: 8px;
    background: var(--erp-surface) !important;
  }
  
  .analytics-tabs-nav {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .analytics-tabs-nav::-webkit-scrollbar {
    display: none;
  }
  
  .tab-item {
    min-width: 120px;
    flex-shrink: 0;
    font-size: 0.9rem;
  }
  
  .section-container {
    margin-bottom: 1rem;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .section-description {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .analytics-tabs {
    padding: 0;
    gap: 0.25rem;
  }
  
  .filter-card {
    border-radius: 8px;
  }
  
  .filters-row {
    gap: 0.5rem;
  }
  
  .filter-group .v-select {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .tabs-card {
    border-radius: 8px;
  }
  
  .tab-item {
    min-width: 100px;
    font-size: 0.8rem;
    padding: 0.75rem 0.5rem;
  }
  
  .tab-item .v-icon {
    font-size: 18px;
  }
  
  .section-header {
    padding: 0.75rem;
  }
  
  .section-title {
    font-size: 0.9rem;
  }
  
  .section-description {
    font-size: 0.8rem;
  }
  
  .section-actions .v-btn {
    width: 32px;
    height: 32px;
  }
  
  .section-actions .v-icon {
    font-size: 16px;
  }
}
</style>
