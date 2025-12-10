export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  progress?: number;
  order: number;
  projectId: string;
  departmentId: string;
  assignedRoleId?: string;
  assignedUser?: {
    id: string;
    email: string;
    avatar?: string;
    name?: string;
  };
  project: {
    id: string;
    name: string;
    type: 'PROGRESSIVE' | 'PARALLEL';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  department: {
    id: string;
    name: string;
    color?: string;
    type: 'MAJOR' | 'MINOR';
  };
  checklistCount?: number;
  checklistCompleted?: number;
  // Payment fields
  paymentAmount?: number;
  paymentStatus?: 'PENDING' | 'ALLOCATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  paymentTxHash?: string;
  createdAt: string;
  updatedAt: string;
  canView?: boolean;
  canEdit?: boolean;
  canAssign?: boolean;
  canDelete?: boolean;
  canApprove?: boolean; // Only project owner can approve tasks (move from COMPLETED to APPROVED)
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  tasks: KanbanTask[];
  color: string;
  limit?: number;
  collapsed?: boolean;
}

export interface KanbanBoard {
  columns: {
    PENDING: KanbanTask[];
    IN_PROGRESS: KanbanTask[];
    COMPLETED: KanbanTask[];
    APPROVED: KanbanTask[];
  };
  totalTasks: number;
  projectSummary: Array<{
    projectId: string;
    projectName: string;
    taskCount: number;
    departments: Array<{
      id: string;
      name: string;
      taskCount: number;
    }>;
  }>;
  userPermissions: {
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
  };
}

export interface KanbanFilters {
  projectIds?: string[];
  departmentId?: string;
  assignedRoleIds?: string[];
  priorities?: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
  includeCompleted?: boolean;
  search?: string;
  dueDateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskActivity {
  id: string;
  type: 'STATUS_CHANGED' | 'ASSIGNED' | 'CREATED' | 'UPDATED' | 'DELETED' | 'PRIORITY_CHANGED' | 'DUE_DATE_CHANGED';
  description: string;
  userId: string;
  userEmail: string;
  userName?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface TaskPosition {
  taskId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  order: number;
  departmentId?: string;
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

export interface BulkTaskUpdate {
  taskIds: string[];
  updates: {
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assignedRoleId?: string;
    dueDate?: string;
    progress?: number;
  };
}

export interface BulkUpdateResult {
  updatedTasks: Array<{
    id: string;
    status?: string;
    assignedRoleId?: string;
    updatedAt: string;
  }>;
  failedTasks: Array<{
    id: string;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface KanbanMetrics {
  projectId: string;
  timeRange: string;
  averageCycleTime: number;
  averageLeadTime: number;
  throughput: number;
  tasksInProgress: number;
  completedTasks: number;
  bottlenecks: Array<{
    status: string;
    taskCount: number;
    averageTimeInStatus: number;
    isBottleneck: boolean;
  }>;
  departmentPerformance: Array<{
    departmentId: string;
    departmentName: string;
    completedTasks: number;
    averageCycleTime: number;
  }>;
}

export interface WebSocketMessage {
  type: 'TASK_MOVED' | 'TASK_ASSIGNED' | 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED';
  taskId: string;
  userId: string;
  timestamp: string;
  data?: any;
}

export interface TaskMoveMessage extends WebSocketMessage {
  type: 'TASK_MOVED';
  data: {
    fromStatus: string;
    toStatus: string;
    fromOrder: number;
    toOrder: number;
    movedBy: string;
  };
}

export interface TaskAssignMessage extends WebSocketMessage {
  type: 'TASK_ASSIGNED';
  data: {
    assignedTo: string;
    assignedBy: string;
    previousAssignee?: string;
  };
}

export interface DragDropResult {
  taskId: string;
  sourceColumnId: string;
  destinationColumnId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export interface ColumnConfig {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  color: string;
  icon?: string;
  limit?: number;
  description?: string;
}

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'pending',
    title: 'To Do',
    status: 'PENDING',
    color: '#6b7280',
    icon: 'mdi-clipboard-text-outline',
    description: 'Tasks ready to be started'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'IN_PROGRESS',
    color: '#f59e0b',
    icon: 'mdi-clock-outline',
    description: 'Tasks currently being worked on'
  },
  {
    id: 'completed',
    title: 'Completed',
    status: 'COMPLETED',
    color: '#10b981',
    icon: 'mdi-check-circle',
    description: 'Tasks finished and ready for review'
  },
  {
    id: 'approved',
    title: 'Approved',
    status: 'APPROVED',
    color: '#3b82f6',
    icon: 'mdi-check-all',
    description: 'Tasks reviewed and approved by project owner (triggers escrow payment release)'
  }
];
