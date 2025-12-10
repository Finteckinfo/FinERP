<template>
  <div class="analytics-page">
    <!-- Analytics Tabs -->
    <AnalyticsTabs 
      :overview-data="overviewData"
      :performance-data="performanceData"
      :team-data="teamData"
      :financial-data="financialData"
      :timeline-data="timelineData"
      :department-data="departmentData"
      :resource-data="resourceData"
      :workload-data="workloadData"
      :trends-data="trendsData"
      :predictions-data="predictionsData"
      :benchmarks-data="benchmarksData"
      :live-data="liveData"
      :activity-data="activityData"
      :alerts-data="alertsData"
      :user-performance-data="userPerformanceData"
      :user-dashboard-data="userDashboardData"
      :bottlenecks-data="bottlenecksData"
      :quality-data="qualityData"
      :collaboration-data="collaborationData"
      :custom-report-data="customReportData"
      :config-settings-data="configSettingsData"
      :widget-config-data="widgetConfigData"
      :cache-status-data="cacheStatusData"
      :data-freshness-data="dataFreshnessData"
      :loading="loading"
      :load-overview="loadOverview"
      :load-performance="loadPerformance"
      :load-team="loadTeam"
      :load-financial="loadFinancial"
      :load-timeline="loadTimeline"
      :load-departments="loadDepartments"
      :load-resources="loadResources"
      :load-workload="loadWorkload"
      :load-trends="loadTrends"
      :load-predictions="loadPredictions"
      :load-benchmarks="loadBenchmarks"
      :load-live="loadLive"
      :load-activity="loadActivity"
      :load-alerts="loadAlerts"
      :load-user-performance="loadUserPerformance"
      :load-user-dashboard="loadUserDashboard"
      :load-bottlenecks="loadBottlenecks"
      :load-quality="loadQuality"
      :load-collaboration="loadCollaboration"
      :load-custom-report="loadCustomReport"
      :handle-export-report="handleExportReport"
      :handle-share-dashboard="handleShareDashboard"
      :load-config-settings="loadConfigSettings"
      :load-widget-config="loadWidgetConfig"
      :load-cache-status="loadCacheStatus"
      :load-data-freshness="loadDataFreshness"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNextAuth } from '@/composables/useNextAuth';

// Import all original analytics components
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
import LiveDashboard from './components/LiveDashboard.vue';
import ActivityFeed from './components/ActivityFeed.vue';
import AlertsPanel from './components/AlertsPanel.vue';
import UserPerformance from './components/UserPerformance.vue';
import UserDashboard from './components/UserDashboard.vue';
import BottlenecksAnalysis from './components/BottlenecksAnalysis.vue';
import QualityMetrics from './components/QualityMetrics.vue';
import CollaborationMetrics from './components/CollaborationMetrics.vue';
import CustomReports from './components/CustomReports.vue';
import AnalyticsSettings from './components/AnalyticsSettings.vue';
import WidgetConfiguration from './components/WidgetConfiguration.vue';
import CacheStatus from './components/CacheStatus.vue';
import DataFreshness from './components/DataFreshness.vue';
import AnalyticsSkeleton from './components/AnalyticsSkeleton.vue';

// Import the tabbed structure
import AnalyticsTabs from './AnalyticsTabs.vue';

// Services
import { analyticsApi } from './services/analyticsApi';

const { user } = useNextAuth();

// All the original data states
const overviewData = ref<any>(null);
const performanceData = ref<any>(null);
const teamData = ref<any>(null);
const financialData = ref<any>(null);
const timelineData = ref<any>(null);
const departmentData = ref<any>(null);
const resourceData = ref<any>(null);
const workloadData = ref<any>(null);
const trendsData = ref<any>(null);
const predictionsData = ref<any>(null);
const benchmarksData = ref<any>(null);
const liveData = ref<any>(null);
const activityData = ref<any>(null);
const alertsData = ref<any>(null);
const userPerformanceData = ref<any>(null);
const userDashboardData = ref<any>(null);
const bottlenecksData = ref<any>(null);
const qualityData = ref<any>(null);
const collaborationData = ref<any>(null);
const customReportData = ref<any>(null);
const exportReportData = ref<any>(null);
const shareDashboardData = ref<any>(null);
const configSettingsData = ref<any>(null);
const widgetConfigData = ref<any>(null);
const cacheStatusData = ref<any>(null);
const dataFreshnessData = ref<any>(null);

// User's projects for project-specific analytics
const userProjects = ref<any[]>([]);

// Loading state
const loading = ref({
  overview: true,
  performance: true,
  team: true,
  financial: true,
  timeline: true,
  departments: true,
  resources: true,
  workload: true,
  trends: true,
  predictions: true,
  benchmarks: true,
  live: true,
  activity: true,
  alerts: true,
  userPerformance: true,
  userDashboard: true,
  bottlenecks: true,
  quality: true,
  collaboration: true,
  customReport: true,
  exportReport: true,
  shareDashboard: true,
  configSettings: true,
  widgetConfig: true,
  cacheStatus: true,
  dataFreshness: true
});

// Error state
const error = ref<string | null>(null);

// All the original load functions
const loadOverview = async () => {
  if (!user.value?.id) return;
  try {
    loading.value.overview = true;
    const data = await analyticsApi.getDashboardOverview({
      userId: user.value.id,
      dateRange: '30d'
    });
    overviewData.value = data;
  } catch (err: any) {
    console.error('Failed to load overview:', err);
  } finally {
    loading.value.overview = false;
  }
};

const loadPerformance = async () => {
  try {
    loading.value.performance = true;
    const data = await analyticsApi.getAllProjectsPerformance({
      dateRange: '30d',
      granularity: 'weekly'
    });
    performanceData.value = data;
  } catch (err: any) {
    console.error('Failed to load performance:', err);
  } finally {
    loading.value.performance = false;
  }
};

const loadTeam = async () => {
  try {
    loading.value.team = true;
    const data = await analyticsApi.getAllProjectsTeamPerformance({
      dateRange: '30d'
    });
    teamData.value = data;
  } catch (err: any) {
    console.error('Failed to load team:', err);
  } finally {
    loading.value.team = false;
  }
};

const loadFinancial = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping financial overview: No accessible projects');
    loading.value.financial = false;
    return;
  }
  try {
    loading.value.financial = true;
    const data = await analyticsApi.getFinancialOverview({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    financialData.value = data;
  } catch (err: any) {
    console.error('Failed to load financial:', err);
    financialData.value = null;
  } finally {
    loading.value.financial = false;
  }
};

const loadTimeline = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping timeline analysis: No accessible projects');
    loading.value.timeline = false;
    return;
  }
  try {
    loading.value.timeline = true;
    const data = await analyticsApi.getTimelineAnalysis({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    timelineData.value = data;
  } catch (err: any) {
    console.error('Failed to load timeline:', err);
    timelineData.value = null;
  } finally {
    loading.value.timeline = false;
  }
};

const loadDepartments = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping department efficiency: No accessible projects');
    loading.value.departments = false;
    return;
  }
  try {
    loading.value.departments = true;
    const data = await analyticsApi.getDepartmentEfficiency({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    departmentData.value = data;
  } catch (err: any) {
    console.error('Failed to load departments:', err);
    departmentData.value = null;
  } finally {
    loading.value.departments = false;
  }
};

const loadResources = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping resource utilization: No accessible projects');
    loading.value.resources = false;
    return;
  }
  try {
    loading.value.resources = true;
    const data = await analyticsApi.getResourceUtilization({
      projectId: userProjects.value[0].id,
      resourceType: 'human'
    });
    resourceData.value = data;
  } catch (err: any) {
    console.error('Failed to load resources:', err);
    resourceData.value = null;
  } finally {
    loading.value.resources = false;
  }
};

const loadWorkload = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping workload distribution: No accessible projects');
    loading.value.workload = false;
    return;
  }
  try {
    loading.value.workload = true;
    const data = await analyticsApi.getWorkloadDistribution({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    workloadData.value = data;
  } catch (err: any) {
    console.error('Failed to load workload:', err);
    workloadData.value = null;
  } finally {
    loading.value.workload = false;
  }
};

const loadTrends = async () => {
  try {
    loading.value.trends = true;
    const data = await analyticsApi.getTrendsAnalysis({
      metricType: 'throughput',
      dateRange: '90d',
      granularity: 'weekly'
    });
    trendsData.value = data;
  } catch (err: any) {
    console.error('Failed to load trends:', err);
  } finally {
    loading.value.trends = false;
  }
};

const loadPredictions = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping predictions forecast: No accessible projects');
    loading.value.predictions = false;
    return;
  }
  try {
    loading.value.predictions = true;
    const data = await analyticsApi.getPredictionsForecast({
      projectId: userProjects.value[0].id,
      predictionType: 'completion',
      horizon: '90d'
    });
    predictionsData.value = data;
  } catch (err: any) {
    console.error('Failed to load predictions:', err);
    predictionsData.value = null;
  } finally {
    loading.value.predictions = false;
  }
};

const loadBenchmarks = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping benchmarks comparison: No accessible projects');
    loading.value.benchmarks = false;
    return;
  }
  try {
    loading.value.benchmarks = true;
    const data = await analyticsApi.getBenchmarksComparison({
      projectId: userProjects.value[0].id,
      benchmarkType: 'historical'
    });
    benchmarksData.value = data;
  } catch (err: any) {
    console.error('Failed to load benchmarks:', err);
    benchmarksData.value = null;
  } finally {
    loading.value.benchmarks = false;
  }
};

const loadLive = async () => {
  if (!user.value?.id) return;
  try {
    loading.value.live = true;
    const data = await analyticsApi.getLiveDashboard({
      projectIds: []
    });
    liveData.value = data;
  } catch (err: any) {
    console.error('Failed to load live:', err);
  } finally {
    loading.value.live = false;
  }
};

const loadActivity = async () => {
  if (!user.value?.id) return;
  try {
    loading.value.activity = true;
    const data = await analyticsApi.getActivityFeed({
      userId: user.value.id,
      limit: 20
    });
    activityData.value = data;
  } catch (err: any) {
    console.error('Failed to load activity:', err);
  } finally {
    loading.value.activity = false;
  }
};

const loadAlerts = async () => {
  if (!user.value?.id) return;
  try {
    loading.value.alerts = true;
    const data = await analyticsApi.getActiveAlerts({
      userId: user.value.id
    });
    alertsData.value = data;
  } catch (err: any) {
    console.error('Failed to load alerts:', err);
  } finally {
    loading.value.alerts = false;
  }
};

const loadUserPerformance = async () => {
  if (!user.value?.id) return;
  try {
    loading.value.userPerformance = true;
    const data = await analyticsApi.getUserPerformance(user.value.id, {
      dateRange: '30d'
    });
    userPerformanceData.value = data;
  } catch (err: any) {
    console.error('Failed to load user performance:', err);
  } finally {
    loading.value.userPerformance = false;
  }
};

const loadUserDashboard = async () => {
  if (!user.value?.id) return;
  try {
    loading.value.userDashboard = true;
    const data = await analyticsApi.getUserDashboard(user.value.id, {
      viewType: 'personal'
    });
    userDashboardData.value = data;
  } catch (err: any) {
    console.error('Failed to load user dashboard:', err);
  } finally {
    loading.value.userDashboard = false;
  }
};

const loadBottlenecks = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping bottlenecks analysis: No accessible projects');
    loading.value.bottlenecks = false;
    return;
  }
  try {
    loading.value.bottlenecks = true;
    const data = await analyticsApi.getBottlenecksAnalysis({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    bottlenecksData.value = data;
  } catch (err: any) {
    console.error('Failed to load bottlenecks:', err);
    bottlenecksData.value = null;
  } finally {
    loading.value.bottlenecks = false;
  }
};

const loadQuality = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping quality metrics: No accessible projects');
    loading.value.quality = false;
    return;
  }
  try {
    loading.value.quality = true;
    const data = await analyticsApi.getQualityMetrics({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    qualityData.value = data;
  } catch (err: any) {
    console.error('Failed to load quality:', err);
    qualityData.value = null;
  } finally {
    loading.value.quality = false;
  }
};

const loadCollaboration = async () => {
  if (!user.value?.id || !userProjects.value.length) {
    console.log('Skipping collaboration metrics: No accessible projects');
    loading.value.collaboration = false;
    return;
  }
  try {
    loading.value.collaboration = true;
    const data = await analyticsApi.getCollaborationMetrics({
      projectId: userProjects.value[0].id,
      dateRange: '30d'
    });
    collaborationData.value = data;
  } catch (err: any) {
    console.error('Failed to load collaboration:', err);
    collaborationData.value = null;
  } finally {
    loading.value.collaboration = false;
  }
};

const loadCustomReport = async () => {
  try {
    loading.value.customReport = true;
    const data = await analyticsApi.getCustomReport({
      reportId: 'comprehensive',
      dateRange: '30d'
    });
    customReportData.value = data;
  } catch (err: any) {
    console.error('Failed to load custom report:', err);
  } finally {
    loading.value.customReport = false;
  }
};

const handleExportReport = async (exportData: any) => {
  try {
    loading.value.exportReport = true;
    const data = await analyticsApi.exportReport(exportData);
    exportReportData.value = data;
    return data;
  } catch (err: any) {
    console.error('Failed to export report:', err);
    throw err;
  } finally {
    loading.value.exportReport = false;
  }
};

const handleShareDashboard = async (shareData: any) => {
  try {
    loading.value.shareDashboard = true;
    const data = await analyticsApi.shareDashboard(shareData);
    shareDashboardData.value = data;
    return data;
  } catch (err: any) {
    console.error('Failed to share dashboard:', err);
    throw err;
  } finally {
    loading.value.shareDashboard = false;
  }
};

const loadConfigSettings = async () => {
  try {
    loading.value.configSettings = true;
    const data = await analyticsApi.getConfigSettings({});
    configSettingsData.value = data;
  } catch (err: any) {
    console.error('Failed to load config settings:', err);
  } finally {
    loading.value.configSettings = false;
  }
};

const loadWidgetConfig = async () => {
  try {
    loading.value.widgetConfig = true;
    const data = await analyticsApi.getWidgetConfig({
      dashboardId: 'main'
    });
    widgetConfigData.value = data;
  } catch (err: any) {
    console.error('Failed to load widget config:', err);
  } finally {
    loading.value.widgetConfig = false;
  }
};

const loadCacheStatus = async () => {
  try {
    loading.value.cacheStatus = true;
    const data = await analyticsApi.getCacheStatus({
      cacheType: 'memory'
    });
    cacheStatusData.value = data;
  } catch (err: any) {
    console.error('Failed to load cache status:', err);
  } finally {
    loading.value.cacheStatus = false;
  }
};

const loadDataFreshness = async () => {
  try {
    loading.value.dataFreshness = true;
    const data = await analyticsApi.getDataFreshness({
      dataType: 'tasks'
    });
    dataFreshnessData.value = data;
  } catch (err: any) {
    console.error('Failed to load data freshness:', err);
  } finally {
    loading.value.dataFreshness = false;
  }
};

const loadUserProjects = async () => {
  if (!user.value?.id) return;
  try {
    // Load user's accessible projects from the backend
    const response = await analyticsApi.getDashboardOverview({
      userId: user.value.id,
      dateRange: '30d'
    });
    
    // Extract project IDs from the overview response
    if (response?.filters?.projectIds) {
      userProjects.value = response.filters.projectIds.map((id: string, index: number) => ({
        id: id,
        name: `Project ${index + 1}`
      }));
    } else {
      // Fallback: use empty array to avoid 403 errors
      userProjects.value = [];
    }
  } catch (err: any) {
    console.error('Failed to load user projects:', err);
    // Fallback: use empty array to avoid 403 errors
    userProjects.value = [];
  }
};

const loadAllData = async () => {
  await loadUserProjects();
  
  const promises = [
    loadOverview(),
    loadPerformance(),
    loadTeam(),
    loadFinancial(),
    loadTimeline(),
    loadDepartments(),
    loadResources(),
    loadWorkload(),
    loadTrends(),
    loadPredictions(),
    loadBenchmarks(),
    loadLive(),
    loadActivity(),
    loadAlerts(),
    loadUserPerformance(),
    loadUserDashboard(),
    loadBottlenecks(),
    loadQuality(),
    loadCollaboration(),
    loadCustomReport(),
    loadConfigSettings(),
    loadWidgetConfig(),
    loadCacheStatus(),
    loadDataFreshness()
  ];
  
  await Promise.allSettled(promises);
};

// Lifecycle
onMounted(() => {
  if (user.value?.id) {
    loadAllData();
  }
});

// Expose data and functions for the tabbed components
defineExpose({
  // Data
  overviewData,
  performanceData,
  teamData,
  financialData,
  timelineData,
  departmentData,
  resourceData,
  workloadData,
  trendsData,
  predictionsData,
  benchmarksData,
  liveData,
  activityData,
  alertsData,
  userPerformanceData,
  userDashboardData,
  bottlenecksData,
  qualityData,
  collaborationData,
  customReportData,
  configSettingsData,
  widgetConfigData,
  cacheStatusData,
  dataFreshnessData,
  
  // Loading states
  loading,
  
  // Functions
  loadOverview,
  loadPerformance,
  loadTeam,
  loadFinancial,
  loadTimeline,
  loadDepartments,
  loadResources,
  loadWorkload,
  loadTrends,
  loadPredictions,
  loadBenchmarks,
  loadLive,
  loadActivity,
  loadAlerts,
  loadUserPerformance,
  loadUserDashboard,
  loadBottlenecks,
  loadQuality,
  loadCollaboration,
  loadCustomReport,
  handleExportReport,
  handleShareDashboard,
  loadConfigSettings,
  loadWidgetConfig,
  loadCacheStatus,
  loadDataFreshness
});
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: var(--v-theme-background);
}
</style>