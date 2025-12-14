<template>
  <div class="kanban-filters">
    <v-card variant="outlined" class="filter-card">
      <v-card-text class="pa-4">
        <v-row align="center">
          <!-- Search -->
          <v-col cols="12" md="3">
            <v-text-field
              v-model="localFilters.search"
              placeholder="Search tasks..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="kanban-filter-input"
              @input="debouncedUpdate"
            />
          </v-col>

          <!-- Project Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="localFilters.projectIds"
              :items="projectOptions"
              placeholder="All Projects"
              prepend-inner-icon="mdi-folder"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              clearable
              class="kanban-filter-select"
              :menu-props="{ contentClass: 'kanban-select-menu', scrim: false }"
              @update:model-value="updateFilters"
            >
              <template #selection="{ item, index }">
                <v-chip
                  v-if="index < 2"
                  size="small"
                  variant="outlined"
                  class="mr-1"
                >
                  {{ item.title }}
                </v-chip>
                <span
                  v-if="index === 2"
                  class="text-caption text-medium-emphasis"
                >
                  +{{ localFilters.projectIds!.length - 2 }} more
                </span>
              </template>
            </v-select>
          </v-col>

          <!-- Department Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="localFilters.departmentId"
              :items="departmentOptions"
              placeholder="All Departments"
              prepend-inner-icon="mdi-office-building"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="kanban-filter-select"
              :menu-props="{ contentClass: 'kanban-select-menu', scrim: false }"
              @update:model-value="updateFilters"
            />
          </v-col>

          <!-- Priority Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="localFilters.priorities"
              :items="priorityOptions"
              placeholder="All Priorities"
              prepend-inner-icon="mdi-flag"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              clearable
              class="kanban-filter-select"
              :menu-props="{ contentClass: 'kanban-select-menu', scrim: false }"
              @update:model-value="updateFilters"
            >
              <template #selection="{ item, index }">
                <v-chip
                  v-if="index < 2"
                  size="small"
                  :color="getPriorityColor(item.value)"
                  variant="flat"
                  class="mr-1"
                >
                  {{ item.title }}
                </v-chip>
                <span
                  v-if="index === 2"
                  class="text-caption text-medium-emphasis"
                >
                  +{{ localFilters.priorities!.length - 2 }} more
                </span>
              </template>
            </v-select>
          </v-col>

          <!-- Assignee Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="localFilters.assignedRoleIds"
              :items="assigneeOptions"
              placeholder="All Assignees"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              clearable
              class="kanban-filter-select"
              :menu-props="{ contentClass: 'kanban-select-menu', scrim: false }"
              @update:model-value="updateFilters"
            >
              <template #selection="{ item, index }">
                <v-chip
                  v-if="index < 2"
                  size="small"
                  variant="outlined"
                  class="mr-1"
                >
                  {{ item.title }}
                </v-chip>
                <span
                  v-if="index === 2"
                  class="text-caption text-medium-emphasis"
                >
                  +{{ localFilters.assignedRoleIds!.length - 2 }} more
                </span>
              </template>
            </v-select>
          </v-col>

          <!-- Include Completed Toggle -->
          <v-col cols="12" md="2">
            <v-switch
              v-model="localFilters.includeCompleted"
              label="Include Completed"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="updateFilters"
            />
          </v-col>

          <!-- Show Archived Toggle -->
          <v-col cols="12" md="2">
            <v-switch
              v-model="localFilters.includeArchived"
              label="Show Archived"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="updateFilters"
            />
          </v-col>

          <!-- Actions -->
          <v-col cols="12" md="1" class="text-right">
            <v-btn-group variant="outlined" density="compact">
              <v-btn
                icon="mdi-refresh"
                :loading="loading"
                @click="$emit('refresh')"
              />
              <v-btn
                icon="mdi-filter-off"
                @click="clearFilters"
              />
            </v-btn-group>
          </v-col>
        </v-row>

        <!-- Advanced Filters Toggle -->
        <v-row v-if="showAdvanced" class="mt-2">
          <v-col cols="12" md="6">
            <div class="filter-section">
              <label class="filter-label">Due Date Range</label>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    :model-value="localFilters.dueDateRange?.start"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="kanban-filter-input"
                    @update:model-value="(value) => updateDateRangeStart(value)"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    :model-value="localFilters.dueDateRange?.end"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="kanban-filter-input"
                    @update:model-value="(value) => updateDateRangeEnd(value)"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>

        <!-- Filter Summary -->
        <div v-if="hasActiveFilters" class="filter-summary mt-3">
          <div class="d-flex align-center gap-2 flex-wrap">
            <span class="text-caption text-medium-emphasis">Active filters:</span>
            
            <v-chip
              v-if="localFilters.search"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('search')"
            >
              Search: "{{ localFilters.search }}"
            </v-chip>
            
            <v-chip
              v-if="localFilters.departmentId"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('departmentId')"
            >
              Department: {{ getDepartmentName(localFilters.departmentId) }}
            </v-chip>
            
            <v-chip
              v-if="localFilters.priorities?.length"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('priorities')"
            >
              Priority: {{ localFilters.priorities.length }} selected
            </v-chip>

            <v-chip
              v-if="localFilters.includeArchived"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('includeArchived')"
            >
              Showing archived
            </v-chip>
            
            <v-chip
              v-if="localFilters.assignedRoleIds?.length"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('assignedRoleIds')"
            >
              Assignees: {{ localFilters.assignedRoleIds.length }} selected
            </v-chip>
            
            <v-chip
              v-if="localFilters.includeCompleted"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('includeCompleted')"
            >
              Include Completed
            </v-chip>
            
            <v-chip
              v-if="localFilters.dueDateRange"
              size="small"
              variant="outlined"
              closable
              @click:close="clearFilter('dueDateRange')"
            >
              Due Date Range
            </v-chip>
          </div>
        </div>

        <!-- Advanced Toggle -->
        <div class="text-right mt-2">
          <v-btn
            variant="text"
            size="small"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'Less Filters' : 'More Filters' }}
            <v-icon :class="{ 'rotate-180': showAdvanced }">
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { debounce } from 'lodash';
import { projectApi, departmentApi } from '@/services/projectApi';
import type { KanbanFilters } from '../types/kanban';

interface Props {
  filters: KanbanFilters;
  loading?: boolean;
}

interface Emits {
  (e: 'update:filters', filters: Partial<KanbanFilters>): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localFilters = ref<KanbanFilters>({ ...props.filters });
const showAdvanced = ref(false);
const projects = ref<any[]>([]);
const departments = ref<any[]>([]);
const assignees = ref<any[]>([]);

// Computed options
const projectOptions = computed(() => [
  { title: 'All Projects', value: '' },
  ...projects.value.map(project => ({
    title: project.name,
    value: project.id
  }))
]);

const departmentOptions = computed(() => [
  { title: 'All Departments', value: '' },
  ...departments.value.map(dept => ({
    title: dept.name,
    value: dept.id
  }))
]);

const priorityOptions = computed(() => [
  { title: 'Critical', value: 'CRITICAL' },
  { title: 'High', value: 'HIGH' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'Low', value: 'LOW' }
]);

const assigneeOptions = computed(() => [
  { title: 'All Assignees', value: '' },
  ...assignees.value.map(assignee => ({
    title: assignee.email || assignee.name,
    value: assignee.id
  }))
]);

const hasActiveFilters = computed(() => {
  return !!(
    localFilters.value.search ||
    localFilters.value.departmentId ||
    localFilters.value.priorities?.length ||
    localFilters.value.assignedRoleIds?.length ||
    localFilters.value.includeCompleted ||
    localFilters.value.includeArchived ||
    localFilters.value.dueDateRange
  );
});

// Methods
const updateFilters = () => {
  emit('update:filters', { ...localFilters.value });
};

const debouncedUpdate = debounce(() => {
  updateFilters();
}, 300);

const clearFilters = () => {
  localFilters.value = {
    search: '',
    projectIds: [],
    departmentId: undefined,
    priorities: [],
    assignedRoleIds: [],
    includeCompleted: false,
    includeArchived: false,
    dueDateRange: undefined
  };
  updateFilters();
};

const clearFilter = (filterKey: keyof KanbanFilters) => {
  switch (filterKey) {
    case 'search':
      localFilters.value.search = '';
      break;
    case 'projectIds':
      localFilters.value.projectIds = [];
      break;
    case 'departmentId':
      localFilters.value.departmentId = undefined;
      break;
    case 'priorities':
      localFilters.value.priorities = [];
      break;
    case 'assignedRoleIds':
      localFilters.value.assignedRoleIds = [];
      break;
    case 'includeCompleted':
      localFilters.value.includeCompleted = false;
      break;
    case 'includeArchived':
      localFilters.value.includeArchived = false;
      break;
    case 'dueDateRange':
      localFilters.value.dueDateRange = undefined;
      break;
  }
  updateFilters();
};

const updateDateRangeStart = (value: string) => {
  if (!localFilters.value.dueDateRange) {
    localFilters.value.dueDateRange = { start: '', end: '' };
  }
  localFilters.value.dueDateRange.start = value;
  updateDateRange();
};

const updateDateRangeEnd = (value: string) => {
  if (!localFilters.value.dueDateRange) {
    localFilters.value.dueDateRange = { start: '', end: '' };
  }
  localFilters.value.dueDateRange.end = value;
  updateDateRange();
};

const updateDateRange = () => {
  if (localFilters.value.dueDateRange?.start && localFilters.value.dueDateRange?.end) {
    updateFilters();
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'error';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW': return 'success';
    default: return 'grey';
  }
};

const getDepartmentName = (departmentId: string) => {
  const dept = departments.value.find(d => d.id === departmentId);
  return dept?.name || 'Unknown';
};

// Load filter options
const loadFilterOptions = async () => {
  try {
    // Load departments and assignees from your project context
    // This would need to be adapted based on your current project context
    console.log('[KanbanFilters] Loading filter options...');
    
    // For now, we'll use mock data - replace with actual API calls
    departments.value = [
      { id: '1', name: 'Development' },
      { id: '2', name: 'Design' },
      { id: '3', name: 'Marketing' }
    ];
    
    assignees.value = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
  } catch (error) {
    console.error('[KanbanFilters] Failed to load filter options:', error);
  }
};

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// Lifecycle
onMounted(() => {
  loadFilterOptions();
});
</script>

<style scoped>
.kanban-filters {
  margin-bottom: 1rem;
}

.filter-card {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 18px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 0.5rem;
}

.filter-summary {
  padding-top: 1rem;
  border-top: 1px solid var(--erp-border);
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .kanban-filters :deep(.v-col) {
    padding: 0.25rem;
  }
  
  .filter-card {
    margin-bottom: 0.75rem;
  }
  
  .filter-summary {
    margin-top: 1rem;
  }
  
  .filter-summary .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .kanban-filters :deep(.v-text-field),
  .kanban-filters :deep(.v-select),
  .kanban-filters :deep(.v-switch) {
    font-size: 0.875rem;
  }
  
  .kanban-filters :deep(.v-btn-group .v-btn) {
    min-width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .kanban-filters :deep(.v-col) {
    padding: 0.125rem;
  }
  
  .filter-card {
    margin-bottom: 0.5rem;
  }
  
  .filter-summary {
    margin-top: 0.75rem;
  }
  
  .kanban-filters :deep(.v-text-field),
  .kanban-filters :deep(.v-select),
  .kanban-filters :deep(.v-switch) {
    font-size: 0.8125rem;
  }
  
  .kanban-filters :deep(.v-btn-group .v-btn) {
    min-width: 36px;
    height: 36px;
  }
  
  .filter-label {
    font-size: 0.8125rem;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .filter-card {
    margin-bottom: 1.5rem;
  }
  
  .kanban-filters :deep(.v-text-field),
  .kanban-filters :deep(.v-select),
  .kanban-filters :deep(.v-switch) {
    font-size: 0.875rem;
  }
  
  .kanban-filters :deep(.v-btn-group .v-btn) {
    min-width: 48px;
    height: 48px;
  }
  
  .filter-label {
    font-size: 0.875rem;
  }
}

@media (min-width: 1920px) {
  .filter-card {
    margin-bottom: 2rem;
  }
  
  .kanban-filters :deep(.v-text-field),
  .kanban-filters :deep(.v-select),
  .kanban-filters :deep(.v-switch) {
    font-size: 1rem;
  }
  
  .kanban-filters :deep(.v-btn-group .v-btn) {
    min-width: 52px;
    height: 52px;
  }
  
  .filter-label {
    font-size: 1rem;
  }
}

.kanban-filters :deep(.v-text-field),
.kanban-filters :deep(.v-select) {
  font-size: 0.875rem;
  background: transparent;
}

.kanban-filter-input :deep(.v-field),
.kanban-filter-select :deep(.v-field) {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.kanban-filter-input :deep(.v-field--focused),
.kanban-filter-select :deep(.v-field--focused) {
  border-color: var(--erp-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--erp-primary) 20%, transparent);
}

.kanban-filter-input :deep(.v-label),
.kanban-filter-select :deep(.v-label),
.kanban-filter-input :deep(.v-field__input),
.kanban-filter-select :deep(.v-field__input) {
  color: var(--erp-text);
}

::global(.kanban-select-menu) {
  background: var(--erp-surface) !important;
  border-radius: 12px;
  border: 1px solid var(--erp-border);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.16) !important;
}

::global(.kanban-select-menu .v-list) {
  background: transparent !important;
  color: var(--erp-text);
}

::global(.kanban-select-menu .v-list-item) {
  color: var(--erp-text);
}

::global(.kanban-select-menu .v-list-item--active) {
  background: color-mix(in srgb, var(--erp-primary) 18%, transparent) !important;
}

::global(.kanban-select-menu .v-overlay__scrim) {
  background: transparent !important;
}

/* Force dark-mode dropdown overlays to match palette */
::global(.dark-theme .kanban-select-menu) {
  background: rgba(16, 24, 40, 0.95) !important;
  border-color: rgba(148, 163, 184, 0.35) !important;
  box-shadow: 0 28px 48px rgba(2, 6, 23, 0.75) !important;
  backdrop-filter: blur(10px);
}

::global(.dark-theme .kanban-select-menu .v-list) {
  background: transparent !important;
  color: #e2e8f0 !important;
}

::global(.dark-theme .kanban-select-menu .v-list-item) {
  color: #f1f5f9 !important;
}

::global(.dark-theme .kanban-select-menu .v-list-item--active) {
  background: color-mix(in srgb, var(--erp-primary) 32%, transparent) !important;
  color: #f8fafc !important;
}

::global(.dark-theme .kanban-select-menu .v-overlay__scrim) {
  background: transparent !important;
}

.kanban-filters :deep(.v-field) {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
}

.kanban-filters :deep(.v-field__outline) {
  display: none;
}

.kanban-filters :deep(.v-label),
.kanban-filters :deep(.v-field__input) {
  color: var(--erp-text);
}

.kanban-filters :deep(.v-select .v-field) {
  cursor: pointer;
}

.kanban-filters :deep(.v-select__selection-text) {
  color: var(--erp-text);
}

.kanban-filters :deep(.v-field--focused) {
  border-color: var(--erp-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--erp-primary) 20%, transparent);
}

.kanban-filters :deep(.v-overlay__content) {
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
}

.kanban-filters :deep(.v-list) {
  background: var(--erp-surface);
}

::global(.kanban-select-menu .v-list-item) {
  color: var(--erp-text);
}

::global(.kanban-select-menu .v-list-item--active) {
  background: color-mix(in srgb, var(--erp-primary) 16%, transparent);
}
:global(.dark-theme) .kanban-filter-input :deep(.v-field),
:global(.dark-theme) .kanban-filter-select :deep(.v-field),
:global(.dark-theme) .kanban-filters :deep(.v-field) {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(148, 163, 184, 0.32);
  color: #e2e8f0;
}

:global(.dark-theme) .kanban-filters :deep(.v-label),
:global(.dark-theme) .kanban-filters :deep(.v-field__input),
:global(.dark-theme) .kanban-filters :deep(.v-select__selection-text),
:global(.dark-theme) .kanban-filters :deep(.v-select__selection) {
  color: #e2e8f0;
}

:global(.dark-theme) .kanban-filters :deep(.v-field--focused) {
  border-color: color-mix(in srgb, var(--erp-primary) 65%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--erp-primary) 35%, transparent);
}

:global(.dark-theme) .kanban-select-menu {
  background: rgba(15, 23, 42, 0.94) !important;
  border-color: rgba(148, 163, 184, 0.3) !important;
  box-shadow: 0 22px 38px rgba(2, 6, 23, 0.7) !important;
}

:global(.dark-theme) .kanban-select-menu .v-list-item {
  color: #f1f5f9;
}

:global(.dark-theme) .kanban-select-menu .v-list-item--active {
  background: color-mix(in srgb, var(--erp-primary) 30%, transparent) !important;
}
</style>
