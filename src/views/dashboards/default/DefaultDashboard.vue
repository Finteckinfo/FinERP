<script setup lang="ts">
// Import new ERP components
import QuickActions from './components/QuickActions.vue';
import ProjectOverview from './components/ProjectOverview.vue';
import ProjectCard from './components/ProjectCard.vue';
import RecentActivity from './components/RecentActivity.vue';
import EarningsWidget from './components/EarningsWidget.vue';
import ProjectBudgetWidget from './components/ProjectBudgetWidget.vue';
import FINTokenBalance from './components/FINTokenBalance.vue';
import DEXSwap from './components/DEXSwap.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { useNextAuth } from '@/composables/useNextAuth';
import { useRouter } from 'vue-router';

// Import components
import StatsSkeleton from './components/StatsSkeleton.vue';
import ProjectCardSkeleton from './components/ProjectCardSkeleton.vue';
import ActivitySkeleton from './components/ActivitySkeleton.vue';
import OnboardingModal from '@/components/OnboardingModal.vue';
import { RetroGrid } from '@/components/ui/retro-grid';
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue';

// Import centralized API services
import { projectApi, taskApi, userRoleApi, projectInviteApi, type Project, type Task, type UserRole } from '@/services/projectApi';

// Get wallet user and NextAuth user
const { user: walletUser, isConnected } = useMetaMaskWallet();
const { user } = useNextAuth();
const router = useRouter();

// Reactive data with individual loading states
const projects = ref<Project[]>([]);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
const projectStats = ref({
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  teamMembers: 0,
  totalDepartments: 0
});
const recentActivities = ref<any[]>([]);
const weeklyProgress = ref({
  tasksCompletedThisWeek: 0,
  activeProjects: 0
});
const deadlines = ref<any[]>([]);

// Individual loading states for progressive loading
const statsLoading = ref(true);
const projectsLoading = ref(true);
const activitiesLoading = ref(true);
const weeklyProgressLoading = ref(true);
const deadlinesLoading = ref(true);

// Error states
const projectsError = ref<string | null>(null);
const tasksError = ref<string | null>(null);
const teamError = ref<string | null>(null);

// Onboarding state
const showOnboardingModal = ref(false);
const hasCheckedInvites = ref(false);

// Invites state
const pendingInvites = ref<any[]>([]);
const invitesLoading = ref(false);

// Computed properties
const userDisplayName = computed(() => {
  if (user.value?.name) {
    return user.value.name;
  }
  if (user.value?.firstName || user.value?.lastName) {
    return `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim();
  }
  if (user.value?.email) {
    return user.value.email;
  }
  if (walletUser.value?.address) {
    return `User ${walletUser.value.address.slice(0, 6)}...${walletUser.value.address.slice(-4)}`;
  }
  return 'Guest';
});

// No more frontend filtering needed - backend handles it
const hasProjects = computed(() => projects.value.length > 0);

// Helper functions for project status and progress calculation
const getProjectStatus = (project: Project) => {
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  
  if (now < start) return 'PENDING';
  if (now >= start && now <= end) return 'ACTIVE';
  return 'COMPLETED';
};

const getProjectProgress = (projectId: string) => {
  const projectTasks = tasks.value.filter(task => task.departmentId === projectId);
  if (projectTasks.length === 0) return 0;
  
  const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED' || task.status === 'APPROVED');
  return Math.round((completedTasks.length / projectTasks.length) * 100);
};

const getProjectTeamSize = (projectId: string) => {
  return teamMembers.value.filter(member => member.projectId === projectId).length;
};

const getUserRoleInProject = (projectId: string) => {
  if (!user.value?.id) return 'CLIENT';
  
  const userRole = teamMembers.value.find(member => 
    member.projectId === projectId && member.userId === user.value?.id
  );
  return userRole?.role || 'CLIENT';
};

// Helper functions for invites
const getRoleColor = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'primary';
    case 'PROJECT_MANAGER': return 'success';
    case 'EMPLOYEE': return 'info';
    default: return 'grey';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'Owner';
    case 'PROJECT_MANAGER': return 'Manager';
    case 'EMPLOYEE': return 'Employee';
    default: return role;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'mdi-crown';
    case 'PROJECT_MANAGER': return 'mdi-account-tie';
    case 'EMPLOYEE': return 'mdi-account';
    default: return 'mdi-account';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    case 'CRITICAL': return 'error';
    default: return 'grey';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'Low';
    case 'MEDIUM': return 'Medium';
    case 'HIGH': return 'High';
    case 'CRITICAL': return 'Critical';
    default: return priority;
  }
};

const getProjectTypeLabel = (type: string) => {
  switch (type) {
    case 'PROGRESSIVE': return 'Progressive';
    case 'PARALLEL': return 'Parallel';
    case 'SEQUENTIAL': return 'Sequential';
    default: return type;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const formatRelativeDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'tomorrow';
  if (diffInDays < 7) return `${diffInDays} days from now`;
  return date.toLocaleDateString();
};

// Navigation functions
const navigateToProject = (projectId: string) => {
  router.push(`/projects/${projectId}`);
};

const navigateToProjectWorkspace = (projectId: string) => {
  router.push(`/projects/${projectId}/workspace`);
};

const navigateToProjectsList = () => {
  router.push('/projects');
};

const navigateToCreateProject = () => {
  router.push('/projects/create');
};

const viewProjectDetails = (projectId: string) => {
  router.push(`/projects/${projectId}`);
};

const copyInviteLink = (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (invite) {
    const inviteUrl = `${window.location.origin}/invite/${invite.token}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      console.log('Invite link copied to clipboard:', inviteUrl);
      // toast.success('Invite link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy invite link:', err);
      // toast.error('Failed to copy invite link.');
    });
  }
};

// Individual fetch functions using centralized API services
const fetchDashboardStats = async () => {
  if (!user.value?.id) {
    statsLoading.value = false;
    return;
  }
  
  try {
    // Calculate stats from loaded data
    const total = projects.value?.length || 0;
    const active = projects.value?.filter(p => getProjectStatus(p) === 'ACTIVE').length || 0;
    const completed = projects.value?.filter(p => getProjectStatus(p) === 'COMPLETED').length || 0;
    const pending = projects.value?.filter(p => getProjectStatus(p) === 'PENDING').length || 0;
    
    const totalTasks = tasks.value?.length || 0;
    const completedTasks = tasks.value?.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length || 0;
    const pendingTasks = totalTasks - completedTasks;
    
    const projectIds = new Set(projects.value?.map(p => p.id) || []);
    const teamMembersCount = teamMembers.value?.filter(m => projectIds.has(m.projectId)).length || 0;
    const totalDepartments = projects.value?.length || 0; // Simplified for now
    
    projectStats.value = {
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      pendingTasks: pendingTasks,
      teamMembers: teamMembersCount,
      totalDepartments: totalDepartments
    };
  } catch (err) {
    console.warn('Dashboard stats calculation error:', err);
  } finally {
    statsLoading.value = false;
  }
};

const fetchUserProjects = async () => {
  if (!user.value?.id) {
    projectsLoading.value = false;
    return;
  }
  
  try {
    // Load user's projects using new filtered backend endpoint
    const projectsResponse = await projectApi.getUserProjectsSimple();
    projects.value = projectsResponse.projects || projectsResponse || [];
    
    // If no projects from API, add sample data for demonstration
    if (projects.value.length === 0) {
      projects.value = [
        {
          id: 'sample-1',
          name: 'Website Redesign',
          description: 'Modernize the company website with improved UX and mobile responsiveness. This project will enhance user engagement and conversion rates.',
          type: 'PROGRESSIVE',
          priority: 'HIGH',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          ownerId: user.value?.id || 'sample-owner',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: 'sample-2',
          name: 'Mobile App Development',
          description: 'Create a cross-platform mobile application for customer engagement and service delivery. Will support both iOS and Android platforms.',
          type: 'PARALLEL',
          priority: 'CRITICAL',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          ownerId: user.value?.id || 'sample-owner',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        },
        {
          id: 'sample-3',
          name: 'Database Migration',
          description: 'Migrate legacy database systems to modern cloud infrastructure. This will improve performance, scalability, and maintainability.',
          type: 'PROGRESSIVE',
          priority: 'MEDIUM',
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          ownerId: user.value?.id || 'sample-owner',
          createdAt: '2024-02-01',
          updatedAt: '2024-02-01'
        }
      ];
    }
    
    // Load tasks for all projects
    const allTasks: Task[] = [];
    for (const project of projects.value) {
      try {
        const tasksResponse = await taskApi.getProjectTasksWithFilter(project.id, {
          scope: 'all',
          fields: 'minimal',
          sortBy: 'dueDate',
          sortOrder: 'asc',
          limit: 100
        });
        allTasks.push(...(tasksResponse.tasks || []));
      } catch (err) {
        // If API fails, add sample tasks for demonstration
        if (project.id.startsWith('sample-')) {
          allTasks.push(
            {
              id: `task-${project.id}-1`,
              title: 'Project Planning',
              description: 'Initial project setup and planning phase',
              status: 'COMPLETED',
              projectId: project.id,
              departmentId: project.id,
              priority: 'MEDIUM',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-15'
            },
            {
              id: `task-${project.id}-2`,
              title: 'Development Phase',
              description: 'Core development and implementation',
              status: 'IN_PROGRESS',
              projectId: project.id,
              departmentId: project.id,
              priority: 'HIGH',
              createdAt: '2024-01-15',
              updatedAt: '2024-01-15'
            },
            {
              id: `task-${project.id}-3`,
              title: 'Testing & QA',
              description: 'Quality assurance and testing procedures',
              status: 'PENDING',
              projectId: project.id,
              departmentId: project.id,
              priority: 'MEDIUM',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01'
            }
          );
        }
      }
    }
    tasks.value = allTasks;
    
    // Load team members for all projects
    const allTeamMembers: UserRole[] = [];
    for (const project of projects.value) {
      try {
        const teamResponse = await userRoleApi.getProjectUserRoles(project.id);
        allTeamMembers.push(...(teamResponse.userRoles || []));
      } catch (err) {
        // If API fails, add sample team members for demonstration
        if (project.id.startsWith('sample-')) {
          allTeamMembers.push(
            {
              id: `role-${project.id}-1`,
              userId: user.value?.id || 'sample-user',
              projectId: project.id,
              role: 'PROJECT_MANAGER',
              departmentOrder: [],
              departmentScope: [],
              managedDepartments: [],
              accessibleDepartments: [],
              assignedTasks: [],
              createdAt: '2024-01-01',
              user: {
                id: user.value?.id || 'sample-user',
                email: user.value?.email || walletUser.value?.address || 'user@example.com',
                firstName: user.value?.firstName || 'Sample',
                lastName: user.value?.lastName || 'User',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
              }
            }
          );
        }
      }
    }
    teamMembers.value = allTeamMembers;
    
    // Calculate stats immediately after loading projects
    await fetchDashboardStats();
    
  } catch (err) {
    console.warn('User projects API error:', err);
    projectsError.value = 'Failed to load projects. Please try again.';
    
    // Add sample data on error so dashboard isn't empty
    if (projects.value.length === 0) {
      projects.value = [
        {
          id: 'sample-1',
          name: 'Website Redesign',
          description: 'Modernize the company website with improved UX and mobile responsiveness.',
          type: 'PROGRESSIVE',
          priority: 'HIGH',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          ownerId: user.value?.id || 'sample-owner',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];
    }
    
    // Still calculate stats even on error
    await fetchDashboardStats();
  } finally {
    projectsLoading.value = false;
  }
};

const fetchRecentActivities = async () => {
  if (!user.value?.id) {
    activitiesLoading.value = false;
    return;
  }
  
  try {
    // Generate recent activities from project and task data
    const activities: any[] = [];
    
    // Add project creation activities
    projects.value.slice(0, 3).forEach(project => {
      activities.push({
        id: `activity-${project.id}`,
        type: 'project_created',
        title: 'Project Created',
        description: `New project "${project.name}" has been created`,
        projectName: project.name,
        timestamp: new Date(project.createdAt),
        user: userDisplayName.value
      });
    });
    
    // Add task completion activities
    const completedTasks = tasks.value.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED');
    completedTasks.slice(0, 2).forEach(task => {
      const project = projects.value.find(p => p.id === task.departmentId);
      if (project) {
        activities.push({
          id: `activity-${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `Task "${task.title}" has been completed`,
          projectName: project.name,
          timestamp: new Date(task.updatedAt),
          user: userDisplayName.value
        });
      }
    });
    
    // Sort by timestamp and take latest 5
    recentActivities.value = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
      
  } catch (err) {
    console.warn('Recent activities generation error:', err);
  } finally {
    activitiesLoading.value = false;
  }
};

const fetchWeeklyProgress = async () => {
  if (!user.value?.id) {
    weeklyProgressLoading.value = false;
    return;
  }
  
  try {
    // Calculate weekly progress from task data
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const tasksCompletedThisWeek = tasks.value.filter(task => {
      const updatedAt = new Date(task.updatedAt);
      return (task.status === 'COMPLETED' || task.status === 'APPROVED') && 
             updatedAt >= weekAgo && updatedAt <= now;
    }).length;
    
    const activeProjects = projects.value.filter(p => getProjectStatus(p) === 'ACTIVE').length;
    
    weeklyProgress.value = {
      tasksCompletedThisWeek,
      activeProjects
    };
  } catch (err) {
    console.warn('Weekly progress calculation error:', err);
  } finally {
    weeklyProgressLoading.value = false;
  }
};

const fetchDeadlines = async () => {
  if (!user.value?.id) {
    deadlinesLoading.value = false;
    return;
  }
  
  try {
    // Generate deadlines from project end dates
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = projects.value
      .filter(project => {
        const endDate = new Date(project.endDate);
        return endDate > now && endDate <= thirtyDaysFromNow;
      })
      .map(project => ({
        id: `deadline-${project.id}`,
        title: `Complete ${project.name}`,
        projectName: project.name,
        priority: new Date(project.endDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) ? 'urgent' : 'due_soon',
        assignedTo: userDisplayName.value,
        createdAt: new Date(project.createdAt)
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    deadlines.value = upcomingDeadlines.slice(0, 5);
  } catch (err) {
    console.warn('Deadlines generation error:', err);
  } finally {
    deadlinesLoading.value = false;
  }
};

// Load all data independently for progressive loading
const loadAllData = async () => {
  try {
    console.log('Loading all data for user:', user.value?.id);
    
    // First, check backend health
    try {
      const { authApi } = await import('@/services/projectApi');
      const health = await authApi.healthCheck();
      console.log('✅ Backend health check passed:', health);
    } catch (error) {
      console.warn('⚠️ Backend health check failed:', error);
      // Continue anyway - the sync endpoint might still work
    }
    
    await Promise.all([
      fetchUserProjects(),
      fetchRecentActivities(),
      fetchWeeklyProgress(),
      fetchDeadlines()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

const checkUserInvites = async () => {
  if (!user.value?.id || hasCheckedInvites.value) return;
  
  try {
    const response = await projectInviteApi.getUserInvites();
    
    // Handle different response structures
    let invites = [];
    if (response && Array.isArray(response)) {
      invites = response;
    } else if (response && Array.isArray(response.invites)) {
      invites = response.invites;
    } else if (response && Array.isArray(response.data)) {
      invites = response.data;
    }
    
    const pendingInvites = invites.filter((invite: any) => invite.status === 'PENDING');
    
    if (pendingInvites.length > 0) {
      showOnboardingModal.value = true;
    }
    
    hasCheckedInvites.value = true;
  } catch (error) {
    console.error('Failed to check user invites:', error);
    // Don't block the dashboard if invite check fails
  }
};

const handleInviteResponse = (inviteId: string, status: 'ACCEPTED' | 'DECLINED') => {
  console.log(`Invite ${inviteId} ${status.toLowerCase()}`);
  
  if (status === 'ACCEPTED') {
    // Refresh data to show the newly accepted project
    refreshData();
  }
  
  // You could show a toast notification here
};

// Refresh function for manual data reload
const refreshData = () => {
  if (!user.value?.id) return;
  
  // Reset loading states
  statsLoading.value = true;
  projectsLoading.value = true;
  activitiesLoading.value = true;
  weeklyProgressLoading.value = true;
  deadlinesLoading.value = true;
  
  loadAllData();
};

// Invite management functions
const loadPendingInvites = async () => {
  if (!user.value?.id) return;
  
  invitesLoading.value = true;
  try {
    // Use the new backend API endpoint
    const response = await projectInviteApi.getUserInvites();
    console.log('Invites API response:', response);
    
    // Handle different response structures
    let invites = [];
    if (response && Array.isArray(response)) {
      invites = response;
    } else if (response && Array.isArray(response.invites)) {
      invites = response.invites;
    } else if (response && Array.isArray(response.data)) {
      invites = response.data;
    }
    
    // Filter for pending invites and add loading state
    pendingInvites.value = invites
      .filter((invite: any) => invite.status === 'PENDING')
      .map((invite: any) => ({
        ...invite,
        loading: false
      }));
    
    console.log('Filtered pending invites:', pendingInvites.value);
  } catch (error: any) {
    console.error('Failed to load invites:', error);
    // Show error but don't clear existing invites
    if (error.response?.status === 401) {
      console.warn('Authentication failed - user may need to re-login');
    } else if (error.response?.status === 404) {
      console.warn('Invites endpoint not found - backend may not be fully implemented');
    }
  } finally {
    invitesLoading.value = false;
  }
};

const refreshInvites = () => {
  loadPendingInvites();
};

const goToAllInvitations = () => {
  router.push('/invitations');
};

const acceptInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;
  
  invite.loading = true;
  try {
    console.log('Accepting invite:', inviteId);
    
    // Use the new backend API endpoint
    await projectInviteApi.acceptInvite(inviteId);
    
    // Show success feedback
    console.log('Invite accepted successfully');
    
    // Remove from pending list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    
    // Refresh project data since user now has access to new project
    refreshData();
    
    // Show success notification (you can add a toast system here)
    // toast.success('Project invitation accepted successfully!');
    
  } catch (error: any) {
    console.error('Failed to accept invite:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('Invite not found - may have been deleted or expired');
      // Remove from list if invite no longer exists
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    } else if (error.response?.status === 403) {
      console.error('Access denied - user may not have permission to accept this invite');
    } else if (error.response?.status === 409) {
      console.error('Conflict - invite may have already been accepted or declined');
      // Remove from list if invite is no longer valid
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    }
    
    // Show error notification
    // toast.error('Failed to accept invitation. Please try again.');
    
  } finally {
    invite.loading = false;
  }
};

const declineInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;
  
  invite.loading = true;
  try {
    console.log('Declining invite:', inviteId);
    
    // Use the new backend API endpoint
    await projectInviteApi.declineInvite(inviteId);
    
    // Show success feedback
    console.log('Invite declined successfully');
    
    // Remove from pending list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    
    // Show success notification
    // toast.success('Project invitation declined.');
    
  } catch (error: any) {
    console.error('Failed to decline invite:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('Invite not found - may have been deleted or expired');
      // Remove from list if invite no longer exists
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    } else if (error.response?.status === 403) {
      console.error('Access denied - user may not have permission to decline this invite');
    } else if (error.response?.status === 409) {
      console.error('Conflict - invite may have already been accepted or declined');
      // Remove from list if invite is no longer valid
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    }
    
    // Show error notification
    // toast.error('Failed to decline invitation. Please try again.');
    
  } finally {
    invite.loading = false;
  }
};

// Watch for user availability - single consolidated watcher
watch(() => walletUser.value?.address, (newAddress, oldAddress) => {
  if (newAddress && newAddress !== oldAddress) {
    console.log('[Dashboard] Wallet address changed, loading data...', newAddress);
    loadAllData();
    loadPendingInvites();
  }
}, { immediate: true });

// Watch for projects data to calculate stats
watch(projects, () => {
  if (projects.value.length > 0) {
    fetchDashboardStats();
  }
}, { immediate: true });

// Load data when component mounts
onMounted(() => {
  console.log('[Dashboard] Component mounted, user:', user.value?.id, 'wallet:', walletUser.value?.address);
  if (user.value?.id) {
    loadAllData();
    loadPendingInvites();
  }
});
</script>

<template>
  <div class="erp-dashboard">
    <!-- Welcome Header - Always visible -->
    <div class="welcome-header mb-6">
      <RetroGrid />
      <h1 class="text-h3 font-weight-bold mb-2">
        Welcome back, {{ userDisplayName }}! 👋
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Here's what's happening with your projects today
      </p>
    </div>

    <!-- Project Overview Stats - Progressive loading -->
    <v-row class="mb-6">
      <v-col cols="12">
        <StatsSkeleton v-if="statsLoading" />
        <ProjectOverview v-else :stats="projectStats" />
      </v-col>
    </v-row>

      <!-- Earnings, Budget & FIN Token Balance Widgets -->
    <v-row class="mb-6">
      <!-- Earnings Widget (for employees) -->
      <v-col cols="12" md="4">
        <EarningsWidget />
      </v-col>
      
      <!-- Budget Widget (for project owners/managers) -->
      <v-col cols="12" md="4">
        <ProjectBudgetWidget :project-ids="projects.map(p => p.id)" />
      </v-col>

      <!-- FIN Token Balance Widget -->
      <v-col cols="12" md="4">
        <FINTokenBalance />
      </v-col>
    </v-row>

    <!-- DEX Swap Widget -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <DEXSwap />
      </v-col>
      <v-col cols="12" md="6">
        <!-- Additional widget space - could add portfolio or transaction history -->
      </v-col>
    </v-row>

    <!-- Projects Grid - Progressive loading -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="projects-header-section mb-4">
          <h3 class="text-h4 font-weight-medium mb-3 mb-md-0">My Projects</h3>
          <div class="project-actions">
            <v-btn 
              color="secondary" 
              variant="outlined" 
              prepend-icon="mdi-refresh" 
              :loading="projectsLoading"
              @click="refreshData"
              size="small"
            >
              Refresh
            </v-btn>
            <v-btn 
              color="secondary" 
              variant="outlined" 
              prepend-icon="mdi-view-column" 
              @click="navigateToProjectsList"
              size="small"
            >
              View All Projects
            </v-btn>
            <v-btn 
              color="primary" 
              variant="flat" 
              prepend-icon="mdi-plus" 
              @click="navigateToCreateProject"
              size="small"
            >
              Create New Project
            </v-btn>
          </div>
        </div>

        <!-- Error State for Projects -->
        <div v-if="projectsError" class="mb-4">
          <v-alert type="error" class="mb-4">
            {{ projectsError }}
            <template v-slot:append>
              <v-btn color="error" variant="text" @click="refreshData">
                Retry
              </v-btn>
            </template>
          </v-alert>
        </div>

        <!-- Loading skeleton for projects -->
        <v-row v-if="projectsLoading">
          <v-col v-for="i in 4" :key="i" cols="12" sm="6" lg="6">
            <ProjectCardSkeleton />
    </v-col>
        </v-row>

        <!-- No Projects State -->
        <div v-else-if="!hasProjects" class="text-center pa-8">
          <v-avatar size="80" color="grey-lighten-3" class="mb-4">
            <span class="text-h4">📁</span>
          </v-avatar>
          <h5 class="text-h5 text-medium-emphasis mb-2">No Projects Yet</h5>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Start by creating your first project or joining an existing one
          </p>
          <v-btn color="primary" variant="flat" @click="navigateToCreateProject">
            Create Your First Project
          </v-btn>
        </div>

        <!-- Sample Data Notice -->
        <div v-if="projects.some(p => p.id && p.id.startsWith('sample-'))" class="mb-4">
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <strong>Demo Mode:</strong> You're currently viewing sample project data. 
            <v-btn color="info" variant="text" @click="navigateToCreateProject" class="ml-2">
              Create your own project
            </v-btn>
            to get started with real data.
          </v-alert>
        </div>

        <!-- Projects Grid -->
        <v-row v-else>
          <v-col v-for="project in projects" :key="project.id" cols="12" sm="6" lg="6">
            <ProjectCard 
              :project="project" 
              :tasks="tasks" 
              :team-members="teamMembers" 
              :user-role="getUserRoleInProject(project.id)"
            />
          </v-col>
        </v-row>
    </v-col>
    </v-row>

    <!-- Project Invites Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="0" class="invites-section" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
          <v-card-title class="pa-4 pb-2">
            <!-- Desktop Layout: Horizontal -->
            <div class="desktop-layout d-none d-md-flex align-center">
              <v-icon class="mr-3" size="24" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-email-outline</v-icon>
              <span class="text-h5 font-weight-medium">Project Invitations</span>
              <v-chip 
                v-if="pendingInvites.length > 0" 
                size="small" 
                class="ml-3"
                :style="{ background: 'color-mix(in srgb, var(--erp-accent-green) 20%, transparent)', color: 'var(--erp-text)' }"
              >
                {{ pendingInvites.length }} Pending
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn 
                v-if="pendingInvites.length > 0"
                variant="tonal" 
                size="small"
                @click="refreshInvites"
                :loading="invitesLoading"
                :style="{ background: 'color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent)', color: 'var(--erp-text)' }"
              >
                <v-icon>mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </div>
            
            <!-- Mobile Layout: Vertical Stack -->
            <div class="mobile-layout d-md-none">
              <!-- Title Row -->
              <div class="d-flex align-center mb-3">
                <v-icon class="mr-3" size="24" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-email-outline</v-icon>
                <span class="text-h5 font-weight-medium">Project Invitations</span>
              </div>
              
              <!-- Actions Row -->
              <div class="d-flex align-center justify-space-between">
                <v-chip 
                  v-if="pendingInvites.length > 0" 
                  size="small"
                  :style="{ background: 'color-mix(in srgb, var(--erp-accent-green) 20%, transparent)', color: 'var(--erp-text)' }"
                >
                  {{ pendingInvites.length }} Pending
                </v-chip>
                <v-btn 
                  v-if="pendingInvites.length > 0"
                  variant="tonal" 
                  size="small"
                  @click="refreshInvites"
                  :loading="invitesLoading"
                  :style="{ background: 'color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent)', color: 'var(--erp-text)' }"
                >
                  <v-icon>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <!-- Loading State -->
            <div v-if="invitesLoading" class="text-center pa-6">
              <v-progress-circular indeterminate size="32" :style="{ '--v-theme-primary': 'var(--erp-accent-indigo)' }"></v-progress-circular>
              <p class="text-body-2 text-medium-emphasis mt-3">Loading invitations...</p>
            </div>

            <!-- No Invites State -->
            <div v-else-if="pendingInvites.length === 0" class="text-center pa-6">
              <v-avatar size="80" class="mb-4" :style="{ background: 'var(--erp-surface)' }">
                <v-icon size="40" :style="{ color: 'var(--erp-border)' }">mdi-email-check</v-icon>
              </v-avatar>
              <h6 class="text-h6 text-medium-emphasis mb-2">No Pending Invitations</h6>
              <p class="text-body-2 text-medium-emphasis mb-4">
                You're all caught up! No project invitations waiting for your response.
              </p>
              <v-btn 
                variant="outlined" 
                size="small"
                @click="refreshInvites"
                :loading="invitesLoading"
                :style="{ color: 'var(--erp-text)', borderColor: 'var(--erp-border)' }"
              >
                <v-icon size="16" class="mr-1">mdi-refresh</v-icon>
                Check for New Invites
              </v-btn>
            </div>

            <!-- Invites List -->
            <div v-else class="invites-list">
              <div 
                v-for="invite in pendingInvites.slice(0, 3)" 
                :key="invite.id"
                class="invite-card mb-4"
              >
                <v-card variant="outlined" class="invite-item" elevation="1" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start justify-space-between">
                      <div class="invite-info flex-grow-1">
                        <!-- Role and Priority Chips -->
                        <div class="d-flex align-center mb-3">
                          <v-chip 
                            size="small" 
                            class="mr-3"
                            variant="flat"
                            :style="{ background: 'var(--erp-accent-indigo)', color: '#fff' }"
                          >
                            <v-icon size="16" class="mr-1">{{ getRoleIcon(invite.role) }}</v-icon>
                            {{ getRoleLabel(invite.role) }}
                          </v-chip>
                          <v-chip 
                            size="small" 
                            variant="tonal"
                            :style="{ background: 'color-mix(in srgb, var(--erp-accent-green) 20%, transparent)', color: 'var(--erp-text)' }"
                          >
                            <v-icon size="16" class="mr-1">mdi-flag</v-icon>
                            {{ getPriorityLabel(invite.project?.priority || 'MEDIUM') }}
                          </v-chip>
                          <v-chip 
                            v-if="invite.expiresAt" 
                            size="small" 
                            variant="outlined"
                            class="ml-3"
                            :style="{ color: 'var(--erp-text)', borderColor: 'var(--erp-border)' }"
                          >
                            <v-icon size="16" class="mr-1">mdi-clock</v-icon>
                            Expires {{ formatRelativeDate(invite.expiresAt) }}
                          </v-chip>
                        </div>
                        
                        <!-- Project Name and Description -->
                        <h6 class="text-h6 font-weight-medium mb-2">
                          {{ invite.project?.name || 'Project' }}
                        </h6>
                        
                        <p v-if="invite.project?.description" class="text-body-2 text-medium-emphasis mb-3">
                          {{ invite.project.description }}
                        </p>
                        
                        <!-- Project Details -->
                        <div class="invite-details d-flex align-center text-caption text-medium-emphasis mb-3">
                          <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-calendar</v-icon>
                          <span class="mr-4">
                            {{ formatDate(invite.project?.startDate) }} - {{ formatDate(invite.project?.endDate) }}
                          </span>
                          <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-email</v-icon>
                          <span>{{ invite.email }}</span>
                        </div>
                        
                        <!-- Invitation Message -->
                        <div v-if="invite.message" class="invite-message mb-3">
                          <v-card variant="tonal" class="pa-3" :style="{ background: 'var(--erp-surface)', border: '1px solid var(--erp-border)' }">
                            <div class="d-flex align-start">
                              <v-icon size="16" class="mr-2 mt-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-message-text</v-icon>
                              <p class="text-body-2 text-medium-emphasis mb-0">
                                <em>"{{ invite.message }}"</em>
                              </p>
                            </div>
                          </v-card>
                        </div>
                        
                        <!-- Project Stats Preview -->
                        <div class="project-stats-preview d-flex align-center text-caption text-medium-emphasis">
                          <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-green)' }">mdi-account-group</v-icon>
                          <span class="mr-4">Team: {{ invite.project?.teamSize || 'N/A' }}</span>
                          <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-folder</v-icon>
                          <span>Type: {{ getProjectTypeLabel(invite.project?.type || 'PROGRESSIVE') }}</span>
                        </div>
                      </div>
                      
                      <!-- Action Buttons -->
                      <div class="invite-actions d-flex flex-column gap-2 ml-4">
                        <v-btn 
                          variant="flat" 
                          size="small"
                          :loading="invite.loading"
                          @click="acceptInvite(invite.id)"
                          class="accept-btn"
                          :style="{ background: 'var(--erp-accent-green)', color: '#fff' }"
                        >
                          <v-icon size="16" class="mr-1">mdi-check</v-icon>
                          Accept
                        </v-btn>
                        <v-btn 
                          variant="outlined" 
                          size="small"
                          :loading="invite.loading"
                          @click="declineInvite(invite.id)"
                          class="decline-btn"
                          :style="{ color: 'var(--erp-text)', borderColor: 'var(--erp-border)' }"
                        >
                          <v-icon size="16" class="mr-1">mdi-close</v-icon>
                          Decline
                        </v-btn>
                        
                        <!-- Additional Actions -->
                        <v-menu>
                          <template v-slot:activator="{ props }">
                            <v-btn 
                              icon 
                              size="small" 
                              variant="text"
                              v-bind="props"
                              color="grey"
                            >
                              <v-icon size="16">mdi-dots-vertical</v-icon>
                            </v-btn>
                          </template>
                          <v-list :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                            <v-list-item @click="viewProjectDetails(invite.project?.id)">
                              <v-list-item-title>
                                <v-icon size="16" class="mr-2">mdi-eye</v-icon>
                                View Project
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="copyInviteLink(invite.id)">
                              <v-list-item-title>
                                <v-icon size="16" class="mr-2">mdi-link</v-icon>
                                Copy Link
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
              
              <!-- View All Button -->
              <div v-if="pendingInvites.length > 3" class="text-center mt-4">
                <v-btn 
                  variant="outlined" 
                  size="large"
                  @click="goToAllInvitations"
                  :style="{ color: 'var(--erp-text)', borderColor: 'var(--erp-border)' }"
                >
                  <v-icon size="20" class="mr-2">mdi-email-multiple</v-icon>
                  View All {{ pendingInvites.length }} Invitations
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity and Quick Stats - Progressive loading -->
    <v-row>
    <v-col cols="12" lg="8">
        <ActivitySkeleton v-if="activitiesLoading" />
        <RecentActivity v-else :activities="recentActivities" />
    </v-col>

    <v-col cols="12" lg="4">
        <!-- Weekly Progress Card - Progressive loading -->
        <v-card elevation="0" class="mb-4">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-avatar size="50" color="success" class="mb-3">
                <span class="text-h4 text-white">📈</span>
              </v-avatar>
              <h5 class="text-h5 font-weight-medium mb-2">This Week's Progress</h5>
              
              <!-- Loading skeleton for weekly progress -->
              <div v-if="weeklyProgressLoading" class="d-flex justify-space-around">
                <div class="text-center">
                  <div class="skeleton-text mb-1" style="width: 40px; height: 32px; border-radius: 4px; margin: 0 auto;"></div>
                  <p class="text-caption text-medium-emphasis">Tasks Done</p>
                </div>
                <div class="text-center">
                  <div class="skeleton-text mb-1" style="width: 40px; height: 32px; border-radius: 4px; margin: 0 auto;"></div>
                  <p class="text-caption text-medium-emphasis">Projects Active</p>
                </div>
              </div>
              
              <!-- Weekly progress data -->
              <div v-else class="d-flex justify-space-around">
                <div class="text-center">
                  <h6 class="text-h4 font-weight-bold text-success">{{ weeklyProgress.tasksCompletedThisWeek }}</h6>
                  <p class="text-caption text-medium-emphasis">Tasks Done</p>
                </div>
                <div class="text-center">
                  <h6 class="text-h4 font-weight-bold text-primary">{{ weeklyProgress.activeProjects }}</h6>
                  <p class="text-caption text-medium-emphasis">Projects Active</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Deadlines Card - Progressive loading -->
        <v-card elevation="0">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-avatar size="50" color="warning" class="mb-3">
                <span class="text-h4 text-white">⏰</span>
              </v-avatar>
              <h5 class="text-h5 font-weight-medium mb-2">Upcoming Deadlines</h5>
              <div class="text-left">
                <!-- Loading skeleton for deadlines -->
                <div v-if="deadlinesLoading" class="text-center pa-4">
                  <div v-for="i in 3" :key="i" class="d-flex align-center mb-3">
                    <div class="skeleton-chip mr-2" style="width: 60px; height: 20px; border-radius: 10px;"></div>
                    <div class="skeleton-text" style="width: 120px; height: 16px; border-radius: 4px;"></div>
                  </div>
                </div>
                
                <!-- No deadlines -->
                <div v-else-if="deadlines.length === 0" class="text-center pa-4">
                  <p class="text-body-2 text-medium-emphasis">No urgent deadlines</p>
                </div>
                
                <!-- Deadlines list -->
                <div v-else>
                  <div
                    v-for="deadline in deadlines.slice(0, 3)"
                    :key="deadline.id"
                    class="d-flex align-center mb-3"
                  >
                    <v-chip
                      size="small"
                      :style="{ background: deadline.priority === 'urgent' ? 'var(--erp-accent-indigo)' : 'color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent)', color: '#fff' }"
                      class="mr-2"
                    >
                      {{ deadline.priority === 'urgent' ? 'Urgent' : 'Due Soon' }}
                    </v-chip>
                    <span class="text-body-2">{{ deadline.projectName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
    </v-col>
  </v-row>
  <!-- Quick Actions Section - Always visible (static content) -->
  <v-row class="mb-6">
      <v-col cols="12">
        <QuickActions />
      </v-col>
    </v-row>
  <!-- Onboarding Modal for Project Invitations -->
  <OnboardingModal
    v-model="showOnboardingModal"
    @invite-responded="handleInviteResponse"
  />
  
  <!-- Connect Wallet Modal - Required for SizTokenBalance component -->
  <ConnectWallet />
  </div>
</template>

<style scoped>
.erp-dashboard {
  padding: 24px;
}

/* Remove padding on small screens to give more space */
@media (max-width: 768px) {
  .erp-dashboard {
    padding: 8px; /* Minimal padding for small screens */
  }
}

@media (max-width: 480px) {
  .erp-dashboard {
    padding: 4px; /* Even less padding for very small screens */
  }
  
  .welcome-header {
    padding: 20px; /* Reduce welcome header padding on very small screens */
    margin-bottom: 20px;
  }
}

.welcome-header {
  position: relative;
  background: transparent;
  color: var(--erp-text);
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  overflow: hidden;
  z-index: 1;
  border: 1px solid var(--erp-border);
}

.welcome-header h1,
.welcome-header p {
  position: relative;
  z-index: 2;
}

/* Dashboard-wide defaults for cards, lists, dividers */
.erp-dashboard :deep(.v-card) {
  background-color: var(--erp-card-bg) !important;
  color: var(--erp-text) !important;
  border: 1px solid var(--erp-border) !important;
}
/* Do not affect special header/quick actions */
.erp-dashboard :deep(.welcome-header),
.erp-dashboard :deep(.qa-root) {
  border: none !important;
}

.erp-dashboard :deep(.v-divider) {
  border-color: var(--erp-border) !important;
}

.erp-dashboard :deep(.v-list-item) {
  color: var(--erp-text) !important;
}
.erp-dashboard :deep(.v-list-item:hover) {
  background: var(--erp-surface) !important;
}

.skeleton-text,
.skeleton-chip {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark-theme .skeleton-text,
.dark-theme .skeleton-chip {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Invites Section Styles */
.invites-section {
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
}

/* Responsive Layout Control */
.desktop-layout {
  display: flex;
}

.mobile-layout {
  display: none;
}

@media (max-width: 768px) {
  .desktop-layout {
    display: none !important;
  }
  
  .mobile-layout {
    display: flex !important;
    flex-direction: column;
  }
  
  /* Ensure proper stacking on mobile */
  .mobile-layout .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .mobile-layout .d-flex.justify-space-between {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}

.invite-card {
  transition: all 0.3s ease;
}

.invite-item {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgb(var(--v-theme-outline));
  background: white;
}

.invite-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
  border-color: rgb(var(--v-theme-primary));
}

.invite-info {
  min-width: 0;
}

.invite-details {
  opacity: 0.8;
}

.invite-actions {
  min-width: 120px;
}

.invites-list {
  /* Remove max-height and overflow to prevent scrollbars */
  padding-right: 0;
}

/* Invite Message Styling */
.invite-message {
  border-left: 3px solid rgb(var(--v-theme-info));
}

/* Action Button Styling */
.accept-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
}

.decline-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
}

/* Role and Priority Chip Styling */
.invite-item .v-chip {
  font-weight: 500;
  text-transform: none;
}

/* Project Stats Preview */
.project-stats-preview {
  padding: 8px 0;
  border-top: 1px solid rgb(var(--v-theme-outline));
  margin-top: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .invites-section {
    margin: 0 -4px; /* Extend to screen edges with minimal margin */
    border-radius: 0;
  }
  
  .invite-item {
    margin: 0 -2px; /* Extend invitation cards slightly */
    border-radius: 8px;
    margin-bottom: 16px; /* Increase spacing between cards */
  }
  
  .invite-card {
    margin-bottom: 20px; /* More space between invitation cards */
  }
  
  .invite-actions {
    min-width: 100px;
  }
  
  .invite-item .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .invite-actions {
    margin-left: 0 !important;
    margin-top: 16px;
    flex-direction: row !important;
    width: 100%;
    justify-content: space-between;
  }
  
  .invite-info {
    width: 100%;
  }
  
  .invite-details {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .project-stats-preview {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  /* Additional spacing improvements for invitation section */
  .invites-section .v-card-title {
    padding: 16px !important; /* Reduce title padding */
  }
  
  .invites-section .v-card-text {
    padding: 16px !important; /* Reduce content padding */
  }
  
  /* Increase spacing between invitation elements */
  .invite-item .v-card-text {
    padding: 20px !important; /* More internal padding for better spacing */
  }

  /* Stack project actions vertically on mobile */
  .projects-header-section {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
  
  .project-actions {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.5rem !important;
    width: 100%;
    margin-top: 0.75rem;
  }
  
  .project-actions .v-btn {
    width: 100%;
    justify-content: flex-start !important;
  }
}

/* Desktop and larger screens */
@media (min-width: 769px) {
  .projects-header-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .project-actions {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
  }
}
</style>
