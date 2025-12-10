import axios from 'axios';
import { authService } from './authService';

// Backend URL from environment (do NOT include '/api' here; we prefix per-request)
const API_BASE_URL_ENV = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const API_BASE_URL = (API_BASE_URL_ENV || '').replace(/\/+$/, '');
if (!API_BASE_URL) {
  console.warn('[projectApi] VITE_BACKEND_URL is not set. Please define it in your .env file.');
}

// Ensure the URL is correct and accessible
console.log('🌐 API Base URL configured:', API_BASE_URL || '(missing)');

// Centralized axios instance with proper JWT authentication interceptor
export const api = axios.create({ 
  baseURL: API_BASE_URL,
  timeout: 30000 // 30 second timeout
});

// Request interceptor - automatically adds JWT token to every request
api.interceptors.request.use(async (config) => {
  try {
    // Ensure all relative paths are prefixed with '/api'
    if (config.url && !config.url.startsWith('http')) {
      const path = config.url.startsWith('/api') ? config.url : `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      config.url = path;
    }
    
    // Get auth headers from NextAuth session
    const headers = await authService.getAuthHeaders();
    config.headers = {
      ...(config.headers || {}),
      ...headers
    } as any; // Cast to any to resolve TypeScript error with AxiosHeaders

    // Enhanced logging for JWT debugging
    const authHeader = config.headers.Authorization as string;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const payload = authService['decodeJWTPayload'](token);
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasAuth: true,
        userId: payload?.user_id || payload?.sub,
        email: payload?.email,
        audience: payload?.aud,
        tokenPreview: token.substring(0, 30) + '...'
      });
    } else {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasAuth: false,
        error: 'No Authorization header'
      });
    }
  } catch (error) {
    console.error('❌ Failed to get auth headers:', error);
    throw new Error('Authentication required');
  }
  return config;
});

// Response interceptor - handles authentication errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('🚨 API ERROR - FULL DETAILS FOR DEBUGGING:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      requestHeaders: error.config?.headers,
      responseHeaders: error.response?.headers,
      responseData: error.response?.data,
      requestBody: error.config?.data,
      timestamp: new Date().toISOString(),
      fullError: error
    });

    // Handle authentication errors globally
    if (error.response?.status === 401) {
      console.error('🔥 401 ERROR - CALLING AUTH ERROR HANDLER');
      authService.handleAuthError(error);
    }
    
    return Promise.reject(error);
  }
);

// Types based on your Prisma schema
export interface Project {
  id: string;
  name: string;
  description?: string;
  type: 'PROGRESSIVE' | 'PARALLEL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  escrowAddress?: string;
  escrowFunded?: boolean;
  releasedFunds?: number;
  startDate: string;
  endDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  type: 'MAJOR' | 'MINOR';
  description?: string;
  order: number;
  isVisible: boolean;
  projectId: string;
  color?: string;
  managers: UserRole[];
  accessibleRoles: UserRole[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  projectId: string;
  departmentId: string;
  assignedRoleId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  isAllDay?: boolean;
  timeZone?: string;
  progress?: number;
  checklistCount?: number;
  checklistCompleted?: number;
  createdByRoleId?: string;
  // Payment fields
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'ALLOCATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  paymentTxHash?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for role-aware responses
  department?: Department;
  assignedRole?: UserRole;
  canView?: boolean;
  canEdit?: boolean;
  canAssign?: boolean;
  canReport?: boolean;
}

export interface UserRole {
  id: string;
  userId: string;
  projectId: string;
  role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
  departmentOrder: number[];
  departmentScope: number[];
  managedDepartments: Department[];
  accessibleDepartments: Department[];
  assignedTasks: Task[];
  createdAt: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: 'PROJECT_MANAGER' | 'EMPLOYEE';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  expiresAt: string;
  createdAt: string;
  project: Project;
}

export interface ProjectTag {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: string;
}

// API request data types
export interface CreateInviteData {
  projectId: string;
  email: string;
  role: 'PROJECT_MANAGER' | 'EMPLOYEE';
  departmentId?: string;
  // New optional expiry support for v2 API
  expiresAt?: string;
}

export interface CreateDepartmentData {
  name: string;
  type: 'MAJOR' | 'MINOR';
  description?: string;
  projectId?: string; // Optional for creation, will be set by backend
  order: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  departmentId: string;
  assignedRoleId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  isAllDay?: boolean;
  timeZone?: string;
  progress?: number;
  checklistCount?: number;
  checklistCompleted?: number;
  // Payment field
  paymentAmount?: number;
}

// Project Management APIs
export const projectApi = {
  // Get user's projects (filtered by backend)
  getProjects: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get(`/projects/my-projects`, { params });
    return response.data;
  },

  // Get user's projects (simple, no pagination - perfect for dashboards)
  getUserProjectsSimple: async () => {
    const response = await api.get(`/projects/my-projects/simple`);
    return response.data;
  },

  // Get project by ID
  getProject: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData: {
    name: string;
    description?: string;
    type: 'PROGRESSIVE' | 'PARALLEL';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    startDate: string;
    endDate: string;
    departments: CreateDepartmentData[];
    roles: {
      userEmail: string; // Match the frontend usage
      role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
      departmentId?: string | null; // Allow null for PROJECT_OWNER
    }[];
  }) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, projectData: Partial<Project>) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // NEW: Project overview/stats (role-aware)
  getProjectOverview: async (projectId: string) => {
    const response = await api.get(`/role-aware/projects/${projectId}/overview`);
    return response.data;
  },

  // NEW: Project-level stats with optional department drill-down
  getProjectStats: async (projectId: string, params?: { departmentId?: string }) => {
    const response = await api.get(`/role-aware/projects/${projectId}/stats`, { params });
    return response.data;
  },

  // NEW: Employee-only quick stats (assigned to me)
  getMyProjectStats: async (projectId: string) => {
    const response = await api.get(`/role-aware/projects/${projectId}/my-stats`);
    return response.data;
  }
};

// Role and Permissions APIs (role-aware project context)
export const projectAccessApi = {
  // Get my role and department scope within a project
  getMyRole: async (projectId: string) => {
    const response = await api.get(`/role-aware/projects/${projectId}/my-role`);
    return response.data;
  },

  // Get resolved permissions/action flags for a project
  getPermissions: async (projectId: string) => {
    const response = await api.get(`/role-aware/projects/${projectId}/permissions`);
    return response.data;
  },

  // Generic access check for a specific action
  checkAccess: async (payload: { projectId: string; action: string; departmentId?: string; taskId?: string }) => {
    const response = await api.post(`/role-aware/access/check`, payload);
    return response.data;
  }
};

// Project Invite APIs
export const projectInviteApi = {
  // Get user's invites (existing endpoint)
  getUserInvites: async () => {
    const response = await api.get('/invites');
    return response.data;
  },

  // Get invites for specific user
  getUserInvitesByUserId: async (userId: string) => {
    const response = await api.get(`/invites/user/${userId}`);
    return response.data;
  },

  // Get project invites
  getProjectInvites: async (projectId: string) => {
    const response = await api.get(`/invites/project/${projectId}`);
    return response.data;
  },

  // Create invite (POST /api/invites) - supports optional expiresAt when provided
  createInvite: async (inviteData: CreateInviteData) => {
    // Ensure we include projectId, email, role, and optional expiresAt as per spec
    const payload: any = {
      projectId: inviteData.projectId,
      email: inviteData.email,
      role: inviteData.role
    };
    if (inviteData.expiresAt) payload.expiresAt = inviteData.expiresAt;
    if (inviteData.departmentId) payload.departmentId = inviteData.departmentId;
    const response = await api.post('/invites', payload);
    return response.data;
  },

  // Update invite
  updateInvite: async (inviteId: string, inviteData: Partial<ProjectInvite>) => {
    const response = await api.put(`/invites/${inviteId}`, inviteData);
    return response.data;
  },

  // Delete invite
  deleteInvite: async (inviteId: string) => {
    const response = await api.delete(`/invites/${inviteId}`);
    return response.data;
  },

  // Respond to invite (accept/decline) - Fixed to use 'response' field
  respondToInvite: async (inviteId: string, status: 'ACCEPTED' | 'DECLINED') => {
    // Convert status to the expected response format
    const responseValue = status === 'ACCEPTED' ? 'ACCEPT' : 'DECLINE';
    const response = await api.put(`/invites/${inviteId}/respond`, { 
      response: responseValue 
    });
    return response.data;
  },

  // Accept invite (using the existing respond endpoint)
  acceptInvite: async (inviteId: string) => {
    const response = await api.put(`/invites/${inviteId}/respond`, { 
      response: 'ACCEPT' 
    });
    return response.data;
  },

  // Decline invite (using the existing respond endpoint)
  declineInvite: async (inviteId: string) => {
    const response = await api.put(`/invites/${inviteId}/respond`, { 
      response: 'DECLINE' 
    });
    return response.data;
  },

  // NEW: Send invite to new user for existing project
  sendProjectInvite: async (projectId: string, inviteData: {
    email: string;
    role: 'PROJECT_MANAGER' | 'EMPLOYEE';
    expiresInDays?: number;
  }) => {
    const response = await api.post(`/projects/${projectId}/invites`, inviteData);
    return response.data;
  },

  // NEW: Get all invites for existing project with filtering
  getProjectInvitesWithFilter: async (projectId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/projects/${projectId}/invites`, { params });
    return response.data;
  },

  // NEW: Accept/update invite for existing project
  updateProjectInvite: async (projectId: string, inviteId: string, inviteData: {
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    userId?: string;
  }) => {
    const response = await api.patch(`/projects/${projectId}/invites/${inviteId}`, inviteData);
    return response.data;
  },

  // NEW: Cancel/delete invite for existing project
  cancelProjectInvite: async (projectId: string, inviteId: string) => {
    const response = await api.delete(`/projects/${projectId}/invites/${inviteId}`);
    return response.data;
  }
};

// User Role APIs
export const userRoleApi = {
  // Get user role in project
  getUserRoleInProject: async (projectId: string, userId: string) => {
    try {
      // Try the specific endpoint first
      const response = await api.get(`/user-roles/project/${projectId}/user/${userId}`);
      return response.data;
    } catch (error: any) {
      // If 404, fallback to getting all roles and filtering
      if (error.response?.status === 404) {
        console.log(`⚠️ Endpoint not found, falling back to filtering all project roles`);
        const response = await api.get(`/user-roles/project/${projectId}`);
        const roles = response.data;
        
        // Find the role for the specific user
        const userRole = Array.isArray(roles) 
          ? roles.find((role: UserRole) => role.userId === userId)
          : null;
        
        // If no role found, throw 404 to maintain expected behavior
        if (!userRole) {
          throw error; // Re-throw original 404
        }
        
        return userRole;
      }
      throw error; // Re-throw other errors
    }
  },

  // Update user role
  updateUserRole: async (roleId: string, roleData: Partial<UserRole>) => {
    const response = await api.put(`/user-roles/${roleId}`, roleData);
    return response.data;
  },

  // Delete user role
  deleteUserRole: async (roleId: string) => {
    const response = await api.delete(`/user-roles/${roleId}`);
    return response.data;
  },

  // Get project user roles
  getProjectUserRoles: async (projectId: string) => {
    const response = await api.get(`/user-roles/project/${projectId}`);
    return response.data;
  },

  // Assign department to user role
  assignDepartmentToRole: async (roleId: string, departmentId: string) => {
    const response = await api.post(`/user-roles/${roleId}/departments/${departmentId}`);
    return response.data;
  },

  // NEW: Role-aware team list for a project
  getAccessibleProjectTeam: async (projectId: string) => {
    const response = await api.get(`/role-aware/projects/${projectId}/team/accessible`);
    return response.data;
  }
};

// Department APIs
export const departmentApi = {
  // Create department
  createDepartment: async (departmentData: CreateDepartmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (departmentId: string, departmentData: Partial<Department>) => {
    const response = await api.put(`/departments/${departmentId}`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (departmentId: string) => {
    const response = await api.delete(`/departments/${departmentId}`);
    return response.data;
  },

  // Get project departments
  getProjectDepartments: async (projectId: string) => {
    const response = await api.get(`/departments/project/${projectId}`);
    return response.data;
  },

  // Reorder project departments
  reorderProjectDepartments: async (projectId: string, departmentOrder: { id: string; order: number }[]) => {
    const response = await api.put(`/departments/project/${projectId}/reorder`, { departmentOrder });
    return response.data;
  },

  // NEW: Create department for existing project
  createProjectDepartment: async (projectId: string, departmentData: {
    name: string;
    type: 'MAJOR' | 'MINOR';
    description?: string;
    order: number;
    isVisible: boolean;
  }) => {
    const response = await api.post(`/projects/${projectId}/departments`, departmentData);
    return response.data;
  },

  // NEW: Get all departments for existing project with filtering
  getProjectDepartmentsWithFilter: async (projectId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    includeStats?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/projects/${projectId}/departments`, { params });
    return response.data;
  },

  // NEW: Update department for existing project
  updateProjectDepartment: async (projectId: string, departmentId: string, departmentData: {
    name?: string;
    type?: 'MAJOR' | 'MINOR';
    description?: string;
    order?: number;
    isVisible?: boolean;
  }) => {
    const response = await api.put(`/projects/${projectId}/departments/${departmentId}`, departmentData);
    return response.data;
  },

  // NEW: Delete department for existing project
  deleteProjectDepartment: async (projectId: string, departmentId: string) => {
    const response = await api.delete(`/projects/${projectId}/departments/${departmentId}`);
    return response.data;
  },

  // NEW: Get only departments accessible to the current user in a project
  getAccessibleDepartments: async (projectId: string) => {
    const response = await api.get(`/role-aware/projects/${projectId}/departments/accessible`);
    return response.data;
  },

  // NEW: Get role-aware department stats
  getDepartmentStats: async (departmentId: string) => {
    const response = await api.get(`/role-aware/departments/${departmentId}/stats`);
    return response.data;
  },

  // NEW: Get role-aware department team
  getDepartmentTeam: async (departmentId: string) => {
    const response = await api.get(`/role-aware/departments/${departmentId}/team`);
    return response.data;
  }
};

// Task APIs
export const taskApi = {
  // Create task
  createTask: async (taskData: CreateTaskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (taskId: string, taskData: Partial<Task>) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Assign task to role
  assignTaskToRole: async (taskId: string, roleId: string) => {
    const response = await api.post(`/tasks/${taskId}/assign/${roleId}`);
    return response.data;
  },

  // Get department tasks
  getDepartmentTasks: async (departmentId: string) => {
    const response = await api.get(`/tasks/department/${departmentId}`);
    return response.data;
  },

  // Get project tasks (legacy support)
  getProjectTasks: async (projectId: string) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // ROLE-SPECIFIC APIs
  // PROJECT_OWNER - All Project Tasks
  getProjectOwnerTasks: async (projectId: string, params?: {
    status?: string;
    departmentId?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/tasks/project/${projectId}`, { params });
    return response.data;
  },

  // PROJECT_MANAGER - Department Tasks (uses existing getDepartmentTasks)
  // This method is already available above

  // EMPLOYEE - Assigned Tasks (using role-aware API)
  getEmployeeTasks: async (projectId: string, params?: {
    status?: string | string[];
    priority?: string | string[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/role-aware/projects/${projectId}/tasks`, { 
      params: { ...params, scope: 'assigned_to_me' }
    });
    return response.data;
  },

  // NEW: All-projects role-aware tasks for the current user
  getMyTasks: async (params?: {
    scope?: 'all' | 'department' | 'assigned_to_me' | 'user';
    projectId?: string | string[];
    departmentId?: string | string[];
    userRoleId?: string;
    status?: string | string[];
    priority?: string | string[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    fields?: 'minimal' | 'full';
    page?: number;
    limit?: number;
    sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/role-aware/my-tasks`, { params });
    return response.data;
  },

  // NEW: All-projects calendar aggregation for the current user
  getMyTasksCalendar: async (params: {
    start: string;
    end: string;
    granularity?: 'day' | 'week';
    projectId?: string | string[];
    departmentId?: string | string[];
    userRoleId?: string;
    status?: string | string[];
    priority?: string | string[];
    search?: string;
  }) => {
    const response = await api.get(`/role-aware/my-tasks/calendar`, { params });
    return response.data;
  },

  // NEW: Get all tasks for existing project with filtering
  getProjectTasksWithFilter: async (projectId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    departmentId?: string;
    assignedRoleId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    scope?: 'all' | 'department' | 'assigned_to_me';
    fields?: 'minimal' | 'full';
  }) => {
    const response = await api.get(`/role-aware/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  // NEW: Get specific task for existing project
  getProjectTask: async (projectId: string, taskId: string) => {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  // NEW: Update task for existing project
  updateProjectTask: async (projectId: string, taskId: string, taskData: {
    title?: string;
    description?: string;
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    departmentId?: string;
    assignedRoleId?: string;
  }) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  // NEW: Delete task for existing project
  deleteProjectTask: async (projectId: string, taskId: string) => {
    const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  // NEW: Assign/reassign task for existing project
  assignProjectTask: async (projectId: string, taskId: string, assignedRoleId: string | null) => {
    const response = await api.post(`/projects/${projectId}/tasks/${taskId}/assign`, { assignedRoleId });
    return response.data;
  },

  // Role-aware task APIs for calendar
  getRoleAwareTasks: async (projectId: string, params?: {
    scope?: 'all' | 'department' | 'assigned_to_me' | 'user';
    userRoleId?: string;
    departmentId?: string;
    status?: string | string[];
    priority?: string | string[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    fields?: 'minimal' | 'full';
    page?: number;
    limit?: number;
    sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get(`/role-aware/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  // Calendar aggregation endpoint
  getCalendarTasks: async (projectId: string, params?: {
    start: string;
    end: string;
    granularity?: 'day' | 'week';
    status?: string | string[];
    priority?: string | string[];
    departmentId?: string;
    userRoleId?: string;
  }) => {
    const response = await api.get(`/role-aware/projects/${projectId}/tasks/calendar`, { params });
    return response.data;
  },

  // NEW: Role-aware create task within a specific project
  createProjectTaskRoleAware: async (projectId: string, taskData: CreateTaskData) => {
    const response = await api.post(`/role-aware/projects/${projectId}/tasks`, taskData);
    return response.data;
  }
};

// Tag APIs
export const tagApi = {
  // Get project tags
  getProjectTags: async (projectId: string) => {
    const response = await api.get(`/tags/project/${projectId}`);
    return response.data;
  },

  // Create tag
  createTag: async (tagData: Omit<ProjectTag, 'id' | 'createdAt'>) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },

  // Update tag
  updateTag: async (tagId: string, tagData: Partial<ProjectTag>) => {
    const response = await api.put(`/tags/${tagId}`, tagData);
    return response.data;
  },

  // Delete tag
  deleteTag: async (tagId: string) => {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  }
};

// Auth APIs
export const authApi = {
  // Sync user with backend after Clerk authentication
  syncUser: async (userData: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) => {
    console.log('🔄 Calling sync endpoint with data:', userData);
    console.log('🌐 Full URL:', `${API_BASE_URL}/api/auth/sync-user`);
    
    const response = await api.post('/auth/sync-user', userData);
    console.log('✅ Sync response:', response.data);
    return response.data;
  },
  
  // Get current authenticated user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Health check for auth system
  healthCheck: async () => {
    console.log('🏥 Testing backend health...');
    const response = await api.get('/auth/health');
    console.log('✅ Health check response:', response.data);
    return response.data;
  },

  // Test backend connectivity
  testBackendConnection: async () => {
    try {
      console.log('🔍 Testing backend connectivity...');
      const response = await fetch(`${API_BASE_URL}/api/auth/health`);
      const data = await response.json();
      console.log('✅ Backend connectivity test:', data);
      return data;
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      throw error;
    }
  }
};

// User APIs
export const userApi = {
  // Get user profile
  getUserProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};
