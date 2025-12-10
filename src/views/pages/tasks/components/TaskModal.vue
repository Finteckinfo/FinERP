<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? 'Edit Task' : 'Create New Task' }}
        </h2>
        <button @click="handleClose" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-grid">
          <!-- Task Title -->
          <div class="form-group full-width">
            <label for="title" class="form-label">Title *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="Enter task title"
              required
            />
          </div>

          <!-- Description -->
          <div class="form-group full-width">
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Enter task description"
              rows="3"
            ></textarea>
          </div>

          <!-- Project -->
          <div class="form-group">
            <label for="project" class="form-label">Project *</label>
            <select
              id="project"
              v-model="formData.projectId"
              class="form-select"
              required
            >
              <option value="">Select a project</option>
              <option
                v-for="project in projects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Department -->
          <div class="form-group">
            <label for="department" class="form-label">Department *</label>
            <select
              id="department"
              v-model="formData.departmentId"
              class="form-select"
              required
            >
              <option value="">Select a department</option>
              <option
                v-for="department in filteredDepartments"
                :key="department.id"
                :value="department.id"
              >
                {{ department.name }}
              </option>
            </select>
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label for="priority" class="form-label">Priority *</label>
            <select
              id="priority"
              v-model="formData.priority"
              class="form-select"
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          <!-- Status -->
          <div class="form-group">
            <label for="status" class="form-label">Status *</label>
            <select
              id="status"
              v-model="formData.status"
              class="form-select"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          <!-- Due Date -->
          <div class="form-group">
            <label for="dueDate" class="form-label">Due Date *</label>
            <input
              id="dueDate"
              v-model="formData.dueDate"
              type="date"
              class="form-input"
              required
            />
          </div>

          <!-- Start Date -->
          <div class="form-group">
            <label for="startDate" class="form-label">Start Date</label>
            <input
              id="startDate"
              v-model="formData.startDate"
              type="date"
              class="form-input"
            />
          </div>

          <!-- Estimated Hours -->
          <div class="form-group">
            <label for="estimatedHours" class="form-label">Estimated Hours</label>
            <input
              id="estimatedHours"
              v-model.number="formData.estimatedHours"
              type="number"
              min="0"
              step="0.5"
              class="form-input"
              placeholder="0"
            />
          </div>

          <!-- Actual Hours -->
          <div class="form-group">
            <label for="actualHours" class="form-label">Actual Hours</label>
            <input
              id="actualHours"
              v-model.number="formData.actualHours"
              type="number"
              min="0"
              step="0.5"
              class="form-input"
              placeholder="0"
            />
          </div>

          <!-- Assigned User (only for owners/managers) -->
          <div v-if="myRole === 'PROJECT_OWNER' || myRole === 'PROJECT_MANAGER'" class="form-group">
            <label for="assignedRoleId" class="form-label">Assign To</label>
            <select
              id="assignedRoleId"
              v-model="formData.assignedRoleId"
              class="form-select"
            >
              <option value="">Unassigned</option>
              <option
                v-for="member in filteredTeamMembers"
                :key="member.id"
                :value="member.id"
              >
                {{ member.user?.firstName }} {{ member.user?.lastName }} ({{ member.role }})
              </option>
            </select>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="handleClose" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="!isFormValid">
            {{ isEditing ? 'Update Task' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Task, Project, Department, UserRole } from '@/services/projectApi'

interface Props {
  task?: Task | null
  projects: Project[]
  departments: Department[]
  teamMembers: UserRole[]
  myRole: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [taskData: Partial<Task>]
}>()

const isEditing = computed(() => !!props.task)

const formData = ref({
  title: '',
  description: '',
  projectId: '',
  departmentId: '',
  priority: 'MEDIUM' as Task['priority'],
  status: 'PENDING' as Task['status'],
  dueDate: '',
  startDate: '',
  estimatedHours: undefined as number | undefined,
  actualHours: undefined as number | undefined,
  assignedRoleId: ''
})

const filteredDepartments = computed(() => {
  if (!formData.value.projectId) return []
  return props.departments.filter(dept => dept.projectId === formData.value.projectId)
})

const filteredTeamMembers = computed(() => {
  if (!formData.value.departmentId) return props.teamMembers
  return props.teamMembers.filter(member => 
    member.accessibleDepartments?.some(dept => dept.id === formData.value.departmentId)
  )
})

const isFormValid = computed(() => {
  return formData.value.title.trim() !== '' &&
         formData.value.projectId !== '' &&
         formData.value.departmentId !== '' &&
         formData.value.dueDate !== ''
})

// Initialize form data
onMounted(() => {
  if (props.task) {
    formData.value = {
      title: props.task.title,
      description: props.task.description || '',
      projectId: props.task.projectId,
      departmentId: props.task.departmentId,
      priority: props.task.priority,
      status: props.task.status,
      dueDate: props.task.dueDate ? props.task.dueDate.split('T')[0] : '',
      startDate: props.task.startDate ? props.task.startDate.split('T')[0] : '',
      estimatedHours: props.task.estimatedHours,
      actualHours: props.task.actualHours,
      assignedRoleId: props.task.assignedRoleId || ''
    }
  } else {
    // Set default due date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    formData.value.dueDate = tomorrow.toISOString().split('T')[0]
  }
})

// Watch for project changes to reset department
watch(() => formData.value.projectId, (newProjectId) => {
  if (newProjectId) {
    // Reset department when project changes
    formData.value.departmentId = ''
  }
})

const handleSubmit = () => {
  if (!isFormValid.value) return

  const taskData: any = {
    title: formData.value.title.trim(),
    description: formData.value.description.trim() || undefined,
    projectId: formData.value.projectId,
    departmentId: formData.value.departmentId,
    priority: formData.value.priority,
    status: formData.value.status,
    dueDate: formData.value.dueDate ? new Date(formData.value.dueDate).toISOString() : undefined,
    startDate: formData.value.startDate ? new Date(formData.value.startDate).toISOString() : undefined,
    estimatedHours: formData.value.estimatedHours,
    actualHours: formData.value.actualHours,
    assignedRoleId: formData.value.assignedRoleId || undefined
  }

  emit('save', taskData)
}

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  handleClose()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-content {
  background-color: var(--erp-card-bg);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--erp-border);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: var(--erp-text-muted);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: var(--erp-surface);
  color: var(--erp-text);
}

.modal-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 0.5rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: var(--erp-text);
  background-color: var(--erp-card-bg);
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--erp-accent-indigo);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--erp-border);
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: var(--erp-accent-indigo);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(0.95);
}

.btn-primary:disabled {
  background-color: var(--erp-text-muted);
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--erp-surface);
  color: var(--erp-text);
  border: 1px solid var(--erp-border);
}

.btn-secondary:hover {
  background-color: var(--erp-card-bg);
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
