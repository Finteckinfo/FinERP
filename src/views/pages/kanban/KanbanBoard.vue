<template>
  <div class="kanban-board">
    <!-- Skip to content link for accessibility -->
    <a href="#kanban-columns" class="skip-to-content">Skip to Kanban Board</a>
    
    <!-- Hero Section with Retro Grid -->
    <div class="kanban-hero">
      <RetroGrid v-if="!isDark" class="kanban-hero-grid" />
      <div class="hero-content">
        <div class="hero-icon">
          <v-icon size="48">mdi-view-column</v-icon>
        </div>
        <h1 class="hero-title">{{ boardTitle }}</h1>
        <p class="hero-subtitle">
          {{ boardProjectId ? 'Visual task management for this project.' : 'Cross-project view of your workflow.' }}
        </p>
      </div>
    </div>
    
    <!-- Action Bar -->
    <div class="kanban-actions">
      <div class="actions-content">
        <div class="actions-left">
          <div class="board-stats" v-if="!loading">
            <v-chip size="small" variant="outlined" class="mr-2">
              <v-icon start size="16">mdi-format-list-bulleted</v-icon>
              {{ totalTasks }} Tasks
            </v-chip>
            <v-chip 
              v-if="hasSelectedTasks" 
              size="small" 
              color="primary" 
              variant="flat"
              class="mr-2"
            >
              <v-icon start size="16">mdi-check-circle</v-icon>
              {{ selectedTasks.length }} Selected
            </v-chip>
          </div>
        </div>
        
        <div class="actions-right">
          <v-btn
            v-if="hasSelectedTasks"
            variant="outlined"
            size="small"
            class="mr-2"
            @click="clearSelection"
          >
            <v-icon start>mdi-close</v-icon>
            Clear Selection
          </v-btn>
          
          <v-btn
            v-if="hasSelectedTasks"
            color="primary"
            size="small"
            class="mr-2"
            @click="showBulkActions = true"
          >
            <v-icon start>mdi-format-list-checks</v-icon>
            Bulk Actions
          </v-btn>
          
          <v-btn
            v-if="userPermissions.canCreateTasks"
            color="primary"
            @click="showCreateTask = true"
          >
            <v-icon start>mdi-plus</v-icon>
            New Task
          </v-btn>
        </div>
      </div>
    </div> 

    <!-- Filters -->
    <KanbanFilters
      :filters="filters"
      :loading="loading"
      @update:filters="updateFilters"
      @refresh="loadKanbanData(true)"
    />

    <!-- Project Picker (required) -->
    <div v-if="!boardProjectId" class="project-picker">
      <v-card elevation="0" class="picker-card">
        <v-card-title class="text-h5">Select a project board</v-card-title>
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Each FinPro project has its own board. Choose a project to continue.
          </p>

          <v-alert v-if="projectPickerError" type="error" variant="tonal" class="mb-3">
            {{ projectPickerError }}
          </v-alert>

          <v-select
            v-model="selectedProjectId"
            :items="projectOptions"
            item-title="title"
            item-value="value"
            label="Project"
            variant="outlined"
            :loading="projectPickerLoading"
            hide-details="auto"
          />

          <!-- Supabase-only: create first project -->
          <div v-if="isSupabaseOnly && !projectPickerLoading && projectOptions.length === 0" class="mt-4">
            <v-alert type="info" variant="tonal" class="mb-3">
              No projects found in Supabase yet. Create your first project to start a board.
            </v-alert>
            <v-btn color="primary" variant="flat" @click="showCreateProject = true">
              <v-icon start>mdi-plus</v-icon>
              Create Project
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="outlined" @click="loadProjectPicker" :loading="projectPickerLoading">Refresh</v-btn>
          <v-btn color="primary" @click="openSelectedBoard" :disabled="!selectedProjectId">Open board</v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Supabase-only Create Project Modal -->
    <v-dialog v-model="showCreateProject" max-width="520" persistent>
      <v-card :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
        <v-card-title class="text-h5">Create Project</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newProjectTitle"
            label="Project name"
            variant="outlined"
            hide-details="auto"
            autofocus
          />
          <v-textarea
            v-model="newProjectDescription"
            label="Description (optional)"
            variant="outlined"
            rows="3"
            hide-details="auto"
            class="mt-3"
          />
          <v-alert v-if="createProjectError" type="error" variant="tonal" class="mt-3">
            {{ createProjectError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="closeCreateProject" :disabled="creatingProject">Cancel</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="createProjectInSupabase" :loading="creatingProject" :disabled="!newProjectTitle.trim()">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-row>
        <v-col v-for="i in 4" :key="i" cols="12" md="3">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <v-alert
      v-if="error && !loading"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex align-center justify-space-between">
        <span>{{ error }}</span>
        <v-btn
          variant="text"
          size="small"
          @click="loadKanbanData(true)"
        >
          Retry
        </v-btn>
      </div>
    </v-alert>

    <!-- Kanban Columns -->
    <div v-if="!boardProjectId" />
    <div v-else-if="!loading && !error" id="kanban-columns" class="kanban-columns">
      <div 
        class="columns-container"
        role="region"
        aria-label="Kanban Board Columns"
        aria-live="polite"
      >
        <KanbanColumn
          v-for="column in columnConfigs"
          :key="column.id"
          :column="column"
          :tasks="(columns as any)[column.status] || []"
          :selected-tasks="selectedTasks"
          :user-permissions="userPermissions"
          @task-click="handleTaskClick"
          @task-select="toggleTaskSelection"
          @task-move="handleTaskMove"
          @add-task="handleAddTask"
          @quick-add-task="handleQuickAddTask"
          @column-action="handleColumnAction"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="!loading && !error && totalTasks === 0" 
      class="empty-state"
    >
      <div class="empty-content">
        <v-icon size="64" color="grey-lighten-1">mdi-view-column-outline</v-icon>
        <h3 class="text-h5 mt-4 mb-2">No tasks found</h3>
        <p class="text-body-1 mb-4">
          {{ filters.search || Object.keys(filters).length > 1 
            ? 'Try adjusting your filters to see more tasks.' 
            : 'Create your first task to get started.' }}
        </p>
        <v-btn
          v-if="userPermissions.canCreateTasks"
          color="primary"
          @click="showCreateTask = true"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Task
        </v-btn>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <TaskDetailModal
      v-model="showTaskDetail"
      :task="selectedTask"
      :user-permissions="userPermissions"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />

    <!-- Create Task Modal -->
    <CreateTaskModal
      v-model="showCreateTask"
      :default-status="createTaskDefaultStatus"
      :default-project="boardProjectId || undefined"
      :default-department="defaultDepartmentId || undefined"
      @task-created="handleTaskCreated"
    />

    <!-- Bulk Actions Modal -->
    <BulkActionsModal
      v-model="showBulkActions"
      :task-ids="selectedTasks"
      @actions-completed="handleBulkActionsCompleted"
    />

    <!-- Analytics Drawer -->
    <KanbanAnalytics
      v-model="showAnalytics"
    />

    <!-- Floating Action Button for Analytics -->
    <v-btn
      class="analytics-fab"
      color="secondary"
      icon
      size="large"
      elevation="4"
      @click="showAnalytics = true"
    >
      <v-icon>mdi-chart-line</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useKanban } from './composables/useKanban';
import { DEFAULT_COLUMNS } from './types/kanban';
import type { KanbanTask, TaskPosition } from './types/kanban';
import { departmentApi, projectApi } from '@/services/projectApi';
import { taskApi } from '@/services/projectApi';
import { kanbanApi } from './services/kanbanApi';
import { supabase, isSupabaseOnly } from '@/services/supabase';

// Import kanban styles
import './styles/kanban.css';

// Components
import KanbanFilters from './components/KanbanFilters.vue';
import KanbanColumn from './components/KanbanColumn.vue';
import TaskDetailModal from './components/TaskDetailModal.vue';
import CreateTaskModal from './components/CreateTaskModal.vue';
import BulkActionsModal from './components/BulkActionsModal.vue';
import { RetroGrid } from '@/components/ui/retro-grid';
import KanbanAnalytics from './components/KanbanAnalytics.vue';
import { useTheme } from '@/composables/useTheme';

// Kanban composable (no project ID needed for cross-project view)
const {
  loading,
  error,
  columns,
  totalTasks,
  projectSummary,
  userPermissions,
  selectedTasks,
  hasSelectedTasks,
  filters,
  loadKanbanData,
  updateFilters,
  moveTask,
  toggleTaskSelection,
  clearSelection
} = useKanban();

// Local state
const showTaskDetail = ref(false);
const showCreateTask = ref(false);
const showBulkActions = ref(false);
const showAnalytics = ref(false);
const selectedTask = ref<KanbanTask | null>(null);
const createTaskDefaultStatus = ref<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED'>('PENDING');
const route = useRoute();
const router = useRouter();

// One board per project. If no projectId is provided, show project picker.
const boardProjectId = computed(() => {
  const raw = route.query.projectId;
  return typeof raw === 'string' && raw.trim() ? raw : null;
});

const boardTitle = ref<string>('Kanban Board');
const defaultDepartmentId = ref<string | null>(null);
const projectPickerLoading = ref(false);
const projectPickerError = ref<string | null>(null);
const projectOptions = ref<Array<{ title: string; value: string }>>([]);
const selectedProjectId = ref<string | null>(null);
const showCreateProject = ref(false);
const creatingProject = ref(false);
const createProjectError = ref<string | null>(null);
const newProjectTitle = ref('');
const newProjectDescription = ref('');

const loadBoardContext = async () => {
  if (!boardProjectId.value) {
    // No project selected: show project picker
    boardTitle.value = 'Choose a Project Board';
    defaultDepartmentId.value = null;
    return;
  }

  // Filter Kanban to this project's board
  await updateFilters({ projectIds: [boardProjectId.value] });

  // Try to load project name for the header
  try {
    if (isSupabaseOnly && supabase) {
      const { data } = await supabase.from('projects').select('id,title').eq('id', boardProjectId.value).maybeSingle();
      boardTitle.value = data?.title ? `${data.title}` : 'Project Board';
    } else {
      const project = await projectApi.getProject(boardProjectId.value);
      boardTitle.value = project?.name ? `${project.name}` : 'Project Board';
    }
  } catch {
    boardTitle.value = 'Project Board';
  }

  // Get a default department (required by backend for task creation)
  try {
    if (isSupabaseOnly) {
      defaultDepartmentId.value = 'general';
    } else {
      const depsResp = await departmentApi.getAccessibleDepartments(boardProjectId.value);
      const deps = Array.isArray(depsResp) ? depsResp : (depsResp?.departments || depsResp?.data || []);
      defaultDepartmentId.value = deps?.[0]?.id || null;
    }
  } catch {
    defaultDepartmentId.value = null;
  }
};

watch(boardProjectId, () => {
  loadBoardContext();
});

const loadProjectPicker = async () => {
  projectPickerLoading.value = true;
  projectPickerError.value = null;
  try {
    if (isSupabaseOnly && supabase) {
      const { data, error } = await supabase.from('projects').select('id,title').order('created_at', { ascending: false });
      if (error) throw error;
      projectOptions.value = (data || []).map((p: any) => ({ title: p.title, value: p.id }));
    } else {
      const projectsResponse = await projectApi.getUserProjectsSimple();
      const projects = Array.isArray(projectsResponse)
        ? projectsResponse
        : (projectsResponse?.projects || projectsResponse?.data || []);
      projectOptions.value = (projects || []).map((p: any) => ({ title: p.name, value: p.id }));
    }
  } catch (e: any) {
    projectPickerError.value = e?.message || 'Failed to load projects';
    projectOptions.value = [];
  } finally {
    projectPickerLoading.value = false;
  }
};

const openSelectedBoard = () => {
  if (!selectedProjectId.value) return;
  router.push({ path: '/kanban', query: { projectId: selectedProjectId.value } });
};

const closeCreateProject = () => {
  showCreateProject.value = false;
  creatingProject.value = false;
  createProjectError.value = null;
  newProjectTitle.value = '';
  newProjectDescription.value = '';
};

const createProjectInSupabase = async () => {
  console.log('[KanbanBoard] createProjectInSupabase called', { isSupabaseOnly, hasSupabase: !!supabase });
  if (!isSupabaseOnly || !supabase) {
    console.warn('[KanbanBoard] Supabase not available or not in Supabase-only mode');
    createProjectError.value = 'Supabase not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    return;
  }
  const title = newProjectTitle.value.trim();
  if (!title) {
    createProjectError.value = 'Project title is required';
    return;
  }
  creatingProject.value = true;
  createProjectError.value = null;
  
  const payload = {
    title,
    description: newProjectDescription.value.trim() || null,
    status: 'active'
  };
  console.log('[KanbanBoard] Inserting project:', payload);
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single();
    
    console.log('[KanbanBoard] Supabase insert response:', { data, error });
    
    if (error) {
      console.error('[KanbanBoard] Supabase insert error:', error);
      throw error;
    }

    console.log('[KanbanBoard] Project created successfully:', data);
    await loadProjectPicker();
    selectedProjectId.value = data.id;
    closeCreateProject();
    router.push({ path: '/kanban', query: { projectId: data.id } });
  } catch (e: any) {
    console.error('[KanbanBoard] createProjectInSupabase error:', e);
    createProjectError.value = e?.message || 'Failed to create project in Supabase';
  } finally {
    creatingProject.value = false;
  }
};

// Column configurations
const columnConfigs = computed(() => DEFAULT_COLUMNS);

// Methods
const handleTaskClick = (task: KanbanTask) => {
  selectedTask.value = task;
  showTaskDetail.value = true;
};

const handleTaskMove = async (taskId: string, position: TaskPosition) => {
  console.log('[KanbanBoard] Task move request received:', {
    taskId,
    position,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log('[KanbanBoard] Calling moveTask function...');
    const result = await moveTask(taskId, position);
    console.log('[KanbanBoard] Task move successful:', {
      taskId,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[KanbanBoard] Failed to move task:', {
      taskId,
      position,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

const handleAddTask = (columnStatus: string) => {
  // Pre-fill the create task modal with the column status
  createTaskDefaultStatus.value = (columnStatus as any) || 'PENDING';
  showCreateTask.value = true;
};

const handleQuickAddTask = async (payload: { status: string; title: string }) => {
  // Inline add card from column footer.
  // If we don't have a single-project board context, fall back to the full CreateTask modal.
  if (!boardProjectId.value || !defaultDepartmentId.value) {
    createTaskDefaultStatus.value = (payload.status as any) || 'PENDING';
    showCreateTask.value = true;
    return;
  }

  try {
    if (isSupabaseOnly && supabase) {
      const columnTasks = (columns.value as any)?.[payload.status] || [];
      const order = Array.isArray(columnTasks) ? columnTasks.length : 0;
      const { data: created, error } = await supabase
        .from('tasks')
        .insert([{
          project_id: boardProjectId.value,
          title: payload.title,
          description: null,
          status: String(payload.status || 'PENDING').toLowerCase(),
          archived_at: null,
          order
        }])
        .select()
        .single();
      if (error) throw error;
      await loadKanbanData(true);
    } else {
      // Backend create requires departmentId; status isn't part of the create payload,
      // so we create then position it into the target column.
      const created = await taskApi.createTask({
        title: payload.title,
        departmentId: defaultDepartmentId.value,
        priority: 'MEDIUM'
      });

      const columnTasks = (columns.value as any)?.[payload.status] || [];
      const order = Array.isArray(columnTasks) ? columnTasks.length : 0;

      await kanbanApi.updateTaskPosition(created.id, {
        taskId: created.id,
        status: payload.status as any,
        order
      });

      await loadKanbanData(true);
    }
  } catch (e) {
    console.error('[KanbanBoard] Quick add failed, falling back to modal', e);
    createTaskDefaultStatus.value = (payload.status as any) || 'PENDING';
    showCreateTask.value = true;
  }
};

const handleColumnAction = (action: string, columnStatus: string) => {
  switch (action) {
    case 'select-all':
      // Implementation handled in useKanban
      break;
    case 'clear-column':
      // Future feature
      break;
    case 'collapse':
      // Future feature
      break;
  }
};

const handleTaskUpdated = (updatedTask: KanbanTask) => {
  // Refresh the board to show updates
  loadKanbanData(true);
  showTaskDetail.value = false;
};

const handleTaskDeleted = (taskId: string) => {
  // Refresh the board to remove deleted task
  loadKanbanData(true);
  showTaskDetail.value = false;
};

const handleTaskCreated = (newTask: KanbanTask) => {
  // Refresh the board to show new task
  loadKanbanData(true);
  showCreateTask.value = false;
};

const handleBulkActionsCompleted = () => {
  // Refresh the board and clear selection
  loadKanbanData(true);
  clearSelection();
  showBulkActions.value = false;
};

const { isDark } = useTheme();

// PERFORMANCE: Delay heavy data loading to prevent blocking initial render
onMounted(() => {
  console.log('[KanbanBoard] Mounted. isSupabaseOnly:', isSupabaseOnly);
  console.log('[KanbanBoard] supabase client:', supabase ? 'initialized' : 'NULL');
  console.log('[KanbanBoard] VITE_SUPABASE_URL:', (import.meta as any).env?.VITE_SUPABASE_URL ? 'set' : 'MISSING');
  console.log('[KanbanBoard] VITE_SUPABASE_ANON_KEY:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? 'set' : 'MISSING');
  console.log('[KanbanBoard] VITE_BACKEND_URL:', (import.meta as any).env?.VITE_BACKEND_URL || 'not set (Supabase-only mode)');

  // Load context immediately for UI responsiveness
  loadBoardContext();

  // Delay project picker loading to allow page to render first
  if (!boardProjectId.value) {
    setTimeout(() => {
      loadProjectPicker();
    }, 100);
  }
});
</script>

<style scoped>
.kanban-board {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(1.5rem, 2vw, 2.5rem) clamp(1.25rem, 2vw, 2.25rem) 3rem;
  background: var(--erp-page-bg);
}

.project-picker {
  width: 100%;
}

.picker-card {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  box-shadow: var(--erp-shadow-sm);
}

/* Hero Section */
.kanban-hero {
  position: relative;
  width: 100%;
  padding: clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem);
  text-align: center;
  border-radius: 20px;
  border: 1px solid var(--erp-border);
  background: var(--erp-surface);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  margin: 0;
}

.kanban-hero-grid {
  position: absolute;
  inset: -1px;
  opacity: 0.4;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 1rem;
}

.hero-icon .v-icon {
  color: var(--erp-accent-green);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

/* Action Bar */
.kanban-actions {
  flex-shrink: 0;
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  padding: 1.5rem clamp(1.5rem, 2.5vw, 2.5rem);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  width: 100%;
  margin: 0;
}

.actions-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 1rem;
}

.actions-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 240px;
}

.board-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.kanban-columns {
  flex: 1;
  position: relative;
  width: 100%;
}

.columns-container {
  display: flex;
  gap: clamp(1rem, 1.5vw, 1.75rem);
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  padding: 0 clamp(0.5rem, 2vw, 1.5rem) 1.5rem;
  scroll-snap-type: x proximity;
}

.kanban-column {
  flex: 1;
}

.loading-container {
  padding: 2rem;
}

.loading-container :deep(.v-skeleton-loader) {
  border-radius: 18px;
  border: 1px solid var(--erp-border);
  background: color-mix(in srgb, var(--erp-surface) 85%, #f8fafc);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
  padding: 1.25rem;
}

.loading-container :deep(.v-skeleton-loader__bone) {
  background: color-mix(in srgb, var(--erp-surface) 70%, #ffffff);
}

:global(.dark-theme) .loading-container :deep(.v-skeleton-loader) {
  background: rgba(15, 23, 42, 0.75);
  border-color: rgba(148, 163, 184, 0.25);
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.65);
}

:global(.dark-theme) .loading-container :deep(.v-skeleton-loader__bone) {
  background: rgba(248, 250, 252, 0.08);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.analytics-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
}

/* Responsive Design */
@media (max-width: 768px) {
  .kanban-container {
    background: transparent !important;
    padding: 0 !important;
  }
  
  .kanban-hero {
    padding: 1.5rem 1rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .kanban-actions {
    padding: 1rem 1.25rem;
    gap: 1rem;
  }
  
  .actions-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .actions-left {
    width: 100%;
  }
  
  .actions-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .kanban-columns {
    padding: 0;
  }
  
  .columns-container {
    gap: 1rem;
    padding: 0 0 1rem;
    flex-direction: column;
    height: auto;
    overflow-x: visible;
    overflow-y: auto;
    align-items: stretch;
    max-width: 100%;
    margin: 0;
  }
  
  .analytics-fab {
    bottom: 1rem;
    right: 1rem;
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .kanban-hero {
    padding: 1.5rem 1rem;
  }
  
  .hero-title {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.85rem;
  }
  
  .kanban-actions {
    padding: 0.75rem 1rem;
  }
  
  .board-stats {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .actions-right {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .actions-right .v-btn {
    min-width: auto;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .kanban-columns {
    padding: 0;
  }
  
  .columns-container {
    gap: 0.75rem;
  }
  
  .analytics-fab {
    bottom: 0.75rem;
    right: 0.75rem;
    width: 48px;
    height: 48px;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .kanban-hero {
    padding: 3.5rem 3rem;
  }
  
  .hero-title {
    font-size: 3rem;
  }
  
  .kanban-actions {
    padding: 1.75rem 3rem;
  }
  
  .kanban-columns {
    padding: 2rem 0;
  }
  
  .columns-container {
    gap: 2.25rem;
    max-width: 2000px;
    padding: 0 2.5rem 2rem;
  }
  
  .actions-right .v-btn {
    padding: 1rem 2rem;
    font-size: 1rem;
    border-radius: 12px;
  }
}

@media (min-width: 1920px) {
  .columns-container {
    gap: 2.75rem;
    max-width: 2000px;
    padding: 0 2.5rem 2rem;
  }
  
  .kanban-hero {
    padding: 4rem 3.5rem;
  }
  
  .hero-title {
    font-size: 3.5rem;
  }
  
  .kanban-actions {
    padding: 2rem 3.25rem;
  }
  
  .kanban-columns {
    padding: 2.5rem 0;
  }
}
</style>
