<template>
  <div class="project-details">
    <v-container fluid class="pa-0">
      <!-- Hero Section with Back Button -->
      <div class="project-hero">
        <RetroGrid />
        
        <!-- Back Button -->
        <div class="hero-back-btn">
          <v-btn icon variant="text" @click="$router.push('/projects')" size="small">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </div>

        <div class="hero-content">
          <!-- Project Icon -->
          <div class="hero-icon">
            <v-icon size="48">mdi-folder-open</v-icon>
          </div>
          
          <!-- Project Title & Status -->
          <div class="hero-title-section">
            <h1 class="hero-title">{{ project?.name || 'Loading...' }}</h1>
            <v-chip 
              v-if="project"
              :color="getStatusColor(getProjectStatus(project))" 
              size="small"
              class="mt-2"
            >
              {{ getStatusLabel(getProjectStatus(project)) }}
            </v-chip>
          </div>
          
          <!-- Action Buttons -->
          <div class="hero-actions">
            <v-btn 
              :color="'var(--erp-accent-green)'" 
              variant="elevated" 
              size="large"
              @click="openWorkspace"
              class="action-btn"
            >
              <v-icon class="mr-2">mdi-application</v-icon>
              Open Workspace
            </v-btn>
            <v-btn 
              color="secondary" 
              variant="outlined" 
              size="large"
              @click="editProject"
              class="action-btn"
            >
              <v-icon class="mr-2">mdi-pencil</v-icon>
              Edit Project
            </v-btn>
            <v-btn 
              color="info" 
              variant="outlined"
              size="large"
              @click="shareProject"
              class="action-btn"
            >
              <v-icon class="mr-2">mdi-share-variant</v-icon>
              Share
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate :color="'var(--erp-accent-green)'" size="64"></v-progress-circular>
          <p class="mt-4" :style="{ color: 'var(--erp-text)' }">Loading project details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <v-alert type="error" class="mb-4">
            {{ error }}
          </v-alert>
          <v-btn :color="'var(--erp-accent-green)'" @click="loadProjectData">Retry</v-btn>
        </div>

        <!-- Content -->
        <div v-else-if="project">
          <!-- Project Overview Section -->
          <v-row class="mb-6">
            <v-col cols="12" md="8">
              <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <div class="d-flex align-center justify-space-between mb-4">
                  <h3 class="text-h6 font-weight-medium">Project Overview</h3>
                  <v-chip 
                    :color="getProjectTypeColor(project.type)" 
                    variant="tonal"
                  >
                    {{ getProjectTypeLabel(project.type) }}
                  </v-chip>
                </div>
                
                <p class="text-body-1 text-grey-darken-1 mb-4">
                  {{ project.description || 'No description provided' }}
                </p>

                <div class="project-meta">
                  <div class="meta-item">
                    <v-icon size="20" color="grey" class="mr-3">mdi-calendar-range</v-icon>
                    <div>
                      <div class="meta-label">Timeline</div>
                      <div class="meta-value">
                        {{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="meta-item">
                    <v-icon size="20" color="grey" class="mr-3">mdi-flag</v-icon>
                    <div>
                      <div class="meta-label">Priority</div>
                      <div class="meta-value">
                        <v-chip 
                          :color="getPriorityColor(project.priority)" 
                          variant="tonal" 
                          size="small"
                        >
                          {{ getPriorityLabel(project.priority) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>

                  <div class="meta-item">
                    <v-icon size="20" color="grey" class="mr-3">mdi-account-tie</v-icon>
                    <div>
                      <div class="meta-label">Your Role</div>
                      <div class="meta-value">
                                                 <v-chip 
                           :color="getRoleColor(userRole?.role || 'CLIENT')" 
                           variant="outlined" 
                           size="small"
                         >
                           {{ getUserRoleLabel(userRole?.role || 'CLIENT') }}
                         </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <h4 class="text-h6 font-weight-medium mb-4">Quick Stats</h4>
                
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ getProjectProgress() }}%</div>
                    <div class="stat-label">Progress</div>
                    <v-progress-linear
                      :model-value="getProjectProgress()"
                      :color="getProgressColor(getProjectProgress())"
                      height="6"
                      rounded
                    />
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-value">{{ tasks.length }}</div>
                    <div class="stat-label">Total Tasks</div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-value">{{ teamMembers.length }}</div>
                    <div class="stat-label">Team Members</div>
                  </div>
                  
                  <div class="stat-item">
                    <div class="stat-value">{{ getCompletedTasksCount() }}</div>
                    <div class="stat-label">Completed Tasks</div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

                     <!-- Departments Section -->
           <v-row class="mb-6">
             <v-col cols="12">
               <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                 <div class="d-flex align-center justify-space-between mb-4">
                   <h3 class="text-h6 font-weight-medium">Project Departments</h3>
                   <v-btn 
                     :color="'var(--erp-accent-green)'" 
                     variant="outlined" 
                     size="small"
                     @click="addDepartment"
                   >
                     <v-icon class="mr-2">mdi-domain-plus</v-icon>
                     Add Department
                   </v-btn>
                 </div>
                 
                 <div v-if="departments.length === 0" class="text-center py-8">
                   <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-domain</v-icon>
                   <p class="text-grey">No departments created yet</p>
                 </div>
                 
                 <div v-else class="departments-grid">
                   <div 
                     v-for="dept in departments" 
                     :key="dept.id"
                     class="department-card"
                   >
                     <div class="department-header">
                       <div class="department-icon">
                         <v-icon 
                           :color="getDepartmentTypeColor(dept.type)" 
                           size="32"
                         >
                           {{ getDepartmentTypeIcon(dept.type) }}
                         </v-icon>
                       </div>
                       <div class="department-info">
                         <h4 class="department-name">{{ dept.name }}</h4>
                         <p class="department-description">{{ dept.description }}</p>
                         <div class="department-meta">
                           <v-chip 
                             :color="getDepartmentTypeColor(dept.type)" 
                             variant="tonal" 
                             size="small"
                           >
                             {{ getDepartmentTypeLabel(dept.type) }}
                           </v-chip>
                           <span class="task-count">{{ dept.tasks?.length || 0 }} tasks</span>
                         </div>
                       </div>
                     </div>
                     <div class="department-actions">
                       <v-btn icon variant="text" size="small">
                         <v-icon>mdi-eye</v-icon>
                       </v-btn>
                       <v-btn icon variant="text" size="small">
                         <v-icon>mdi-pencil</v-icon>
                       </v-btn>
                       <v-btn icon variant="text" size="small">
                         <v-icon>mdi-delete</v-icon>
                       </v-btn>
                     </div>
                   </div>
                 </div>
               </v-card>
             </v-col>
           </v-row>

           <!-- Team Members Section -->
           <v-row class="mb-6">
             <v-col cols="12">
               <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                 <div class="d-flex align-center justify-space-between mb-4">
                   <h3 class="text-h6 font-weight-medium">Team Members</h3>
                   <v-btn 
                     :color="'var(--erp-accent-green)'" 
                     variant="outlined" 
                     size="small"
                     @click="inviteTeamMember"
                   >
                     <v-icon class="mr-2">mdi-account-plus</v-icon>
                     Invite Member
                   </v-btn>
                 </div>
                
                <div class="team-grid">
                  <div 
                    v-for="member in teamMembers" 
                    :key="member.id"
                    class="team-member-card"
                  >
                    <div class="member-avatar">
                      <v-avatar 
                        :color="getAvatarColor(member.user?.firstName || member.user?.email || '')"
                        size="48"
                      >
                        <v-icon color="white" size="24">mdi-account</v-icon>
                      </v-avatar>
                    </div>
                    <div class="member-info">
                      <div class="member-name">
                        {{ member.user?.firstName || member.user?.email || 'Unknown User' }}
                      </div>
                      <v-chip 
                        :color="getRoleColor(member.role)" 
                        variant="tonal" 
                        size="small"
                      >
                        {{ getUserRoleLabel(member.role) }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Recent Tasks Section -->
          <v-row class="mb-6">
            <v-col cols="12">
              <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <div class="d-flex align-center justify-space-between mb-4">
                  <h3 class="text-h6 font-weight-medium">Recent Tasks</h3>
                  <v-btn 
                    :color="'var(--erp-accent-green)'" 
                    variant="outlined" 
                    size="small"
                    @click="viewAllTasks"
                  >
                    View All Tasks
                  </v-btn>
                </div>
                
                <div v-if="tasks.length === 0" class="text-center py-8">
                  <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-checkbox-blank-circle-outline</v-icon>
                  <p class="text-grey">No tasks created yet</p>
                </div>
                
                <div v-else class="tasks-list">
                  <div 
                    v-for="task in recentTasks" 
                    :key="task.id"
                    class="task-item"
                  >
                                         <div class="task-info">
                       <div class="task-name">{{ task.title }}</div>
                       <div class="task-description">{{ task.description || 'No description' }}</div>
                     </div>
                    <div class="task-meta">
                      <v-chip 
                        :color="getTaskStatusColor(task.status)" 
                        variant="tonal" 
                        size="small"
                      >
                        {{ getTaskStatusLabel(task.status) }}
                      </v-chip>
                      <div class="task-priority">
                        <v-chip 
                          :color="getPriorityColor(task.priority)" 
                          variant="outlined" 
                          size="x-small"
                        >
                          {{ getPriorityLabel(task.priority) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Project Timeline Section -->
          <v-row class="mb-6">
            <v-col cols="12">
              <v-card elevation="0" class="pa-4 border rounded-lg" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <h3 class="text-h6 font-weight-medium mb-4">Project Timeline</h3>
                
                <div class="timeline">
                  <div class="timeline-item">
                    <div class="timeline-marker start"></div>
                    <div class="timeline-content">
                      <div class="timeline-date">{{ formatDate(project.startDate) }}</div>
                      <div class="timeline-title">Project Started</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-marker current"></div>
                    <div class="timeline-content">
                      <div class="timeline-date">Current</div>
                      <div class="timeline-title">In Progress</div>
                    </div>
                  </div>
                  
                  <div class="timeline-item">
                    <div class="timeline-marker end"></div>
                    <div class="timeline-content">
                      <div class="timeline-date">{{ formatDate(project.endDate) }}</div>
                      <div class="timeline-title">Project Deadline</div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useNextAuth } from '@/composables/useNextAuth';
import { projectApi, taskApi, userRoleApi, departmentApi, projectAccessApi, type Project, type Task, type UserRole, type Department } from '@/services/projectApi';
import { RetroGrid } from '@/components/ui/retro-grid';

const router = useRouter();
const route = useRoute();
const { user } = useNextAuth();

// Reactive data
const project = ref<Project | null>(null);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
const departments = ref<Department[]>([]);
const userRole = ref<UserRole | null>(null);
const myRole = ref<'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE' | null>(null);
const permissions = ref<any>(null);
const overview = ref<{ totalTasks: number; completedTasks: number; completionPercentage: number; teamMembers: number } | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const loadInFlight = ref(false);

// Computed properties
const recentTasks = computed(() => {
  return tasks.value.slice(0, 5); // Show only 5 most recent tasks
});

// Methods
const loadProjectData = async () => {
  if (!user.value?.id || !route.params.id) {
    loading.value = false;
    return;
  }

  try {
    if (loadInFlight.value) return;
    loadInFlight.value = true;
    loading.value = true;
    error.value = null;

    // Load project details
    const projectResponse = await projectApi.getProject(route.params.id as string);
    project.value = projectResponse;

    // Load role and permissions (with fallback to existing endpoints)
    try {
      const [roleRes, permRes] = await Promise.all([
        projectAccessApi.getMyRole(route.params.id as string),
        projectAccessApi.getPermissions(route.params.id as string)
      ]);
      myRole.value = roleRes?.role || null;
      permissions.value = permRes || {};
    } catch (error) {
      console.warn('Role-aware endpoints not available, using fallback:', error);
      // Fallback: get role from existing endpoint
      try {
        const roleResponse = await userRoleApi.getUserRoleInProject(route.params.id as string, user.value.id);
        myRole.value = roleResponse?.role || null;
        // Compute basic permissions from role
        permissions.value = {
          canCreateTask: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canAssignTask: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canEditTask: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canManageDepartments: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canSchedule: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canReportTime: true // Allow all roles to report for now
        };
      } catch (fallbackError) {
        console.error('Fallback role loading failed:', fallbackError);
        myRole.value = null;
        permissions.value = {};
      }
    }

    // Load role-aware overview (with fallback)
    try {
      overview.value = await projectApi.getProjectOverview(route.params.id as string);
    } catch (error) {
      console.warn('Overview endpoint not available, using fallback');
      overview.value = null;
    }

    // Load role-aware lists (with fallback)
    try {
      const [tasksResponse, teamResponse, departmentsResponse] = await Promise.all([
        taskApi.getProjectTasksWithFilter(route.params.id as string, {
          scope: myRole.value === 'PROJECT_OWNER' ? 'all' : myRole.value === 'PROJECT_MANAGER' ? 'department' : 'assigned_to_me'
        }),
        userRoleApi.getAccessibleProjectTeam(route.params.id as string),
        departmentApi.getAccessibleDepartments(route.params.id as string)
      ]);

      tasks.value = tasksResponse?.tasks || [];
      teamMembers.value = Array.isArray(teamResponse) ? teamResponse : (teamResponse.userRoles || teamResponse.data || []);
      departments.value = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse.departments || departmentsResponse.data || []);
    } catch (error) {
      console.warn('Role-aware endpoints not available, using fallback:', error);
      // Fallback: use original endpoints
      const [tasksResponse, teamResponse, departmentsResponse] = await Promise.all([
        taskApi.getProjectTasks(route.params.id as string),
        userRoleApi.getProjectUserRoles(route.params.id as string),
        departmentApi.getProjectDepartments(route.params.id as string)
      ]);

      tasks.value = tasksResponse?.tasks || [];
      teamMembers.value = Array.isArray(teamResponse) ? teamResponse : (teamResponse.userRoles || []);
      departments.value = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse.departments || []);
    }

  } catch (err: any) {
    console.error('Error loading project data:', err);
    error.value = `Failed to load project data: ${err.message || 'Unknown error'}`;
  } finally {
    loading.value = false;
    loadInFlight.value = false;
  }
};

// Helper functions
const getProjectStatus = (project: Project) => {
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  
  if (now < start) return 'PENDING';
  if (now >= start && now <= end) return 'ACTIVE';
  return 'COMPLETED';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'success',
    'PENDING': 'warning',
    'COMPLETED': 'info'
  };
  return colors[status] || 'grey';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending',
    'COMPLETED': 'Completed'
  };
  return labels[status] || status;
};

const getProjectTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'PROGRESSIVE': 'success',
    'PARALLEL': 'warning'
  };
  return colors[type] || 'grey';
};

const getProjectTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'PROGRESSIVE': 'Progressive',
    'PARALLEL': 'Parallel'
  };
  return labels[type] || type;
};

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'LOW': 'success',
    'MEDIUM': 'warning',
    'HIGH': 'error',
    'CRITICAL': 'error'
  };
  return colors[priority] || 'grey';
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical'
  };
  return labels[priority] || priority;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    'CLIENT': 'primary',
    'PROJECT_OWNER': 'primary',
    'PROJECT_MANAGER': 'success',
    'EMPLOYEE': 'info'
  };
  return colors[role] || 'grey';
};

const getUserRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'CLIENT': 'Client',
    'PROJECT_OWNER': 'Project Owner',
    'PROJECT_MANAGER': 'Project Manager',
    'EMPLOYEE': 'Employee'
  };
  return labels[role] || role;
};

const getTaskStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'PENDING': 'warning',
    'IN_PROGRESS': 'info',
    'COMPLETED': 'success',
    'APPROVED': 'success'
  };
  return colors[status] || 'grey';
};

const getTaskStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'APPROVED': 'Approved'
  };
  return labels[status] || status;
};

const getAvatarColor = (name: string) => {
  const colors = ['red', 'purple', 'blue', 'green', 'orange', 'black'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getProjectProgress = () => {
  if (tasks.value.length === 0) return 0;
  const completedTasks = tasks.value.filter(task => 
    task.status === 'COMPLETED' || task.status === 'APPROVED'
  );
  return Math.round((completedTasks.length / tasks.value.length) * 100);
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success';
  if (progress >= 50) return 'warning';
  return 'error';
};

const getCompletedTasksCount = () => {
  return tasks.value.filter(task => 
    task.status === 'COMPLETED' || task.status === 'APPROVED'
  ).length;
};

const formatDate = (date: string | Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Action functions
const openWorkspace = () => {
  router.push(`/projects/${route.params.id}/workspace`);
};

const editProject = () => {
  // TODO: Implement edit project functionality
  console.log('Edit project clicked');
};

const shareProject = () => {
  // TODO: Implement share project functionality
  console.log('Share project clicked');
};

const inviteTeamMember = () => {
  // TODO: Implement invite team member functionality
  console.log('Invite team member clicked');
};

const addDepartment = () => {
  // TODO: Implement add department functionality
  console.log('Add department clicked');
};

// Department helper functions
const getDepartmentTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'MAJOR': 'primary',
    'MINOR': 'secondary'
  };
  return colors[type] || 'grey';
};

const getDepartmentTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'MAJOR': 'mdi-domain',
    'MINOR': 'mdi-domain'
  };
  return icons[type] || 'mdi-domain';
};

const getDepartmentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'MAJOR': 'Major Department',
    'MINOR': 'Minor Department'
  };
  return labels[type] || type;
};

const viewAllTasks = () => {
  // TODO: Navigate to tasks view or show all tasks modal
  console.log('View all tasks clicked');
};

// Lifecycle
onMounted(() => {
  if (user.value?.id && route.params.id) {
    loadProjectData();
  }
});

// Watch for user changes and load data when ready
watch(user, (newUser) => {
  if (newUser && route.params.id) {
    loadProjectData();
  }
}, { immediate: true });

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId && user.value?.id) {
    loadProjectData();
  }
});
</script>

<style scoped>
.project-details {
  background: var(--erp-page-bg);
  min-height: 100vh;
}

/* Hero Section */
.project-hero {
  position: relative;
  background: transparent;
  padding: 3rem 2rem;
  text-align: center;
  overflow: hidden;
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  margin: 1rem 1.5rem;
}

.hero-back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.hero-icon {
  margin-bottom: 0.5rem;
}

.hero-icon .v-icon {
  color: var(--erp-accent-green);
}

.hero-title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0;
  letter-spacing: -0.025em;
  text-align: center;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;
}

.action-btn {
  min-width: 160px;
}

.main-content {
  padding: 0 24px 24px 24px;
}

.border {
  border: 1px solid var(--erp-border);
}

.border-b {
  border-bottom: 1px solid var(--erp-border);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.loading-state .v-progress-circular {
  margin-bottom: 16px;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-bottom: 4px;
}

.meta-value {
  font-weight: 500;
  color: var(--erp-text);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: var(--erp-surface);
  border-radius: 8px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--erp-text);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-bottom: 8px;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.department-card {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.department-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.department-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.department-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--erp-surface);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.department-info {
  flex: 1;
}

.department-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 8px 0;
}

.department-description {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.department-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-count {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  font-weight: 500;
}

.department-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.team-member-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--erp-surface);
  border-radius: 8px;
  border: 1px solid var(--erp-border);
}

.member-avatar {
  margin-right: 12px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 4px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--erp-surface);
  border-radius: 8px;
  border: 1px solid var(--erp-border);
}

.task-info {
  flex: 1;
}

.task-name {
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 4px;
}

.task-description {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.task-priority {
  display: flex;
  justify-content: flex-end;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.timeline-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 24px;
  z-index: 1;
}

.timeline-marker.start {
  background: #10b981;
}

.timeline-marker.current {
  background: #3b82f6;
}

.timeline-marker.end {
  background: #ef4444;
}

.timeline-content {
  flex: 1;
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-bottom: 4px;
}

.timeline-title {
  font-weight: 500;
  color: var(--erp-text);
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-hero {
    padding: 2rem 1rem;
    margin: 0.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
    min-width: auto;
  }

  .main-content {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .departments-grid {
    grid-template-columns: 1fr;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .task-meta {
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .project-hero {
    padding: 1.5rem 0.75rem;
    margin: 0.25rem;
  }

  .hero-icon .v-icon {
    font-size: 36px !important;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .action-btn {
    font-size: 0.875rem;
    padding: 8px 16px;
  }
}
</style>
