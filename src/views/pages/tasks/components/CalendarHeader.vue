<template>
  <div class="calendar-header">
    <div class="header-left">
      <h1 class="page-title">Task Calendar</h1>
      <div class="view-controls">
        <button 
          v-for="view in views" 
          :key="view"
          :class="['view-btn', { active: currentView === view }]"
          @click="$emit('view-change', view)"
        >
          {{ view.charAt(0).toUpperCase() + view.slice(1) }}
        </button>
      </div>
    </div>

    <div class="header-center">
      <div class="date-navigation">
        <button class="nav-btn" @click="previousPeriod">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 class="current-date" @click="showDatePicker = !showDatePicker">
          {{ formattedDate }}
        </h2>
        
        <button class="nav-btn" @click="nextPeriod">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Date Picker Modal -->
      <div v-if="showDatePicker" class="date-picker-modal" @click.self="showDatePicker = false">
        <div class="date-picker-content">
          <input 
            type="date" 
            v-model="selectedDate"
            @change="handleDateChange"
            class="date-input"
          />
          <button @click="goToToday" class="today-btn">Today</button>
        </div>
      </div>
    </div>

    <div class="header-right">
      <!-- Project Filter -->
      <div class="project-filter">
        <select 
          v-model="selectedProjectId" 
          @change="handleProjectChange"
          class="project-select"
        >
          <option value="">All Projects</option>
          <option 
            v-for="project in projects" 
            :key="project.id" 
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>

      <!-- Role-aware Filters -->
      <div v-if="selectedProjectId" class="filter-controls">
        <!-- Scope Filter -->
        <select
          v-model="localFilters.scope"
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="all">All Tasks</option>
          <option value="department" v-if="canUseDepartmentScope">My Department</option>
          <option value="assigned_to_me">My Tasks</option>
          <option value="user" v-if="canUseUserScope">Specific User</option>
        </select>

        <!-- User Filter (only for owners/managers) -->
        <select 
          v-if="localFilters.scope === 'user' && canFilterByUser"
          v-model="localFilters.userRoleId" 
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="">Select User</option>
          <option 
            v-for="member in filteredTeamMembers" 
            :key="member.id" 
            :value="member.id"
          >
            {{ member.user?.firstName }} {{ member.user?.lastName }} ({{ member.role }})
          </option>
        </select>

        <!-- Department Filter (only for owners/managers) -->
        <select 
          v-if="canFilterByDepartment"
          v-model="localFilters.departmentId" 
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="">All Departments</option>
          <option 
            v-for="dept in departments" 
            :key="dept.id" 
            :value="dept.id"
          >
            {{ dept.name }}
          </option>
        </select>

        <!-- Status Filter -->
        <select 
          v-model="localFilters.status" 
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="APPROVED">Approved</option>
        </select>

        <!-- Priority Filter -->
        <select 
          v-model="localFilters.priority" 
          @change="handleFilterChange"
          class="filter-select"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <!-- Search -->
        <input 
          v-model="localFilters.search" 
          @input="handleFilterChange"
          type="text" 
          placeholder="Search tasks..."
          class="search-input"
        />
      </div>

      <button class="create-task-btn" @click="$emit('create-task')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Project, Department, UserRole } from '@/services/projectApi'

interface Props {
  currentView: 'month' | 'week' | 'day'
  currentDate: Date
  selectedProject: string | null
  projects: Project[]
  departments: Department[]
  teamMembers: UserRole[]
  myRole: string | null
  manageableDepartmentIds?: string[]
  filters: {
    scope: 'all' | 'department' | 'assigned_to_me' | 'user'
    userRoleId: string | undefined
    departmentId: string | undefined
    status: string
    priority: string
    search: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-change': [view: 'month' | 'week' | 'day']
  'date-change': [date: Date]
  'project-change': [projectId: string | null]
  'filter-change': [filters: any]
  'create-task': []
}>()

const views = ['month', 'week', 'day'] as const
const showDatePicker = ref(false)
const selectedDate = ref('')
const selectedProjectId = ref(props.selectedProject || '')

// Local filter state
const localFilters = ref({
  scope: props.filters.scope,
  userRoleId: props.filters.userRoleId,
  departmentId: props.filters.departmentId,
  status: props.filters.status,
  priority: props.filters.priority,
  search: props.filters.search
})

// Watch for prop changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = {
    scope: newFilters.scope,
    userRoleId: newFilters.userRoleId,
    departmentId: newFilters.departmentId,
    status: newFilters.status,
    priority: newFilters.priority,
    search: newFilters.search
  }
}, { deep: true })

const formattedDate = computed(() => {
  const date = props.currentDate
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long'
  }
  
  if (props.currentView === 'week') {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else if (props.currentView === 'day') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } else {
    return date.toLocaleDateString('en-US', options)
  }
})

// Role-based filter visibility
const canFilterByUser = computed(() => {
  return props.myRole === 'PROJECT_OWNER' || props.myRole === 'PROJECT_MANAGER'
})

const canFilterByDepartment = computed(() => {
  return props.myRole === 'PROJECT_OWNER' || props.myRole === 'PROJECT_MANAGER'
})

const canUseDepartmentScope = computed(() => {
  return props.myRole === 'PROJECT_OWNER' || props.myRole === 'PROJECT_MANAGER'
})

const canUseUserScope = computed(() => {
  return props.myRole === 'PROJECT_OWNER' || props.myRole === 'PROJECT_MANAGER'
})

const filteredTeamMembers = computed(() => {
  if (!props.teamMembers) return []
  
  // Filter team members based on user role and department access
  if (props.myRole === 'PROJECT_OWNER') {
    return props.teamMembers
  } else if (props.myRole === 'PROJECT_MANAGER') {
    // Managers can only see team members in their manageable departments
    return props.teamMembers.filter(member => 
      member.accessibleDepartments.some(dept => 
        props.manageableDepartmentIds?.includes(dept.id)
      )
    )
  }
  
  return []
})

const previousPeriod = () => {
  const newDate = new Date(props.currentDate)
  if (props.currentView === 'month') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else if (props.currentView === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setDate(newDate.getDate() - 1)
  }
  emit('date-change', newDate)
}

const nextPeriod = () => {
  const newDate = new Date(props.currentDate)
  if (props.currentView === 'month') {
    newDate.setMonth(newDate.getMonth() + 1)
  } else if (props.currentView === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setDate(newDate.getDate() + 1)
  }
  emit('date-change', newDate)
}

const handleDateChange = () => {
  if (selectedDate.value) {
    emit('date-change', new Date(selectedDate.value))
    showDatePicker.value = false
  }
}

const goToToday = () => {
  emit('date-change', new Date())
  showDatePicker.value = false
}

const handleProjectChange = () => {
  emit('project-change', selectedProjectId.value || null)
}

const handleFilterChange = () => {
  emit('filter-change', {
    scope: localFilters.value.scope,
    userRoleId: localFilters.value.userRoleId,
    departmentId: localFilters.value.departmentId,
    status: localFilters.value.status,
    priority: localFilters.value.priority,
    search: localFilters.value.search
  })
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0;
}

.view-controls {
  display: flex;
  background-color: var(--erp-surface);
  border-radius: 0.5rem;
  padding: 0.25rem;
  border: 1px solid var(--erp-border);
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: var(--erp-text);
  background-color: var(--erp-surface);
}

.view-btn.active {
  background-color: var(--erp-card-bg);
  color: var(--erp-text);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.header-center {
  position: relative;
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.current-date {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.current-date:hover {
  background-color: var(--erp-surface);
}

.date-picker-modal {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  margin-top: 0.5rem;
}

.date-picker-content {
  background-color: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.today-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.today-btn:hover {
  background-color: #2563eb;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.project-filter {
  display: flex;
  align-items: center;
}

.project-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  background-color: var(--erp-card-bg);
  font-size: 0.875rem;
  color: var(--erp-text);
  cursor: pointer;
}

.project-select:focus {
  outline: none;
  border-color: var(--erp-accent-indigo);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.25rem;
  background-color: var(--erp-card-bg);
  font-size: 0.75rem;
  color: var(--erp-text);
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--erp-accent-indigo);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent);
}

.search-input {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.25rem;
  background-color: var(--erp-card-bg);
  font-size: 0.75rem;
  color: var(--erp-text);
  min-width: 150px;
}

.search-input:focus {
  outline: none;
  border-color: var(--erp-accent-indigo);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent);
}

.search-input::placeholder {
  color: var(--erp-text-muted);
}

.create-task-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--erp-accent-indigo);
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-task-btn:hover {
  filter: brightness(0.95);
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .header-left {
    width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .page-title {
    font-size: 1.25rem;
    text-align: center;
    width: 100%;
  }
  
  .view-controls {
    background: var(--erp-surface) !important;
    border-radius: 6px;
    padding: 0.125rem;
    width: 100%;
    justify-content: center;
  }
  
  .view-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    min-width: 60px;
  }
  
  .header-center {
    width: 100%;
    order: 3;
  }
  
  .date-navigation {
    width: 100%;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .nav-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .current-date {
    font-size: 1rem;
    padding: 0.375rem 0.75rem;
    text-align: center;
    flex: 1;
    max-width: 200px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
    flex-direction: column;
    gap: 0.5rem;
    order: 2;
  }
  
  .project-filter {
    width: 100%;
  }
  
  .project-select {
    width: 100%;
    font-size: 0.8rem;
  }
  
  .filter-controls {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.375rem;
  }
  
  .filter-select,
  .search-input {
    min-width: 80px;
    flex: 1;
    font-size: 0.75rem;
    padding: 0.25rem 0.375rem;
  }
  
  .create-task-btn {
    width: 100%;
    justify-content: center;
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
    height: auto;
    min-height: 36px;
  }
  
  .create-task-btn svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .calendar-header {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .header-left {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .page-title {
    font-size: 1.125rem;
    text-align: center;
    width: 100%;
  }
  
  .view-controls {
    width: 100%;
    justify-content: center;
  }
  
  .view-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    min-width: 50px;
  }
  
  .date-navigation {
    gap: 0.25rem;
  }
  
  .nav-btn {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .current-date {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
    max-width: 150px;
  }
  
  .filter-controls {
    gap: 0.25rem;
  }
  
  .filter-select,
  .search-input {
    min-width: 70px;
    font-size: 0.7rem;
    padding: 0.2rem 0.3rem;
  }
  
  .create-task-btn {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    height: auto;
    min-height: 32px;
  }
  
  .create-task-btn svg {
    width: 14px;
    height: 14px;
  }
}
</style>
