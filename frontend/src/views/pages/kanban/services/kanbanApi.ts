import axios from 'axios';
import { authService } from '@/services/authService';
import type { 
  KanbanBoard, 
  KanbanFilters, 
  TaskPosition, 
  BulkTaskUpdate, 
  BulkUpdateResult,
  TaskActivity,
  KanbanMetrics,
  WebSocketMessage 
} from '../types/kanban';

// Backend URL from environment
const API_BASE_URL_ENV = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const API_BASE_URL = (API_BASE_URL_ENV || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.warn('[kanbanApi] VITE_BACKEND_URL is not set. Please define it in your .env file.');
}

// Centralized axios instance with proper JWT authentication interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authService.getJWTToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[kanbanApi] Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[kanbanApi] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[kanbanApi] API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('[kanbanApi] Authentication error - user may need to re-login');
    }
    
    return Promise.reject(error);
  }
);

export const kanbanApi = {
  /**
   * Get cross-project kanban board data with tasks organized by status columns
   */
  getKanbanBoard: async (filters?: KanbanFilters): Promise<KanbanBoard> => {
    const params = new URLSearchParams();
    
    if (filters?.projectIds?.length) {
      filters.projectIds.forEach(projectId => {
        params.append('projectIds', projectId);
      });
    }
    
    if (filters?.departmentId) {
      params.append('departmentId', filters.departmentId);
    }
    
    if (filters?.assignedRoleIds?.length) {
      filters.assignedRoleIds.forEach(roleId => {
        params.append('assignedRoleIds', roleId);
      });
    }
    
    if (filters?.priorities?.length) {
      filters.priorities.forEach(priority => {
        params.append('priorities', priority);
      });
    }
    
    if (filters?.includeCompleted !== undefined) {
      params.append('includeCompleted', filters.includeCompleted.toString());
    }

    if (filters?.includeArchived !== undefined) {
      params.append('includeArchived', filters.includeArchived.toString());
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    if (filters?.dueDateRange) {
      params.append('dueDate[start]', filters.dueDateRange.start);
      params.append('dueDate[end]', filters.dueDateRange.end);
    }

    const queryString = params.toString();
    const url = `/api/tasks/kanban/all-projects${queryString ? '?' + queryString : ''}`;
    
    console.log('[kanbanApi] Fetching cross-project kanban board:', { filters, url });
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Update task position for drag & drop functionality
   */
  updateTaskPosition: async (taskId: string, position: TaskPosition): Promise<{
    taskId: string;
    status: string;
    order: number;
    updatedAt: string;
    affectedTasks: Array<{ id: string; order: number }>;
  }> => {
    console.log('[kanbanApi] Updating task position - starting API call:', { 
      taskId, 
      position,
      timestamp: new Date().toISOString(),
      apiBaseUrl: API_BASE_URL
    });
    
    const requestPayload = {
      status: position.status,
      order: position.order,
      departmentId: position.departmentId
    };
    
    console.log('[kanbanApi] Request payload:', requestPayload);
    console.log('[kanbanApi] Making PATCH request to:', `/api/tasks/${taskId}/position`);
    
    try {
      const response = await api.patch(`/api/tasks/${taskId}/position`, requestPayload);
      
      console.log('[kanbanApi] API response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        timestamp: new Date().toISOString()
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[kanbanApi] API call failed:', {
        taskId,
        position,
        requestPayload,
        error: error instanceof Error ? error.message : error,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : null,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  /**
   * Bulk update multiple tasks
   */
  bulkUpdateTasks: async (bulkUpdate: BulkTaskUpdate): Promise<BulkUpdateResult> => {
    console.log('[kanbanApi] Bulk updating tasks:', bulkUpdate);
    
    const response = await api.patch('/api/tasks/bulk-update', {
      taskIds: bulkUpdate.taskIds,
      updates: bulkUpdate.updates
    });
    
    return response.data;
  },

  /**
   * Get task activity history
   */
  getTaskActivity: async (taskId: string): Promise<{
    taskId: string;
    activities: TaskActivity[];
  }> => {
    console.log('[kanbanApi] Fetching task activity:', taskId);
    
    const response = await api.get(`/api/tasks/${taskId}/activity`);
    return response.data;
  },

  /**
   * Get cross-project kanban performance metrics
   */
  getKanbanMetrics: async (
    timeRange?: string, 
    projectIds?: string[]
  ): Promise<KanbanMetrics> => {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('timeRange', timeRange);
    }
    
    if (projectIds?.length) {
      projectIds.forEach(projectId => {
        params.append('projectIds', projectId);
      });
    }

    const queryString = params.toString();
    const url = `/api/analytics/kanban/all-projects/metrics${queryString ? '?' + queryString : ''}`;
    
    console.log('[kanbanApi] Fetching cross-project kanban metrics:', { timeRange, projectIds });
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocketConnection: async (projectId: string, onMessage: (message: WebSocketMessage) => void): Promise<WebSocket | null> => {
    try {
      // Get auth token first
      const token = await authService.getJWTToken();
      if (!token) {
        console.warn('[kanbanApi] No auth token available for WebSocket connection - skipping real-time updates');
        return null;
      }

      // Get the WebSocket URL
      const wsUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');
      const wsEndpoint = `${wsUrl}/api/tasks/live/${projectId}?token=${token}`;
      
      console.log('[kanbanApi] Attempting WebSocket connection to:', wsEndpoint.replace(token, 'TOKEN_HIDDEN'));

      const ws = new WebSocket(wsEndpoint);
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.warn('[kanbanApi] WebSocket connection timeout - closing connection');
          ws.close();
        }
      }, 10000); // 10 second timeout
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('[kanbanApi] ✅ WebSocket connected successfully for project:', projectId);
      };
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[kanbanApi] WebSocket message received:', message);
          onMessage(message);
        } catch (error) {
          console.error('[kanbanApi] Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        
        if (event.code === 1000) {
          console.log('[kanbanApi] WebSocket closed normally');
        } else if (event.code === 1006) {
          console.warn('[kanbanApi] WebSocket closed abnormally - real-time updates disabled');
          console.warn('[kanbanApi] This usually means the WebSocket server is not running or not properly configured');
        } else {
          console.warn('[kanbanApi] WebSocket closed with code:', event.code, 'reason:', event.reason);
        }
      };
      
      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.warn('[kanbanApi] WebSocket connection failed - falling back to manual refresh');
        console.warn('[kanbanApi] Real-time updates are disabled. Users will need to refresh manually.');
        // Don't log the full error as it's expected when WebSocket server isn't available
      };
      
      return ws;
      
    } catch (error) {
      console.warn('[kanbanApi] WebSocket not available - real-time updates disabled');
      return null;
    }
  }
};

// Export the axios instance for direct use if needed
export { api as kanbanApiClient };
