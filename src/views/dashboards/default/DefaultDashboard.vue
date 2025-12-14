<script setup lang="ts">
/**
 * FinERP Modern Dashboard
 * Clean, essential widgets only - inspired by modern ERPs like Linear, Notion, Asana
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet';
import { useRouter } from 'vue-router';
import { supabase, isSupabaseOnly } from '@/services/supabase';

// Components
import FINTokenBalance from './components/FINTokenBalance.vue';
import DEXSwap from './components/DEXSwap.vue';

const router = useRouter();
const { user: walletUser, isConnected, connect } = useMetaMaskWallet();

// State
const projects = ref<any[]>([]);
const tasks = ref<any[]>([]);
const loading = ref(true);
const showCreateProject = ref(false);
const newProjectTitle = ref('');
const newProjectDescription = ref('');
const creatingProject = ref(false);

// Computed
const userDisplayName = computed(() => {
  if (walletUser.value?.address) {
    const addr = walletUser.value.address;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }
  return 'Guest';
});

const stats = computed(() => {
  const activeProjects = projects.value.filter(p => p.status === 'active').length;
  const totalTasks = tasks.value.length;
  const completedTasks = tasks.value.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
  const pendingTasks = tasks.value.filter(t => t.status === 'PENDING' || t.status === 'TODO').length;
  
  return {
    activeProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  };
});

const recentProjects = computed(() => {
  return projects.value.slice(0, 4);
});

const upcomingTasks = computed(() => {
  return tasks.value
    .filter(t => t.status !== 'COMPLETED' && t.status !== 'APPROVED')
    .slice(0, 5);
});

// Functions
async function loadData() {
  loading.value = true;
  try {
    if (isSupabaseOnly && supabase) {
      // Load projects from Supabase
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      projects.value = projectsData || [];
      
      // Load tasks from Supabase
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false });
      
      tasks.value = tasksData || [];
    }
  } catch (err) {
    console.error('[Dashboard] Failed to load data:', err);
  } finally {
    loading.value = false;
  }
}

async function createProject() {
  if (!newProjectTitle.value.trim()) return;
  
  creatingProject.value = true;
  try {
    if (isSupabaseOnly && supabase) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: newProjectTitle.value.trim(),
          description: newProjectDescription.value.trim() || null,
          status: 'active'
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      showCreateProject.value = false;
      newProjectTitle.value = '';
      newProjectDescription.value = '';
      
      // Navigate to the new project's kanban
      router.push({ path: '/kanban', query: { projectId: data.id } });
    }
  } catch (err) {
    console.error('[Dashboard] Failed to create project:', err);
  } finally {
    creatingProject.value = false;
  }
}

function navigateToKanban(projectId: string) {
  router.push({ path: '/kanban', query: { projectId } });
}

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'success';
    case 'IN_PROGRESS':
      return 'info';
    case 'PENDING':
    case 'TODO':
      return 'warning';
    default:
      return 'grey';
  }
}

function getPriorityIcon(priority: string) {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
    case 'CRITICAL':
      return 'mdi-flag';
    case 'MEDIUM':
      return 'mdi-flag-outline';
    default:
      return 'mdi-flag-minus-outline';
  }
}

// Watch for wallet connection
watch(isConnected, (connected) => {
  if (connected) {
    loadData();
  }
});

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="fin-dashboard">
    <!-- Hero Header -->
    <header class="dash-hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Welcome back<span v-if="isConnected">, {{ userDisplayName }}</span></h1>
          <p>Your project command center</p>
    </div>
        <div class="hero-actions">
            <v-btn 
            v-if="!isConnected"
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-wallet"
            @click="connect"
            class="connect-btn"
          >
            Connect Wallet
            </v-btn>
            <v-btn 
            v-else
              color="primary" 
              variant="flat" 
            size="large"
              prepend-icon="mdi-plus" 
            @click="showCreateProject = true"
            class="create-btn"
            >
            New Project
            </v-btn>
          </div>
        </div>
    </header>

    <!-- Stats Row -->
    <section class="stats-row" v-if="!loading">
      <div class="stat-card">
        <div class="stat-icon projects">
          <v-icon>mdi-folder-multiple</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.activeProjects }}</span>
          <span class="stat-label">Active Projects</span>
        </div>
        </div>

      <div class="stat-card">
        <div class="stat-icon tasks">
          <v-icon>mdi-checkbox-marked-circle-outline</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.completedTasks }}/{{ stats.totalTasks }}</span>
          <span class="stat-label">Tasks Done</span>
        </div>
        </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <v-icon>mdi-clock-outline</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pendingTasks }}</span>
          <span class="stat-label">Pending</span>
        </div>
            </div>
            
      <div class="stat-card">
        <div class="stat-icon rate">
          <v-icon>mdi-chart-arc</v-icon>
              </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.completionRate }}%</span>
          <span class="stat-label">Completion</span>
        </div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="dash-grid">
      <!-- Projects Section -->
      <section class="dash-section projects-section">
        <div class="section-header">
          <h2>
            <v-icon class="section-icon">mdi-folder-star</v-icon>
            Projects
          </h2>
                <v-btn 
            variant="text"
            color="primary"
                  size="small"
            @click="showCreateProject = true"
                >
            + New
                </v-btn>
              </div>

        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate size="32"></v-progress-circular>
            </div>

        <div v-else-if="recentProjects.length === 0" class="empty-state">
          <v-icon size="48" color="grey-lighten-1">mdi-folder-plus-outline</v-icon>
          <p>No projects yet</p>
              <v-btn 
            variant="tonal"
            color="primary"
                size="small"
            @click="showCreateProject = true"
              >
            Create your first project
              </v-btn>
            </div>

        <div v-else class="projects-grid">
          <div
            v-for="project in recentProjects"
            :key="project.id"
            class="project-card"
            @click="navigateToKanban(project.id)"
          >
            <div class="project-header">
              <div class="project-avatar">
                {{ project.title?.charAt(0)?.toUpperCase() || 'P' }}
                        </div>
              <div class="project-info">
                <h3>{{ project.title }}</h3>
                <span class="project-status" :class="project.status">
                  {{ project.status || 'active' }}
                          </span>
                        </div>
            </div>
            <p class="project-desc" v-if="project.description">
              {{ project.description }}
            </p>
            <div class="project-meta">
              <span>
                <v-icon size="14">mdi-calendar</v-icon>
                {{ new Date(project.created_at).toLocaleDateString() }}
              </span>
                            </div>
                        </div>
                        </div>
      </section>

      <!-- Tasks Section -->
      <section class="dash-section tasks-section">
        <div class="section-header">
          <h2>
            <v-icon class="section-icon">mdi-format-list-checks</v-icon>
            Upcoming Tasks
          </h2>
                        <v-btn 
            variant="text"
            color="primary"
                          size="small"
            :to="{ path: '/kanban' }"
                        >
            View All
                        </v-btn>
        </div>

        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate size="32"></v-progress-circular>
                      </div>

        <div v-else-if="upcomingTasks.length === 0" class="empty-state">
          <v-icon size="48" color="grey-lighten-1">mdi-check-all</v-icon>
          <p>All caught up!</p>
              </div>
              
        <div v-else class="tasks-list">
          <div
            v-for="task in upcomingTasks"
            :key="task.id"
            class="task-item"
          >
            <div class="task-status">
              <v-icon :color="getStatusColor(task.status)" size="18">
                mdi-circle
              </v-icon>
              </div>
            <div class="task-content">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-meta">
                <v-icon size="12" :color="task.priority === 'HIGH' ? 'error' : 'grey'">
                  {{ getPriorityIcon(task.priority) }}
                </v-icon>
                {{ task.status?.replace('_', ' ') }}
              </span>
            </div>
                </div>
                </div>
      </section>

      <!-- Wallet Section -->
      <section class="dash-section wallet-section">
        <div class="section-header">
          <h2>
            <v-icon class="section-icon">mdi-wallet</v-icon>
            Wallet
          </h2>
                </div>
        <FINTokenBalance />
      </section>

      <!-- DEX Section -->
      <section class="dash-section dex-section">
        <div class="section-header">
          <h2>
            <v-icon class="section-icon">mdi-swap-horizontal</v-icon>
            Swap
          </h2>
                  </div>
        <DEXSwap />
      </section>
                </div>
                
    <!-- Create Project Dialog -->
    <v-dialog v-model="showCreateProject" max-width="500" persistent>
      <v-card class="create-dialog">
        <v-card-title class="dialog-title">
          <v-icon class="mr-2">mdi-folder-plus</v-icon>
          Create New Project
        </v-card-title>
        
        <v-card-text>
          <v-text-field
            v-model="newProjectTitle"
            label="Project Name"
            placeholder="e.g., Website Redesign"
            variant="outlined"
            autofocus
            class="mb-4"
          ></v-text-field>
          
          <v-textarea
            v-model="newProjectDescription"
            label="Description (optional)"
            placeholder="Brief project description..."
            variant="outlined"
            rows="3"
          ></v-textarea>
        </v-card-text>
        
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showCreateProject = false"
            :disabled="creatingProject"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="creatingProject"
            :disabled="!newProjectTitle.trim()"
            @click="createProject"
          >
            Create Project
          </v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.fin-dashboard {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* Hero Header */
.dash-hero {
  background: linear-gradient(135deg, var(--erp-accent-indigo) 0%, #6366f1 50%, #8b5cf6 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.dash-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.hero-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
}

.hero-text p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.connect-btn,
.create-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff !important;
  font-weight: 600;
  text-transform: none;
  padding: 12px 24px;
}

.connect-btn:hover,
.create-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.projects { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
.stat-icon.tasks { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.stat-icon.pending { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.stat-icon.rate { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--erp-text-muted);
}

/* Main Grid */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }
}

/* Sections */
.dash-section {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--erp-text);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-icon {
  font-size: 20px;
  opacity: 0.7;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}

.project-card {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: var(--erp-accent-indigo);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.project-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--erp-accent-indigo), #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.project-info h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.project-status {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.project-status.completed {
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

.project-desc {
  font-size: 0.85rem;
  color: var(--erp-text-muted);
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-meta {
  font-size: 0.75rem;
  color: var(--erp-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Tasks List */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.task-item:hover {
  border-color: var(--erp-accent-indigo);
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.task-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--erp-text);
}

.task-meta {
  font-size: 0.75rem;
  color: var(--erp-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

/* Empty & Loading States */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--erp-text-muted);
}

.empty-state p {
  margin: 12px 0;
}

/* Wallet & DEX Sections */
.wallet-section,
.dex-section {
  padding: 0;
  overflow: hidden;
}

.wallet-section .section-header,
.dex-section .section-header {
  padding: 20px 24px 0;
}

.wallet-section :deep(.v-card),
.dex-section :deep(.v-card) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* Create Dialog */
.create-dialog {
  background: var(--erp-card-bg) !important;
  color: var(--erp-text) !important;
  border-radius: 16px !important;
}

.dialog-title {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  padding: 24px 24px 16px !important;
  display: flex;
  align-items: center;
}

/* Responsive Hero */
@media (max-width: 600px) {
  .dash-hero {
    padding: 24px;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-text h1 {
    font-size: 1.5rem;
  }
}

/* Button Responsiveness */
@media (max-width: 768px) {
  .connect-btn,
  .create-btn {
    width: 100%;
    margin-bottom: 12px;
    font-size: 0.9rem;
    padding: 10px 20px;
  }

  .hero-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    min-height: 44px;
    font-size: 0.85rem;
  }
  
  .project-actions {
    flex-direction: column !important;
    gap: 8px !important;
  }
  
  .project-actions .v-btn {
    width: 100%;
    justify-content: center !important;
  }
}

@media (max-width: 480px) {
  .connect-btn,
  .create-btn {
    font-size: 0.85rem;
    padding: 8px 16px;
    min-height: 44px;
  }

  .action-btn {
    padding: 8px 12px;
    min-height: 42px;
    font-size: 0.8rem;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.7rem;
  }
}

/* Ensure touch targets are at least 44px */
@media (pointer: coarse) {
  .connect-btn,
  .create-btn,
  .action-btn,
  .project-actions .v-btn {
    min-height: 44px !important;
    min-width: 44px !important;
  }
}
</style>
