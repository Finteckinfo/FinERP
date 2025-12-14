<template>
  <div class="task-calendar-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadTasks" class="retry-btn">Retry</button>
    </div>

    <!-- Main content -->
    <div v-else>
      <!-- Header with navigation and filters -->
      <CalendarHeader
        :current-view="currentView"
        :current-date="currentDate"
        :selected-project="selectedProject"
        :projects="projects"
        :departments="departments"
        :team-members="teamMembers"
        :my-role="myRole"
        :manageable-department-ids="manageableDepartmentIds"
        :filters="filters"
        @view-change="handleViewChange"
        @date-change="handleDateChange"
        @project-change="handleProjectChange"
        @filter-change="handleFilterChange"
        @create-task="openTaskModal"
      />

      <div class="calendar-content">
        <!-- Sidebar with task list -->
        <div class="sidebar">
          <TaskList
            :tasks="filteredTasks"
            :selected-date="currentDate"
            :loading="loading"
            @task-select="selectTask"
            @task-edit="editTask"
            @task-delete="deleteTask"
          />
        </div>

        <!-- Main calendar view -->
        <div class="calendar-main">
          <CalendarView
            :current-view="currentView"
            :current-date="currentDate"
            :tasks="filteredTasks"
            :selected-task="selectedTask"
            :loading="loading"
            @task-click="selectTask"
            @date-click="handleDateClick"
          />
        </div>
      </div>

      <!-- Task Modal for create/edit -->
      <TaskModal
        v-if="showTaskModal"
        :task="editingTask"
        :projects="projects"
        :departments="departments"
        :team-members="teamMembers"
        :my-role="myRole"
        @close="closeTaskModal"
        @save="saveTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CalendarHeader from './components/CalendarHeader.vue'
import CalendarView from './components/CalendarView.vue'
import TaskList from './components/TaskList.vue'
import TaskModal from './components/TaskModal.vue'
import { taskApi, projectApi, projectAccessApi, userRoleApi, departmentApi, type Task, type Project, type Department, type UserRole } from '@/services/projectApi'

// Route and reactive data
const route = useRoute()
const currentView = ref<'month' | 'week' | 'day'>('month')
const currentDate = ref(new Date())
const selectedProject = ref<string | null>(null)
const selectedTask = ref<Task | null>(null)
const showTaskModal = ref(false)
const editingTask = ref<Task | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Data arrays
const tasks = ref<Task[]>([])
const projects = ref<Project[]>([])
const departments = ref<Department[]>([])
const teamMembers = ref<UserRole[]>([])
const myRole = ref<string | null>(null)
const manageableDepartmentIds = ref<string[]>([])

// Filters
const filters = ref({
  scope: 'all' as 'all' | 'department' | 'assigned_to_me' | 'user',
  userRoleId: undefined as string | undefined,
  departmentId: undefined as string | undefined,
  status: '' as string,
  priority: '' as string,
  search: ''
})

// Computed properties
const filteredTasks = computed(() => {
  return tasks.value
})

// Date range helpers
const getDateRange = (view: string, date: Date) => {
  const start = new Date(date)
  const end = new Date(date)
  
  switch (view) {
    case 'month':
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break
    case 'week': {
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      end.setDate(start.getDate() + 6)
      break
    }
    case 'day':
      // Same day
      break
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

// API methods
const loadProjects = async () => {
  try {
    const response = await projectApi.getUserProjectsSimple()
    projects.value = response.projects || []
    
    // Set default project from route or first available
    if (route.params.projectId) {
      selectedProject.value = route.params.projectId as string
    } else if (projects.value.length > 0) {
      selectedProject.value = projects.value[0].id
    }
  } catch (err) {
    console.error('Failed to load projects:', err)
    error.value = 'Failed to load projects'
  }
}

const loadProjectData = async (projectId: string) => {
  if (!projectId) return
  
  try {
    loading.value = true
    error.value = null
    
    // Load role and permissions
    const [roleRes, deptRes, teamRes] = await Promise.all([
      projectAccessApi.getMyRole(projectId),
      departmentApi.getAccessibleDepartments(projectId),
      userRoleApi.getAccessibleProjectTeam(projectId)
    ])
    
    myRole.value = roleRes?.primaryRole || roleRes?.role || null
    departments.value = deptRes.departments || []
    teamMembers.value = teamRes.team || []
    manageableDepartmentIds.value = roleRes?.manageableDepartmentIds || []
    
    // Load tasks
    await loadTasks()
  } catch (err) {
    console.error('Failed to load project data:', err)
    error.value = 'Failed to load project data'
  } finally {
    loading.value = false
  }
}

const loadTasks = async () => {
  // In all-projects mode (no selected project), we don't require myRole
  try {
    loading.value = true
    error.value = null

    const dateRange = getDateRange(currentView.value, currentDate.value)

    const baseParams: any = {
      ...filters.value,
      dateFrom: dateRange.start,
      dateTo: dateRange.end,
      fields: 'minimal' as const,
      sortBy: 'dueDate' as const,
      sortOrder: 'asc' as const,
      limit: 1000
    }

    // Remove null/undefined values
    Object.keys(baseParams).forEach(key => {
      if (baseParams[key] === null || baseParams[key] === undefined ||
          (Array.isArray(baseParams[key]) && baseParams[key].length === 0)) {
        delete baseParams[key]
      }
    })

    let response

    if (!selectedProject.value) {
      // All-projects view: use role-aware my-tasks endpoint
      response = await taskApi.getMyTasks({
        scope: baseParams.scope,
        status: baseParams.status,
        priority: baseParams.priority,
        dateFrom: baseParams.dateFrom,
        dateTo: baseParams.dateTo,
        search: baseParams.search,
        page: 1,
        limit: baseParams.limit,
        sortBy: baseParams.sortBy || 'dueDate',
        sortOrder: baseParams.sortOrder || 'asc'
      })
    } else {
      // Project-scoped behavior based on my role
      if (!myRole.value) {
        // If role not loaded yet for the selected project, load project data first
        await loadProjectData(selectedProject.value)
        // loadProjectData will re-call loadTasks, so return here to avoid duplicate
        return
      }

      switch (myRole.value) {
        case 'PROJECT_OWNER':
          response = await taskApi.getProjectOwnerTasks(selectedProject.value, {
            status: Array.isArray(baseParams.status) ? baseParams.status[0] : baseParams.status,
            departmentId: baseParams.departmentId,
            assignedTo: baseParams.userRoleId,
            page: 1,
            limit: baseParams.limit
          })
          break

        case 'PROJECT_MANAGER':
          response = await taskApi.getRoleAwareTasks(selectedProject.value, {
            ...baseParams,
            scope: 'department'
          })
          break

        case 'EMPLOYEE':
          response = await taskApi.getEmployeeTasks(selectedProject.value, {
            status: baseParams.status,
            priority: baseParams.priority,
            dateFrom: baseParams.dateFrom,
            dateTo: baseParams.dateTo,
            search: baseParams.search,
            page: 1,
            limit: baseParams.limit,
            sortBy: baseParams.sortBy || 'dueDate',
            sortOrder: baseParams.sortOrder || 'asc'
          })
          break

        default:
          response = await taskApi.getRoleAwareTasks(selectedProject.value, baseParams)
      }
    }

    // Assign tasks with fallback dates so tasks without dueDate still render
    const rawTasks = (response?.tasks || []) as Task[]
    tasks.value = rawTasks.map((t) => ({
      ...t,
      dueDate: t.dueDate || t.startDate || t.createdAt
    }))
  } catch (err) {
    console.error('Failed to load tasks:', err)
    error.value = 'Failed to load tasks'
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleViewChange = (view: 'month' | 'week' | 'day') => {
  currentView.value = view
  loadTasks()
}

const handleDateChange = (date: Date) => {
  currentDate.value = date
  loadTasks()
}

const handleProjectChange = (projectId: string | null) => {
  selectedProject.value = projectId
  if (projectId) {
    loadProjectData(projectId)
  } else {
    // All-projects mode: clear project-specific context and load my-tasks
    tasks.value = []
    departments.value = []
    teamMembers.value = []
    myRole.value = null
    loadTasks()
  }
}

const handleFilterChange = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters }
  loadTasks()
}

const handleDateClick = (date: Date) => {
  currentDate.value = date
  if (currentView.value === 'month') {
    currentView.value = 'day'
  }
}

const selectTask = (task: Task) => {
  selectedTask.value = task
}

const editTask = async (task: Task) => {
  // Fetch full details if minimal
  try {
    let fullTask = task
    if (selectedProject.value) {
      const res = await taskApi.getProjectTask(selectedProject.value, task.id)
      fullTask = res?.task || task
    }
    editingTask.value = fullTask
    showTaskModal.value = true
  } catch (e) {
    editingTask.value = task
    showTaskModal.value = true
  }
}

const deleteTask = async (taskId: string) => {
  if (!selectedProject.value) return
  
  try {
    await taskApi.deleteProjectTask(selectedProject.value, taskId)
    await loadTasks()
  } catch (err) {
    console.error('Failed to delete task:', err)
    error.value = 'Failed to delete task'
  }
}

const openTaskModal = () => {
  editingTask.value = null
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
}

const saveTask = async (taskData: any) => {
  if (!selectedProject.value) return
  
  try {
    if (editingTask.value) {
      // Update existing task
      await taskApi.updateProjectTask(selectedProject.value, editingTask.value.id, taskData)
    } else {
      // Create new task
      await taskApi.createTask({
        ...taskData,
        projectId: selectedProject.value
      })
    }
    
    await loadTasks()
    closeTaskModal()
  } catch (err) {
    console.error('Failed to save task:', err)
    error.value = 'Failed to save task'
  }
}

// Watchers
watch(selectedProject, (newProjectId) => {
  if (newProjectId) {
    loadProjectData(newProjectId)
  }
})

// Helper: wait for Clerk to be ready before making API calls
const waitForAuthReady = async (timeoutMs = 8000) => {
  const start = Date.now()
   
  while (true) {
    const clerk = (window as any).Clerk
    if (clerk?.session && clerk?.user) return
    if (Date.now() - start > timeoutMs) throw new Error('Authentication not ready')
    await new Promise((r) => setTimeout(r, 50))
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Ensure auth is ready to avoid axios interceptor throwing
    await waitForAuthReady()
  } catch (e) {
    console.warn('Auth not ready in time, delaying project load until next tick')
  }
  await loadProjects()
})
</script>

<style scoped>
.task-calendar-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--erp-page-bg);
}

.calendar-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background-color: var(--erp-card-bg);
  border-right: 1px solid var(--erp-border);
  overflow-y: auto;
}

.calendar-main {
  flex: 1;
  background-color: var(--erp-card-bg);
  overflow: hidden;
}

/* Loading and error states */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--erp-page-bg);
  color: var(--erp-text);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--erp-border);
  border-top: 4px solid var(--erp-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--erp-page-bg);
  color: var(--erp-text);
}

.error-message {
  color: var(--erp-error);
  margin-bottom: 16px;
  text-align: center;
}

.retry-btn {
  padding: 8px 16px;
  background-color: var(--erp-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: var(--erp-primary-dark);
}

/* Responsive design */
@media (max-width: 768px) {
  .task-calendar-container {
    height: auto;
    min-height: 100vh;
    background: transparent !important;
    padding: 0 !important;
  }
  
  .calendar-content {
    flex-direction: column;
    height: auto;
    background: transparent !important;
  }
  
  .sidebar {
    width: 100%;
    height: 250px;
    border-right: none;
    border-bottom: 1px solid var(--erp-border);
    order: 2;
    background: var(--erp-surface) !important;
    border-radius: 8px;
    margin-bottom: 1rem;
  }
  
  .calendar-main {
    order: 1;
    height: calc(100vh - 250px);
    min-height: 400px;
    background: var(--erp-surface) !important;
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    height: 200px;
    margin-bottom: 0.75rem;
  }
  
  .calendar-main {
    height: calc(100vh - 200px);
    min-height: 350px;
  }
  
  .loading-container,
  .error-container {
    padding: 1rem;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
  }
  
  .error-message {
    font-size: 0.9rem;
  }
  
  .retry-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>
