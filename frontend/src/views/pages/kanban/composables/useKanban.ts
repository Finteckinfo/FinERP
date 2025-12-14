import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { kanbanApi } from '../services/kanbanApi';
import type { 
  KanbanBoard, 
  KanbanTask, 
  KanbanFilters, 
  TaskPosition,
  WebSocketMessage,
  TaskMoveMessage,
  TaskAssignMessage
} from '../types/kanban';

export function useKanban() {
  // Reactive state
  const loading = ref(false);
  const error = ref<string | null>(null);
  const kanbanData = ref<KanbanBoard | null>(null);
  const filters = ref<KanbanFilters>({});
  const selectedTasks = ref<string[]>([]);
  const websocket = ref<WebSocket | null>(null);
  
  // Computed properties
  const columns = computed(() => {
    if (!kanbanData.value) return {};
    return kanbanData.value.columns;
  });

  const totalTasks = computed(() => {
    if (!kanbanData.value) return 0;
    return kanbanData.value.totalTasks;
  });

  const userPermissions = computed(() => {
    if (!kanbanData.value) return {
      canCreateTasks: false,
      canEditAllTasks: false,
      canDeleteTasks: false,
      canAssignTasks: false
    };
    return kanbanData.value.userPermissions;
  });

  const filteredColumns = computed(() => {
    if (!kanbanData.value?.columns) return {};
    
    const filtered: Record<string, KanbanTask[]> = {};
    const cols = kanbanData.value.columns;
    
    Object.keys(cols).forEach(status => {
      const tasks = cols[status as keyof typeof cols] || [];
      
      // Apply search filter
      let filteredTasks: KanbanTask[] = [...tasks];
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filteredTasks = filteredTasks.filter((task: KanbanTask) => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.assignedUser?.email.toLowerCase().includes(searchLower) ||
          task.department.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply due date filter
      if (filters.value.dueDateRange) {
        const { start, end } = filters.value.dueDateRange;
        filteredTasks = filteredTasks.filter((task: KanbanTask) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const startDate = new Date(start);
          const endDate = new Date(end);
          return dueDate >= startDate && dueDate <= endDate;
        });
      }
      
      // Apply soft-archive filter (hide archived cards by default)
      if (!filters.value.includeArchived) {
        filteredTasks = filteredTasks.filter((task: KanbanTask) => !task.archivedAt);
      }
      
      filtered[status] = filteredTasks;
    });
    
    return filtered;
  });

  const hasSelectedTasks = computed(() => selectedTasks.value.length > 0);

  // Methods
  const loadKanbanData = async (forceRefresh = false) => {
    if (loading.value && !forceRefresh) return;
    
    try {
      loading.value = true;
      error.value = null;
      
      console.log('[useKanban] Loading cross-project kanban data with filters:', filters.value);
      const data = await kanbanApi.getKanbanBoard(filters.value);
      kanbanData.value = data;
      
      console.log('[useKanban] Kanban data loaded successfully:', {
        totalTasks: data.totalTasks,
        columns: Object.keys(data.columns).map(status => ({
          status,
          taskCount: data.columns[status as keyof typeof data.columns].length
        })),
        projectSummary: data.projectSummary?.length || 0
      });
      
    } catch (err: any) {
      console.error('[useKanban] Failed to load kanban data:', err);
      error.value = err.message || 'Failed to load kanban board';
    } finally {
      loading.value = false;
    }
  };

  const updateFilters = async (newFilters: Partial<KanbanFilters>) => {
    console.log('[useKanban] Updating filters:', newFilters);
    filters.value = { ...filters.value, ...newFilters };
    await loadKanbanData(true);
  };

  const moveTask = async (taskId: string, position: TaskPosition) => {
    try {
      console.log('[useKanban] Moving task - starting process:', { 
        taskId, 
        position,
        timestamp: new Date().toISOString(),
        currentKanbanData: kanbanData.value ? {
          totalTasks: kanbanData.value.totalTasks,
          columns: Object.keys(kanbanData.value.columns).map(status => ({
            status,
            taskCount: kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns].length
          }))
        } : null
      });
      
      // Find the task before moving to log its current state
      const currentTask = findTaskById(taskId);
      if (currentTask) {
        console.log('[useKanban] Current task state:', {
          taskId: currentTask.id,
          currentStatus: currentTask.status,
          currentOrder: currentTask.order,
          newStatus: position.status,
          newOrder: position.order,
          projectName: currentTask.project.name,
          departmentName: currentTask.department.name
        });
      } else {
        console.warn('[useKanban] Task not found in current data:', taskId);
      }
      
      console.log('[useKanban] Calling kanbanApi.updateTaskPosition...');
      const result = await kanbanApi.updateTaskPosition(taskId, position);
      console.log('[useKanban] API call successful, result:', result);
      
      // Update local state optimistically
      if (kanbanData.value) {
        console.log('[useKanban] Updating local state optimistically...');
        
        // Remove task from old column
        let taskMoved = false;
        Object.keys(kanbanData.value.columns).forEach(status => {
          const column = kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns];
          const taskIndex = column.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            console.log('[useKanban] Found task in column:', { status, taskIndex });
            const [task] = column.splice(taskIndex, 1);
            // Add task to new column
            task.status = position.status;
            task.order = position.order;
            kanbanData.value!.columns[position.status].splice(position.order, 0, task);
            taskMoved = true;
            console.log('[useKanban] Task moved to new column:', { 
              fromStatus: status, 
              toStatus: position.status,
              newOrder: position.order 
            });
          }
        });
        
        if (!taskMoved) {
          console.warn('[useKanban] Task was not found in any column during local update');
        }
        
        // Update affected tasks order
        console.log('[useKanban] Updating affected tasks order:', result.affectedTasks);
        result.affectedTasks.forEach(({ id, order }) => {
          const task = findTaskById(id);
          if (task) {
            console.log('[useKanban] Updating task order:', { id, oldOrder: task.order, newOrder: order });
            task.order = order;
          } else {
            console.warn('[useKanban] Affected task not found:', id);
          }
        });
        
        // Sort columns by order
        console.log('[useKanban] Sorting columns by order...');
        Object.keys(kanbanData.value.columns).forEach(status => {
          const beforeSort = kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns].map(t => ({ id: t.id, order: t.order }));
          kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns]
            .sort((a, b) => a.order - b.order);
          const afterSort = kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns].map(t => ({ id: t.id, order: t.order }));
          console.log('[useKanban] Column sorted:', { status, beforeSort, afterSort });
        });
        
        console.log('[useKanban] Local state update completed');
      } else {
        console.warn('[useKanban] No kanban data available for local update');
      }
      
      console.log('[useKanban] Task move completed successfully:', {
        taskId,
        result,
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (err: any) {
      console.error('[useKanban] Failed to move task:', {
        taskId,
        position,
        error: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
      error.value = err.message || 'Failed to move task';
      // Refresh data to revert optimistic update
      console.log('[useKanban] Refreshing data to revert optimistic update...');
      await loadKanbanData(true);
      throw err;
    }
  };

  const findTaskById = (taskId: string): KanbanTask | null => {
    if (!kanbanData.value) return null;
    
    for (const status of Object.keys(kanbanData.value.columns)) {
      const tasks = kanbanData.value.columns[status as keyof typeof kanbanData.value.columns];
      const task = tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const toggleTaskSelection = (taskId: string) => {
    const index = selectedTasks.value.indexOf(taskId);
    if (index === -1) {
      selectedTasks.value.push(taskId);
    } else {
      selectedTasks.value.splice(index, 1);
    }
  };

  const selectAllTasks = (columnStatus?: string) => {
    if (!kanbanData.value) return;
    
    if (columnStatus) {
      const columnTasks = kanbanData.value.columns[columnStatus as keyof typeof kanbanData.value.columns];
      const taskIds = columnTasks.map(task => task.id);
      selectedTasks.value = [...new Set([...selectedTasks.value, ...taskIds])];
    } else {
      // Select all tasks
      const allTaskIds: string[] = [];
      Object.values(kanbanData.value.columns).forEach(tasks => {
        allTaskIds.push(...tasks.map(task => task.id));
      });
      selectedTasks.value = allTaskIds;
    }
  };

  const clearSelection = () => {
    selectedTasks.value = [];
  };

  const isTaskSelected = (taskId: string) => {
    return selectedTasks.value.includes(taskId);
  };

  // WebSocket real-time updates
  const connectWebSocket = async () => {
    try {
      console.log('[useKanban] Attempting WebSocket connection for cross-project updates');
      
      websocket.value = await kanbanApi.createWebSocketConnection('all-projects', handleWebSocketMessage);
      
      if (!websocket.value) {
        console.info('[useKanban] WebSocket not available - real-time updates disabled');
        console.info('[useKanban] Users can still use manual refresh to see updates');
      }
      
    } catch (err) {
      console.warn('[useKanban] WebSocket connection failed - continuing without real-time updates:', err);
    }
  };

  const disconnectWebSocket = () => {
    if (websocket.value) {
      console.log('[useKanban] Disconnecting WebSocket');
      websocket.value.close();
      websocket.value = null;
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('[useKanban] WebSocket message received:', message);
    
    switch (message.type) {
      case 'TASK_MOVED':
        handleTaskMoved(message as TaskMoveMessage);
        break;
      case 'TASK_ASSIGNED':
        handleTaskAssigned(message as TaskAssignMessage);
        break;
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_DELETED':
        // Refresh data for these events
        loadKanbanData(true);
        break;
    }
  };

  const handleTaskMoved = (message: TaskMoveMessage) => {
    if (!kanbanData.value) return;
    
    const task = findTaskById(message.taskId);
    if (task && task.status !== message.data.toStatus) {
      // Move task between columns
      const fromColumn = kanbanData.value.columns[message.data.fromStatus as keyof typeof kanbanData.value.columns];
      const toColumn = kanbanData.value.columns[message.data.toStatus as keyof typeof kanbanData.value.columns];
      
      const taskIndex = fromColumn.findIndex(t => t.id === message.taskId);
      if (taskIndex !== -1) {
        const [movedTask] = fromColumn.splice(taskIndex, 1);
        movedTask.status = message.data.toStatus as any;
        movedTask.order = message.data.toOrder;
        toColumn.push(movedTask);
        
        // Sort columns
        fromColumn.sort((a, b) => a.order - b.order);
        toColumn.sort((a, b) => a.order - b.order);
      }
    }
  };

  const handleTaskAssigned = (message: TaskAssignMessage) => {
    // Refresh data to get updated assignment info
    loadKanbanData(true);
  };

  // Watchers
  watch(() => filters.value, () => {
    // Enforce "project = board": do not load anything unless a projectId filter exists
    if (filters.value.projectIds && filters.value.projectIds.length > 0) {
    loadKanbanData(true);
    }
  }, { deep: true });

  // Lifecycle
  onMounted(() => {
    // Enforce "project = board": do not load anything unless a projectId filter exists
    if (filters.value.projectIds && filters.value.projectIds.length > 0) {
    loadKanbanData();
    connectWebSocket();
    }
  });

  onUnmounted(() => {
    disconnectWebSocket();
  });

  return {
    // State
    loading,
    error,
    kanbanData,
    filters,
    selectedTasks,
    
    // Computed
    columns: filteredColumns,
    totalTasks,
    userPermissions,
    hasSelectedTasks,
    
    // Methods
    loadKanbanData,
    updateFilters,
    moveTask,
    findTaskById,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    isTaskSelected,
    connectWebSocket,
    disconnectWebSocket
  };
}
