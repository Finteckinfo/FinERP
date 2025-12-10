import { api } from '@/services/projectApi';

// Types for Analytics APIs
export interface DashboardOverviewParams {
  userId: string;
  dateRange: '7d' | '30d' | '90d' | '1y';
  projectIds?: string[];
}

export interface DashboardOverviewResponse {
  filters: {
    dateRange: string;
    projectIds: string[];
    userId: string;
  };
  totals: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    teamMembers: number;
  };
  scores: {
    productivity: number | null;
    budgetUtilization: number | null;
    timelineAdherence: number | null;
  };
}

export interface ProjectPerformanceParams {
  projectId?: string;
  dateRange: '7d' | '30d' | '90d' | '1y';
  granularity: 'daily' | 'weekly' | 'monthly';
  allProjects?: boolean; // New flag for all projects analytics
}

export interface ProjectPerformanceResponse {
  projectId?: string;
  dateRange: string;
  granularity: string;
  metrics: {
    healthScore: number;
    completionRate: number;
    budgetVsActual: {
      budget: number | null;
      actual: number | null;
    };
    timelineProgress: number;
    riskAssessment: Array<{
      type: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
    }>;
    teamEfficiency: number;
    milestoneCompletion: Array<{
      id: string;
      name: string;
      completed: boolean;
      dueDate: string;
      completionDate?: string;
    }>;
  };
}

export interface TeamPerformanceParams {
  projectId?: string;
  departmentId?: string;
  userId?: string;
  dateRange: '7d' | '30d' | '90d' | '1y';
  allProjects?: boolean; // New flag for all projects analytics
}

export interface TeamPerformanceResponse {
  filters: {
    projectId?: string;
    departmentId?: string;
    userId?: string;
    dateRange: string;
  };
  individuals: Array<{
    userId: string;
    name: string;
    role: string;
    productivity: number;
    tasksCompleted: number;
    workload: number;
  }>;
  workloadDistribution: Array<{
    departmentId: string;
    departmentName: string;
    workload: number;
    capacity: number;
  }>;
  taskCompletionRates: Array<{
    period: string;
    completed: number;
    total: number;
    rate: number;
  }>;
  collaboration: Array<{
    metric: string;
    value: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  }>;
  skillUtilization: Array<{
    skill: string;
    utilization: number;
    demand: number;
  }>;
  trends: Array<{
    metric: string;
    data: Array<{
      date: string;
      value: number;
    }>;
  }>;
}

// Analytics API Service
export const analyticsApi = {
  // 1. Dashboard Overview
  getDashboardOverview: async (params: DashboardOverviewParams): Promise<DashboardOverviewResponse> => {
    const response = await api.get('/analytics/dashboard/overview', { params });
    return response.data;
  },

  // 2. Project Performance (Single Project)
  getProjectPerformance: async (params: ProjectPerformanceParams): Promise<ProjectPerformanceResponse> => {
    const response = await api.get('/analytics/projects/performance', { params });
    return response.data;
  },

  // 2b. All Projects Performance (Cross-Project Analytics)
  getAllProjectsPerformance: async (params: { dateRange?: '7d' | '30d' | '90d' | '1y'; granularity?: 'daily' | 'weekly' | 'monthly' }) => {
    const response = await api.get('/analytics/projects/all/performance', { params });
    return response.data;
  },

  // 3. Team Performance (Single Project)
  getTeamPerformance: async (params: TeamPerformanceParams): Promise<TeamPerformanceResponse> => {
    const response = await api.get('/analytics/team/performance', { params });
    return response.data;
  },

  // 3b. All Projects Team Performance (Cross-Project Analytics)
  getAllProjectsTeamPerformance: async (params: { dateRange?: '7d' | '30d' | '90d' | '1y' }) => {
    const response = await api.get('/analytics/team/all/performance', { params });
    return response.data;
  },

  // 4. Financial Overview
  getFinancialOverview: async (params: { projectId: string; dateRange?: '7d' | '30d' | '90d' | '1y'; currency?: string }) => {
    const response = await api.get('/analytics/financial/overview', { params });
    return response.data;
  },

  // 5. Timeline Analysis
  getTimelineAnalysis: async (params: { projectId: string; dateRange?: '7d' | '30d' | '90d' | '1y' }) => {
    const response = await api.get('/analytics/timeline/analysis', { params });
    return response.data;
  },

  // 6. Department Efficiency
  getDepartmentEfficiency: async (params: { projectId: string; dateRange?: '7d' | '30d' | '90d' | '1y' }) => {
    const response = await api.get('/analytics/departments/efficiency', { params });
    return response.data;
  },

  // 7. Resource Utilization
  getResourceUtilization: async (params: { projectId: string; resourceType?: 'human' | 'equipment' | 'escrow' }) => {
    const response = await api.get('/analytics/resources/utilization', { params });
    return response.data;
  },

  // 8. Workload Distribution
  getWorkloadDistribution: async (params: { projectId: string; teamId?: string; dateRange?: '7d' | '30d' | '90d' | '1y' }) => {
    const response = await api.get('/analytics/workload/distribution', { params });
    return response.data;
  },

  // 9. Trends Analysis
  getTrendsAnalysis: async (params: { metricType: 'throughput' | 'completion_rate' | 'on_time_rate' | 'in_progress' | 'pending'; dateRange?: '7d' | '30d' | '90d' | '1y'; granularity?: 'daily' | 'weekly' | 'monthly'; projectIds?: string[] }) => {
    const response = await api.get('/analytics/trends/analysis', { params });
    return response.data;
  },

  // 10. Predictions Forecast
  getPredictionsForecast: async (params: { projectId: string; predictionType?: 'completion' | 'escrow' | 'timeline'; horizon?: '30d' | '90d' | '180d' }) => {
    const response = await api.get('/analytics/predictions/forecast', { params });
    return response.data;
  },

  // 11. Benchmarks Comparison
  getBenchmarksComparison: async (params: { projectId: string; benchmarkType?: 'industry' | 'historical' | 'team' }) => {
    const response = await api.get('/analytics/benchmarks/comparison', { params });
    return response.data;
  },

  // 12. Live Dashboard
  getLiveDashboard: async (params: { projectIds?: string[] }) => {
    const response = await api.get('/analytics/live/dashboard', { params });
    return response.data;
  },

  // 13. Activity Feed
  getActivityFeed: async (params: { userId?: string; projectId?: string; activityType?: string; limit?: number; offset?: number }) => {
    const response = await api.get('/analytics/activity/feed', { params });
    return response.data;
  },

  // 14. Active Alerts
  getActiveAlerts: async (params: { userId?: string; alertType?: 'DEADLINE' | 'BUDGET' | 'RISK' | 'SYSTEM'; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) => {
    const response = await api.get('/analytics/alerts/active', { params });
    return response.data;
  },

  // 15. User Performance
  getUserPerformance: async (userId: string, params: { dateRange?: '7d' | '30d' | '90d' | '1y'; metrics?: string[] }) => {
    const response = await api.get(`/analytics/users/${userId}/performance`, { params });
    return response.data;
  },

  // 16. User Dashboard
  getUserDashboard: async (userId: string, params: { viewType?: 'personal' | 'team' | 'project' }) => {
    const response = await api.get(`/analytics/users/${userId}/dashboard`, { params });
    return response.data;
  },

  // 17. Bottlenecks Analysis
  getBottlenecksAnalysis: async (params: { projectId: string; dateRange?: '7d' | '30d' | '90d' | '1y'; severity?: 'LOW' | 'MEDIUM' | 'HIGH' }) => {
    const response = await api.get('/analytics/bottlenecks/analysis', { params });
    return response.data;
  },

  // 18. Quality Metrics
  getQualityMetrics: async (params: { projectId: string; dateRange?: '7d' | '30d' | '90d' | '1y'; qualityType?: 'review' | 'approval' | 'defect' }) => {
    const response = await api.get('/analytics/quality/metrics', { params });
    return response.data;
  },

  // 19. Collaboration Metrics
  getCollaborationMetrics: async (params: { projectId: string; teamId?: string; dateRange?: '7d' | '30d' | '90d' | '1y' }) => {
    const response = await api.get('/analytics/collaboration/metrics', { params });
    return response.data;
  },

  // 20. Custom Reports
  getCustomReport: async (params: { reportId: string; dateRange?: '7d' | '30d' | '90d' | '1y'; filters?: string }) => {
    const response = await api.get('/analytics/reports/custom', { params });
    return response.data;
  },

  // 21. Export Report
  exportReport: async (data: { reportType: string; filters?: object; format: 'PDF' | 'Excel' | 'CSV'; email?: string }) => {
    const response = await api.post('/analytics/reports/export', data);
    return response.data;
  },

  // 22. Share Dashboard
  shareDashboard: async (data: { dashboardId: string; shareType: 'link' | 'email'; recipients?: string[]; permissions?: string[] }) => {
    const response = await api.post('/analytics/dashboards/share', data);
    return response.data;
  },

  // 23. Config Settings
  getConfigSettings: async (params: { userId?: string; configType?: 'preferences' | 'layouts' | 'metrics' | 'alerts' | 'views' }) => {
    const response = await api.get('/analytics/config/settings', { params });
    return response.data;
  },

  // 24. Widget Config
  getWidgetConfig: async (params: { dashboardId: string; widgetType?: 'kpi' | 'chart' | 'table' | 'calendar' }) => {
    const response = await api.get('/analytics/widgets/config', { params });
    return response.data;
  },

  // 25. Cache Status
  getCacheStatus: async (params: { cacheType?: 'memory' | 'redis' | 'none'; metricType?: 'trends' | 'overview' | 'performance' }) => {
    const response = await api.get('/analytics/cache/status', { params });
    return response.data;
  },

  // 26. Data Freshness
  getDataFreshness: async (params: { dataType?: 'tasks' | 'activities' | 'alerts' | 'metrics'; source?: 'primary' | 'replica' | 'external' }) => {
    const response = await api.get('/analytics/data/freshness', { params });
    return response.data;
  }
};
