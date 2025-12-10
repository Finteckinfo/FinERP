<template>
  <ProjectAccessGate 
    :project-id="projectId"
    @access-granted="handleAccessGranted"
    @access-denied="handleAccessDenied"
  >
    <div class="project-workspace">
      <!-- Modern Header -->
      <div class="workspace-header">
        <div class="header-content">
          <!-- Desktop Layout: Horizontal -->
          <div class="desktop-header-layout">
            <div class="header-left">
              <v-btn 
                icon 
                variant="text" 
                @click="$router.push('/projects')" 
                class="back-btn"
              >
                <v-icon size="24">mdi-arrow-left</v-icon>
              </v-btn>
              <div class="project-info">
                <h1 class="project-title">{{ project?.name || 'Loading...' }}</h1>
                <div class="project-meta">
                  <v-chip 
                    v-if="project"
                    :color="getStatusColor(getProjectStatus(project))" 
                    size="small" 
                    variant="tonal"
                  >
                    {{ getStatusLabel(getProjectStatus(project)) }}
                  </v-chip>
                  <span class="project-type">{{ project?.type || 'Project' }}</span>
                </div>
              </div>
            </div>
            
            <div class="header-right">
              <div class="team-preview">
                <div class="avatar-stack">
                  <v-avatar 
                    v-for="(member, index) in teamMembers.slice(0, 3)" 
                    :key="index"
                    size="32" 
                    :color="getAvatarColor(member.user?.firstName || member.user?.email || '')"
                    class="member-avatar"
                  >
                    <v-icon color="white" size="16">mdi-account</v-icon>
                  </v-avatar>
                  <div v-if="teamMembers.length > 3" class="more-members">
                    +{{ teamMembers.length - 3 }}
                  </div>
                </div>
                <v-btn variant="outlined" size="small" class="invite-btn" @click="openInvitePanel">
                  <v-icon size="16" class="mr-2">mdi-account-plus</v-icon>
                  Invite
                </v-btn>
              </div>
              
              <div class="header-actions">
                <v-btn icon variant="text" size="small">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small">
                  <v-icon>mdi-bell-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
          
          <!-- Mobile Layout: Vertical Stack -->
          <div class="mobile-header-layout">
            <!-- Top Row: Back Button + Project Info -->
            <div class="d-flex align-center mb-3">
              <v-btn 
                icon 
                variant="text" 
                @click="$router.push('/projects')" 
                class="back-btn mr-3"
              >
                <v-icon size="24">mdi-arrow-left</v-icon>
              </v-btn>
              <div class="project-info flex-grow-1">
                <h1 class="project-title">{{ project?.name || 'Loading...' }}</h1>
                <div class="project-meta">
                  <v-chip 
                    v-if="project"
                    :color="getStatusColor(getProjectStatus(project))" 
                    size="small" 
                    variant="tonal"
                    class="mr-2"
                  >
                    {{ getStatusLabel(getProjectStatus(project)) }}
                  </v-chip>
                  <span class="project-type">{{ project?.type || 'Project' }}</span>
                </div>
              </div>
            </div>
            
            <!-- Bottom Row: Team Preview + Actions -->
            <div class="d-flex align-center justify-space-between">
              <div class="team-preview">
                <div class="avatar-stack">
                  <v-avatar 
                    v-for="(member, index) in teamMembers.slice(0, 3)" 
                    :key="index"
                    size="32" 
                    :color="getAvatarColor(member.user?.firstName || member.user?.email || '')"
                    class="member-avatar"
                  >
                    <v-icon color="white" size="16">mdi-account</v-icon>
                  </v-avatar>
                  <div v-if="teamMembers.length > 3" class="more-members">
                    +{{ teamMembers.length - 3 }}
                  </div>
                </div>
                <v-btn variant="outlined" size="small" class="invite-btn ml-2" @click="openInvitePanel">
                  <v-icon size="16" class="mr-2">mdi-account-plus</v-icon>
                  Invite
                </v-btn>
              </div>
              
              <div class="header-actions">
                <v-btn icon variant="text" size="small">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small">
                  <v-icon>mdi-bell-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="workspace-content">
        <v-container fluid class="pa-0">
          <!-- Payment Notification Banner -->
          <PaymentNotificationBanner :project-id="projectId" />
          
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate :color="'var(--erp-accent-green)'" size="64"></v-progress-circular>
            <p class="mt-4" :style="{ color: 'var(--erp-text)' }">Loading workspace...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <v-alert type="error" class="mb-4">
              {{ error }}
            </v-alert>
            <v-btn :color="'var(--erp-accent-green)'" @click="loadProjectData">Retry</v-btn>
          </div>

          <!-- Content -->
          <div v-else class="workspace-grid">
            <!-- Left Column - Project Info & Quick Actions -->
            <div class="left-column">
              <!-- Project Overview Card -->
              <v-card class="info-card" elevation="0" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <div class="card-header">
                  <h3 class="card-title">Project Overview</h3>
                  <v-btn icon variant="text" size="small">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
                
                <p class="project-description">
                  {{ project?.description || 'No description available' }}
                </p>
                
                <div class="project-stats">
                  <div class="stat-row">
                    <div class="stat-item">
                      <v-icon size="20" color="primary">mdi-calendar-start</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">Start Date</span>
                        <span class="stat-value">{{ project?.startDate ? formatDate(project.startDate) : 'N/A' }}</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <v-icon size="20" color="warning">mdi-calendar-end</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">End Date</span>
                        <span class="stat-value">{{ project?.endDate ? formatDate(project.endDate) : 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="stat-row">
                    <div class="stat-item">
                      <v-icon size="20" color="success">mdi-account-group</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">Team Size</span>
                        <span class="stat-value">{{ projectStats.teamSize }} members</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <v-icon size="20" color="info">mdi-domain</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">Departments</span>
                        <span class="stat-value">{{ projectStats.departmentsCount }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>

              <!-- Quick Actions Card -->
              <v-card class="actions-card" elevation="0" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <h3 class="card-title">Quick Actions</h3>
                <div class="actions-grid">
                  <v-btn 
                    :color="'var(--erp-accent-green)'" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="openAddTaskPanel"
                    v-if="permissions?.canCreateTask"
                  >
                    <v-icon size="20" class="mr-2">mdi-plus</v-icon>
                    Add Task
                  </v-btn>
                  <v-btn 
                    color="success" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="openInvitePanel"
                    v-if="myRole === 'PROJECT_OWNER' || myRole === 'PROJECT_MANAGER'"
                  >
                    <v-icon size="20" class="mr-2">mdi-account-plus</v-icon>
                    Invite User
                  </v-btn>
                  <v-btn 
                    color="primary" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="openAddDepartmentPanel"
                    v-if="myRole === 'PROJECT_OWNER'"
                  >
                    <v-icon size="20" class="mr-2">mdi-folder-plus</v-icon>
                    Add Department/Section
                  </v-btn>
                  <v-btn 
                    color="warning" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="scheduleMeeting"
                    v-if="permissions?.canSchedule"
                  >
                    <v-icon size="20" class="mr-2">mdi-calendar</v-icon>
                    Schedule
                  </v-btn>
                  <v-btn 
                    color="info" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="createReport"
                    v-if="permissions?.canReportTime"
                  >
                    <v-icon size="20" class="mr-2">mdi-file-document</v-icon>
                    Report
                  </v-btn>
                </div>
              </v-card>

              <!-- Progress Card -->
              <v-card class="progress-card" elevation="0" :style="{ background: 'var(--erp-card-bg)', color: 'var(--erp-text)' }">
                <h3 class="card-title">Project Progress</h3>
                <div class="progress-content">
                  <div class="progress-circle">
                    <v-progress-circular
                      :model-value="getProjectProgress()"
                      :color="getProgressColor(getProjectProgress())"
                      size="80"
                      width="8"
                    >
                      {{ getProjectProgress() }}%
                    </v-progress-circular>
                  </div>
                  <div class="progress-stats">
                    <div class="progress-stat">
                      <span class="stat-number">{{ tasks.length }}</span>
                      <span class="stat-label">Total Tasks</span>
                    </div>
                    <div class="progress-stat">
                      <span class="stat-number">{{ getCompletedTasksCount() }}</span>
                      <span class="stat-label">Completed</span>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>

            <!-- Right Column - Tasks & Sections / Dynamic Panels -->
            <div class="right-column">
              <div class="tasks-header">
                <h2 class="section-title">
                  {{ activePanel === 'list' ? 'Tasks & Sections' : panelTitle }}
                </h2>
                <div class="tasks-actions" v-if="activePanel !== 'list'">
                  <v-btn variant="text" size="small" @click="resetPanel">
                    <v-icon size="16" class="mr-2">mdi-arrow-left</v-icon>
                    Back
                  </v-btn>
                </div>
              </div>

              <!-- Dynamic Panel Content -->
              <div v-if="activePanel === 'addDepartment'" ref="addDepartmentSection">
                <v-form ref="addDepartmentForm" v-model="addDepartmentValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                         v-model="newDepartment.name"
                         label="Department Name"
                         variant="outlined"
                         :rules="[v=>!!v||'Required']"
                        class="workspace-input"
                       />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="newDepartment.type" :items="departmentTypeOptions" label="Type" variant="outlined" :rules="[v=>!!v||'Required']" class="workspace-select" :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }" />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea v-model="newDepartment.description" label="Description" variant="outlined" rows="3" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-switch v-model="newDepartment.isVisible" :color="'var(--erp-accent-green)'" label="Visible" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field v-model.number="newDepartment.order" type="number" min="0" label="Order" variant="outlined" />
                    </v-col>
                    <v-col cols="12">
                      <v-btn :color="'var(--erp-accent-green)'" :loading="submitting" @click="submitNewDepartment">Create Department</v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </div>

              <div v-else-if="activePanel === 'addTask'" ref="addTaskSection">
                <v-form ref="addTaskForm" v-model="addTaskValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="newTask.title"
                        label="Task Title"
                        variant="outlined"
                        :rules="[v=>!!v||'Required']"
                        class="workspace-input"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="newTask.priority" :items="priorityOptions" label="Priority" variant="outlined" :rules="[v=>!!v||'Required']" class="workspace-select" :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }" />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea v-model="newTask.description" label="Description" variant="outlined" rows="3" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="newTask.departmentId" :items="departmentSelectItems" item-title="name" item-value="id" label="Department" variant="outlined" :rules="[v=>!!v||'Required']" class="workspace-select" :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="newTask.assignedRoleId" :items="roleSelectItems" item-title="label" item-value="id" label="Assign To (optional)" variant="outlined" class="workspace-select" :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="newTask.dueDate"
                        label="Due Date"
                        type="date"
                        variant="outlined"
                        class="workspace-input"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="newTask.paymentAmount"
                        label="Payment Amount (SIZ)"
                        type="number"
                        variant="outlined"
                        class="workspace-input"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-btn :color="'var(--erp-accent-green)'" :loading="submitting" @click="submitNewTask">Create Task</v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </div>

              <div v-else-if="activePanel === 'invite'" ref="inviteSection">
                <v-form ref="inviteForm" v-model="inviteValid">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="invite.email" label="Invitee Email" variant="outlined" :rules="emailRules" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select v-model="invite.role" :items="inviteRoleOptions" label="Role" variant="outlined" :rules="[v=>!!v||'Required']" class="workspace-select" :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="invite.expiresAtDisplay"
                        label="Invite Expires"
                        type="datetime-local"
                        variant="outlined"
                        class="workspace-input"
                      />
                    </v-col>
                    
                    <!-- Payment Configuration Section -->
                    <v-col cols="12">
                      <v-divider class="my-4"></v-divider>
                      <h3 class="text-h6 mb-3" :style="{ color: 'var(--erp-text)' }">
                        <v-icon class="mr-2">mdi-cash</v-icon>
                        Payment Configuration
                      </h3>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select 
                        v-model="invite.paymentType" 
                        :items="paymentTypeOptions" 
                        item-title="label"
                        item-value="value"
                        label="Payment Type" 
                        variant="outlined"
                        :rules="[v=>!!v||'Required']"
                        class="workspace-select"
                        :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #title>
                              <div class="d-flex align-center">
                                <span>{{ item.raw.label }}</span>
                                <v-chip size="x-small" variant="tonal" class="ml-2" color="primary">
                                  {{ item.raw.value }}
                                </v-chip>
                              </div>
                            </template>
                            <template #subtitle>
                              <span class="text-caption">{{ item.raw.description }}</span>
                            </template>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                    
                    <!-- Salary Configuration -->
                    <template v-if="invite.paymentType === 'SALARY'">
                      <v-col cols="12" md="6">
                        <v-text-field 
                          v-model.number="invite.salaryAmount" 
                          label="Salary Amount (SIZ)" 
                          type="number"
                          variant="outlined" 
                          :rules="[v=>!!v||'Required', v=>v>0||'Must be positive']"
                          suffix="SIZ"
                          class="mt-2"
                          :class="['workspace-input', 'mt-2']"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select 
                          v-model="invite.salaryFrequency" 
                          :items="salaryFrequencyOptions" 
                          item-title="label"
                          item-value="value"
                          label="Salary Frequency" 
                          variant="outlined" 
                          :rules="[v=>!!v||'Required']"
                          class="workspace-select"
                          :menu-props="{ contentClass: 'workspace-select-menu', scrim: false }"
                        />
                      </v-col>
                    </template>
                    
                    <!-- Oversight Configuration -->
                    <template v-if="invite.paymentType === 'OVERSIGHT'">
                      <v-col cols="12" md="6">
                        <v-text-field 
                          v-model.number="invite.oversightRate" 
                          label="Oversight Rate (percentage of task payments)"
                          type="number"
                          variant="outlined" 
                          :rules="[v=>!!v||'Required', v=>v>0&&v<=100||'Must be 1-100%']"
                          suffix="%"
                          hint="Percentage of task payments (e.g., 5 for 5%)"
                          persistent-hint
                          class="workspace-input"
                        />
                      </v-col>
                    </template>
                    
                    <!-- Milestone Configuration -->
                    <template v-if="invite.paymentType === 'MILESTONE'">
                      <v-col cols="12" md="6">
                        <v-text-field 
                          v-model.number="invite.milestoneAmount" 
                          label="Milestone Payment Amount (SIZ)" 
                          type="number"
                          variant="outlined" 
                          :rules="[v=>!!v||'Required', v=>v>0||'Must be positive']"
                          suffix="SIZ"
                          class="workspace-input"
                        />
                      </v-col>
                    </template>
                    
                    <!-- Payment Summary -->
                    <v-col cols="12" v-if="invite.paymentType && invite.paymentType !== 'PER_TASK'">
                      <v-alert type="info" variant="tonal" class="mb-3">
                        <template #title>
                          <div class="d-flex align-center">
                            <v-icon class="mr-2">mdi-information</v-icon>
                            Payment Summary
                          </div>
                        </template>
                        <div v-if="invite.paymentType === 'SALARY' && invite.salaryAmount">
                          <strong>{{ invite.salaryAmount }} SIZ {{ invite.salaryFrequency?.toLowerCase() }}</strong>
                          <br>
                          <span class="text-caption">
                            Estimated monthly: {{ calculateMonthlySalary(invite.salaryAmount, invite.salaryFrequency) }} SIZ
                          </span>
                        </div>
                        <div v-else-if="invite.paymentType === 'OVERSIGHT' && invite.oversightRate">
                          <strong>{{ invite.oversightRate }}% of task payments</strong>
                          <br>
                          <span class="text-caption">Automatically calculated when tasks are approved</span>
                        </div>
                        <div v-else-if="invite.paymentType === 'MILESTONE' && invite.milestoneAmount">
                          <strong>{{ invite.milestoneAmount }} SIZ per milestone</strong>
                          <br>
                          <span class="text-caption">Paid when project milestones are reached</span>
                        </div>
                        <div class="mt-2">
                          <v-icon size="16" class="mr-1">mdi-alert-circle</v-icon>
                          <strong>Project owner will need to fund escrow for this team member</strong>
                        </div>
                      </v-alert>
                    </v-col>
                    
                    <v-col cols="12">
                      <v-alert v-if="inviteError" type="error" variant="tonal" class="mb-3">{{ inviteError }}</v-alert>
                      <v-btn :color="'var(--erp-accent-green)'" :loading="submitting" @click="submitInvite">Send Invite</v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </div>

              <!-- Default: Departments first, then divider, then tasks list -->
              <div v-else>
                <!-- Departments Summary -->
                <div class="departments-summary">
                  <div class="departments-header">
                    <h3 class="section-title">Departments</h3>
                  </div>
                  <div v-if="departments.length === 0" class="text-center py-6">
                    <v-icon size="28" color="grey-lighten-1" class="mb-2">mdi-domain</v-icon>
                    <div>No departments created yet</div>
                  </div>
                  <div v-else class="departments-chips">
                    <v-chip
                      v-for="dept in departments"
                      :key="dept.id"
                      :color="dept.type === 'MAJOR' ? 'primary' : 'success'"
                      variant="tonal"
                      size="small"
                      class="mr-2 mb-2"
                    >
                      {{ dept.name }} · {{ (tasks.filter(t => t.departmentId === dept.id)).length }} tasks
                    </v-chip>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- Tasks grouped by sections -->
                <div class="task-sections">
                  <div 
                    v-for="section in projectSections" 
                    :key="section.id"
                    class="task-section"
                  >
                  <div class="section-header" @click="toggleSection(section.id)">
                    <div class="section-info">
                      <v-icon 
                        :color="section.color" 
                        class="section-icon"
                      >
                        {{ section.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
                      </v-icon>
                      <h4 class="section-name">{{ section.name }}</h4>
                      <v-chip 
                        :color="section.color" 
                        size="small" 
                        variant="tonal"
                      >
                        {{ section.tasks.length }}
                      </v-chip>
                    </div>
                    <div class="section-actions">
                      <v-btn icon variant="text" size="small">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  
                  <div v-if="!section.collapsed" class="section-tasks">
                    <div 
                      v-for="task in section.tasks" 
                      :key="task.id"
                      class="task-item"
                    >
                      <div class="task-content">
                        <v-checkbox
                          v-model="task.completed"
                          :color="section.color"
                          hide-details
                          class="task-checkbox"
                        />
                        <div class="task-details">
                          <div class="task-title">{{ task.title }}</div>
                          <div class="task-meta">
                            <v-chip 
                              :color="getTaskStatusColor(task.completed ? 'COMPLETED' : 'PENDING')" 
                              size="x-small" 
                              variant="tonal"
                            >
                              {{ getTaskStatusLabel(task.completed ? 'COMPLETED' : 'PENDING') }}
                            </v-chip>
                            <v-chip 
                              :color="getPriorityColor(task.priority)" 
                              size="x-small" 
                              variant="outlined"
                            >
                              {{ getPriorityLabel(task.priority) }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                      <div class="task-actions">
                        <v-btn icon variant="text" size="small">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon variant="text" size="small">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </v-container>
      </div>
    </div>
  </ProjectAccessGate>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNextAuth } from '@/composables/useNextAuth';
import { projectApi, taskApi, departmentApi, userRoleApi, projectInviteApi, projectAccessApi, type Project, type Task, type Department, type UserRole } from '@/services/projectApi';
import ProjectAccessGate from '@/components/ProjectAccessGate.vue';
import PaymentNotificationBanner from '@/components/PaymentNotificationBanner.vue';

const route = useRoute();
const router = useRouter();
const { user } = useNextAuth();
const projectId = route.params.id as string;

// Panel state
const activePanel = ref<'list'|'addDepartment'|'addTask'|'invite'>('list');
const panelTitle = computed(() => {
  switch (activePanel.value) {
    case 'addDepartment': return 'Add Department/Section';
    case 'addTask': return 'Add Task';
    case 'invite': return 'Invite Member';
    default: return 'Tasks & Sections';
  }
});

// Real project data from API
const project = ref<Project | null>(null);
const departments = ref<Department[]>([]);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
const myRole = ref<'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE' | null>(null);
const permissions = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const submitting = ref(false);
const loadInFlight = ref(false);

// Forms state
const addDepartmentForm = ref();
const addTaskForm = ref();
const inviteForm = ref();
const addDepartmentValid = ref(false);
const addTaskValid = ref(false);
const inviteValid = ref(false);

// Form section refs for auto-scroll
const addDepartmentSection = ref();
const addTaskSection = ref();
const inviteSection = ref();

const newDepartment = ref({
  name: '',
  type: 'MAJOR',
  description: '',
  isVisible: true,
  order: 0
});

const newTask = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  departmentId: '',
  assignedRoleId: '' as string | undefined,
  dueDate: '',
  paymentAmount: undefined as number | undefined
});

const invite = ref({
  email: '',
  role: 'EMPLOYEE',
  expiresAtDisplay: '', // datetime-local input value
  // Payment configuration
  paymentType: 'PER_TASK' as 'PER_TASK' | 'SALARY' | 'OVERSIGHT' | 'MILESTONE' | 'HYBRID',
  salaryAmount: undefined as number | undefined,
  salaryFrequency: 'WEEKLY' as 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY',
  oversightRate: undefined as number | undefined,
  milestoneAmount: undefined as number | undefined
});
const inviteError = ref<string | null>(null);

// Options
const departmentTypeOptions = ['MAJOR', 'MINOR'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const inviteRoleOptions = computed(() => {
  if (myRole.value === 'PROJECT_OWNER') return ['PROJECT_MANAGER', 'EMPLOYEE'];
  if (myRole.value === 'PROJECT_MANAGER') return ['EMPLOYEE'];
  return [];
});

const paymentTypeOptions = [
  { value: 'PER_TASK', label: 'Per Task', description: 'Paid for each completed task' },
  { value: 'SALARY', label: 'Salary', description: 'Regular recurring payments' },
  { value: 'OVERSIGHT', label: 'Oversight', description: 'Percentage of team task payments' },
  { value: 'MILESTONE', label: 'Milestone', description: 'Paid when project milestones are reached' },
  { value: 'HYBRID', label: 'Hybrid', description: 'Combination of multiple payment types' }
];

const salaryFrequencyOptions = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' }
];
const emailRules = [
  (v: string) => !!v || 'Required',
  (v: string) => /.+@.+\..+/.test(v) || 'Invalid email'
];

const departmentSelectItems = computed(() => departments.value);
const roleSelectItems = computed(() => teamMembers.value.map(r => ({ id: r.id, label: r.user?.firstName ? `${r.user.firstName} ${r.user.lastName || ''}`.trim() : r.user?.email })));

// Load project data from API
const loadProjectData = async () => {
  if (loadInFlight.value) return;
  try {
    loadInFlight.value = true;
    loading.value = true;
    error.value = null;
    
    const projectResponse = await projectApi.getProject(projectId);
    project.value = projectResponse;
    
    // Load role and permissions (with fallback to existing endpoints)
    try {
      const [roleRes, permRes] = await Promise.all([
        projectAccessApi.getMyRole(projectId),
        projectAccessApi.getPermissions(projectId)
      ]);
      // Support both legacy { role } and new role-aware { primaryRole, roles }
      myRole.value = (roleRes?.primaryRole || roleRes?.role || null) as any;
      permissions.value = permRes || {};
    } catch (error) {
      console.warn('Role-aware endpoints not available, using fallback:', error);
      // Fallback: get role from existing endpoint
      try {
        const roleResponse = await userRoleApi.getUserRoleInProject(projectId, user.value?.id || '');
        myRole.value = roleResponse?.role || null;
        // Compute basic permissions from role
        permissions.value = {
          canCreateTask: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canAssignTask: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canEditTask: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canManageDepartments: myRole.value === 'PROJECT_OWNER',
          canSchedule: myRole.value === 'PROJECT_OWNER' || myRole.value === 'PROJECT_MANAGER',
          canReportTime: true // Allow all roles to report for now
        };
      } catch (fallbackError) {
        console.error('Fallback role loading failed:', fallbackError);
        myRole.value = null;
        permissions.value = {};
      }
    }

    // Fetch accessible departments, scoped tasks, and accessible team (with fallback)
    try {
      const [departmentsResponse, tasksResponse, teamResponse] = await Promise.all([
        departmentApi.getAccessibleDepartments(projectId),
        taskApi.getProjectTasksWithFilter(projectId, {
          scope: myRole.value === 'PROJECT_OWNER' ? 'all' : myRole.value === 'PROJECT_MANAGER' ? 'department' : 'assigned_to_me',
          fields: 'minimal',
          sortBy: 'dueDate',
          sortOrder: 'asc'
        }),
        userRoleApi.getAccessibleProjectTeam(projectId)
      ]);

      departments.value = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse.departments || departmentsResponse.data || []);
      tasks.value = (tasksResponse?.tasks) || [];
      teamMembers.value = Array.isArray(teamResponse) ? teamResponse : (teamResponse.userRoles || teamResponse.data || []);
    } catch (error) {
      console.warn('Role-aware endpoints not available, using fallback:', error);
      // Fallback: use original endpoints
      const [departmentsResponse, tasksResponse, teamResponse] = await Promise.all([
        departmentApi.getProjectDepartments(projectId),
        taskApi.getProjectTasks(projectId),
        userRoleApi.getProjectUserRoles(projectId)
      ]);

      departments.value = Array.isArray(departmentsResponse) ? departmentsResponse : (departmentsResponse.departments || []);
      tasks.value = tasksResponse?.tasks || [];
      teamMembers.value = Array.isArray(teamResponse) ? teamResponse : (teamResponse.userRoles || []);
    }
  } catch (err) {
    error.value = 'Failed to load project data';
    console.error('Error loading project data:', err);
  } finally {
    loading.value = false;
    loadInFlight.value = false;
  }
};

// Actions to switch panels
const resetPanel = () => {
  activePanel.value = 'list';
};
const openAddDepartmentPanel = () => {
  newDepartment.value = { name: '', type: 'MAJOR', description: '', isVisible: true, order: departments.value.length };
  activePanel.value = 'addDepartment';
  // Auto-scroll to form on mobile
  scrollToForm(addDepartmentSection);
};
const openAddTaskPanel = () => {
  newTask.value = { title: '', description: '', priority: 'MEDIUM', departmentId: departments.value[0]?.id || '', assignedRoleId: undefined, dueDate: '', paymentAmount: undefined };
  activePanel.value = 'addTask';
  // Auto-scroll to form on mobile
  scrollToForm(addTaskSection);
};
const openInvitePanel = () => {
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 7);
  // Convert to datetime-local format (YYYY-MM-DDTHH:mm)
  const pad = (n: number) => String(n).padStart(2, '0');
  const dtl = `${defaultExpiry.getFullYear()}-${pad(defaultExpiry.getMonth()+1)}-${pad(defaultExpiry.getDate())}T${pad(defaultExpiry.getHours())}:${pad(defaultExpiry.getMinutes())}`;
  invite.value = { 
    email: '', 
    role: 'EMPLOYEE', 
    expiresAtDisplay: dtl,
    paymentType: 'PER_TASK',
    salaryAmount: undefined,
    salaryFrequency: 'WEEKLY',
    oversightRate: undefined,
    milestoneAmount: undefined
  };
  inviteError.value = null;
  activePanel.value = 'invite';
  // Auto-scroll to form on mobile
  scrollToForm(inviteSection);
};

// Submit handlers
const submitNewDepartment = async () => {
  const isValid = await (addDepartmentForm.value as any)?.validate?.();
  if (isValid === false || addDepartmentValid.value === false) return;
  submitting.value = true;
  try {
    await departmentApi.createProjectDepartment(projectId, newDepartment.value as any);
    await loadProjectData();
    resetPanel();
  } catch (e) {
    console.error('Failed to create department', e);
  } finally {
    submitting.value = false;
  }
};

const submitNewTask = async () => {
  const isValid = await (addTaskForm.value as any)?.validate?.();
  if (isValid === false || addTaskValid.value === false) return;
  submitting.value = true;
  try {
    // Convert date to ISO string with 12:00 PM time for API
    const taskData = {
      ...newTask.value,
      dueDate: newTask.value.dueDate ? new Date(newTask.value.dueDate + 'T12:00:00').toISOString() : undefined
    };
    await taskApi.createProjectTaskRoleAware(projectId, taskData as any);
    await loadProjectData();
    resetPanel();
  } catch (e) {
    console.error('Failed to create task', e);
  } finally {
    submitting.value = false;
  }
};

const submitInvite = async () => {
  const isValid = await (inviteForm.value as any)?.validate?.();
  if (isValid === false || inviteValid.value === false) return;
  submitting.value = true;
  try {
    inviteError.value = null;
    // Ensure ISO string for expiresAt
    const expiresAtIso = new Date(invite.value.expiresAtDisplay).toISOString();
    
    // Prepare invite data with payment configuration
    const inviteData: any = {
      projectId,
      email: invite.value.email.trim(),
      role: invite.value.role as any,
      expiresAt: expiresAtIso
    };

    // Add payment configuration if provided
    if (invite.value.paymentType && invite.value.paymentType !== 'PER_TASK') {
      inviteData.paymentType = invite.value.paymentType;
      
      if (invite.value.paymentType === 'SALARY' && invite.value.salaryAmount) {
        inviteData.salaryAmount = invite.value.salaryAmount;
        inviteData.salaryFrequency = invite.value.salaryFrequency;
      }
      
      if (invite.value.paymentType === 'OVERSIGHT' && invite.value.oversightRate) {
        inviteData.oversightRate = invite.value.oversightRate;
      }
      
      if (invite.value.paymentType === 'MILESTONE' && invite.value.milestoneAmount) {
        inviteData.milestoneAmount = invite.value.milestoneAmount;
      }
    }

    await projectInviteApi.createInvite(inviteData);
    await loadProjectData();
    resetPanel();
    
    // Show success message with payment info
    if (inviteData.paymentType && inviteData.paymentType !== 'PER_TASK') {
      let paymentInfo = '';
      if (inviteData.paymentType === 'SALARY') {
        paymentInfo = `\n💰 Salary: ${inviteData.salaryAmount} SIZ ${inviteData.salaryFrequency.toLowerCase()}`;
      } else if (inviteData.paymentType === 'OVERSIGHT') {
        paymentInfo = `\n👥 Oversight: ${(inviteData.oversightRate * 100).toFixed(1)}% of task payments`;
      } else if (inviteData.paymentType === 'MILESTONE') {
        paymentInfo = `\n🎯 Milestone: ${inviteData.milestoneAmount} SIZ per milestone`;
      }
      
      console.log(`✅ Invite sent successfully!${paymentInfo}\n\n⚠️ Project owner needs to fund escrow for this team member.`);
    }
  } catch (e: any) {
    console.error('Failed to send invite', e);
    const status = e?.response?.status;
    const msg = e?.response?.data?.message || '';
    if (status === 400) {
      inviteError.value = msg || 'Validation error or duplicate pending invite.';
    } else if (status === 403) {
      inviteError.value = 'Insufficient permissions to invite this role.';
    } else {
      inviteError.value = 'Server error. Please try again.';
    }
  } finally {
    submitting.value = false;
  }
};

// Computed properties for template
const projectStats = computed(() => ({
  teamSize: teamMembers.value.length,
  departmentsCount: departments.value.length,
  tasksCount: tasks.value.length,
  completedTasks: tasks.value.filter(t => t.status === 'COMPLETED').length
}));

const projectSections = computed(() => {
  return departments.value.map(dept => ({
    id: dept.id,
    name: dept.name,
    color: dept.type === 'MAJOR' ? 'primary' : 'success',
    collapsed: false,
    tasks: tasks.value.filter(task => task.departmentId === dept.id).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: 'Medium', // Default priority
      dueDate: task.updatedAt,
      completed: task.status === 'COMPLETED',
      assignees: [{ color: 'blue' }] // Default assignee color
    }))
  }));
});

// Mock data removed - now using computed projectSections above

// Computed properties
const totalTasks = computed(() => {
  return projectSections.value.reduce((total, section) => total + section.tasks.length, 0);
});

const completedTasks = computed(() => {
  return projectSections.value.reduce((total, section) => {
    return total + section.tasks.filter(task => task.completed).length;
  }, 0);
});

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
  return colors[status] || 'primary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending',
    'COMPLETED': 'Completed'
  };
  return labels[status] || status;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'success';
    default: return 'primary';
  }
};

const getAvatarColor = (color: string) => {
  switch (color) {
    case 'red': return 'red';
    case 'purple': return 'purple';
    case 'blue': return 'blue';
    case 'green': return 'green';
    case 'orange': return 'orange';
    default: return 'grey';
  }
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

// Helper function to calculate monthly salary
const calculateMonthlySalary = (amount: number, frequency: string) => {
  if (!amount || !frequency) return 0;

  switch (frequency) {
    case 'WEEKLY':
      return Math.round(amount * 4.33); // Average weeks per month
    case 'BIWEEKLY':
      return Math.round(amount * 2.17); // Average bi-weekly periods per month
    case 'MONTHLY':
      return amount;
    default:
      return 0;
  }
};

// Auto-scroll function for mobile
const scrollToForm = async (formRef: any) => {
  // Only auto-scroll on small screens (mobile/tablet)
  if (window.innerWidth <= 768 && formRef?.value) {
    // Wait for Vue to update the DOM
    await nextTick();
    
    // Additional delay for mobile simulation in dev tools
    setTimeout(() => {
      if (formRef?.value) {
        formRef.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 300); // Increased delay for mobile simulation
  }
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

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical'
  };
  return labels[priority] || priority;
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Action functions
const toggleSection = (sectionId: string) => {
  const section = projectSections.value.find(s => s.id === sectionId);
  if (section) {
    section.collapsed = !section.collapsed;
  }
};

const addTaskToSection = (sectionId: string) => {
  console.log('Adding task to section:', sectionId);
  // TODO: Implement add task functionality
};

const addTask = () => {
  console.log('Add task clicked');
  // TODO: Implement add task functionality
};

const addMember = () => {
  console.log('Add member clicked');
  // TODO: Implement add member functionality
};

const addDepartment = () => {
  console.log('Add department clicked');
  // TODO: Implement add department functionality
};

const scheduleMeeting = () => {
  console.log('Schedule meeting clicked');
  // TODO: Implement schedule meeting functionality
};

const createReport = () => {
  console.log('Create report clicked');
  // TODO: Implement create report functionality
};

// Access gate handlers
const handleAccessGranted = (userRole: UserRole) => {
  console.log('Access granted with role:', userRole.role);
  // Load project data once access is confirmed
  if (projectId) {
    loadProjectData();
  }
};

const handleAccessDenied = () => {
  console.log('Access denied to project:', projectId);
  // Redirect to projects list or dashboard
  router.push('/projects');
};

onMounted(() => {
  // Don't load project data here - wait for access gate to confirm access
  if (project.value) {
    console.log('ProjectWorkspace mounted for project:', project.value.name);
  }
});
</script>

<style scoped>
.project-workspace {
  background: var(--erp-page-bg);
  min-height: 100vh;
}

.workspace-header {
  background: var(--erp-header-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom: 1px solid var(--erp-border);
}

.header-content {
  width: 100%;
}

/* Responsive Header Layout Control */
.desktop-header-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.mobile-header-layout {
  display: none;
}

@media (max-width: 768px) {
  .desktop-header-layout {
    display: none;
  }
  
  .mobile-header-layout {
    display: block;
  }
  
  /* Fix page wrapper for small screens */
  .project-workspace {
    padding-top: 0;
  }
  
  .workspace-header {
    padding: 8px 12px;
    position: relative;
    top: auto;
    left: auto;
    right: auto;
  }
  
  .workspace-content {
    padding-top: 0;
  }
}

.header-left {
  display: flex;
  align-items: center;
}

.back-btn {
  margin-right: 16px;
}

.project-info {
  display: flex;
  align-items: baseline;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin-right: 12px;
}

.project-meta {
  display: flex;
  align-items: baseline;
}

.project-type {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.member-avatar {
  margin-right: -8px;
}

.more-members {
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-btn {
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 600;
  text-transform: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workspace-content {
  padding-top: 120px; /* Adjust for fixed header */
  padding-bottom: 24px;
}

@media (max-width: 768px) {
  .workspace-content {
    padding-top: 0;
    padding-bottom: 16px;
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 24px;
  padding: 0 24px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card,
.actions-card,
.progress-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--erp-border);
  background: var(--erp-card-bg);
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.project-description {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  line-height: 1.6;
  margin-bottom: 24px;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--erp-text);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.action-btn {
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  text-transform: none;
}

.progress-card {
  margin-top: 24px;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.progress-circle {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.progress-stat {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
  display: block;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.tasks-actions {
  display: flex;
  gap: 12px;
}

.departments-summary {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  padding: 16px;
}

.departments-chips {
  display: flex;
  flex-wrap: wrap;
}

.task-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-section {
  background: var(--erp-surface);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--erp-border);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 16px 20px;
  background: var(--erp-surface);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-info {
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 12px;
}

.section-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.section-tasks {
  padding: 16px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--erp-border);
  margin-bottom: 12px;
  background: var(--erp-card-bg);
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.7;
  background: var(--erp-surface);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--erp-text);
  opacity: 0.7;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-checkbox {
  flex-shrink: 0;
}

.task-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-date {
  color: var(--erp-text);
  opacity: 0.7;
  font-size: 0.75rem;
}

.task-description {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-assignees {
  display: flex;
  align-items: center;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-task-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--erp-text);
  opacity: 0.7;
  font-size: 0.875rem;
}

.add-task-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

@media (max-width: 960px) {
  .workspace-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }
}

@media (max-width: 768px) {
  .workspace-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 0 12px;
  }
  
  .workspace-content {
    padding-top: 0;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .team-preview {
    width: 100%;
    justify-content: space-between;
  }

  .avatar-stack {
    flex-wrap: wrap;
    gap: 8px;
  }

  .member-avatar {
    margin-right: 0;
  }

  .more-members {
    order: 1;
  }

  .invite-btn {
    order: 2;
  }

  .header-actions {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }

  .workspace-content {
    padding-top: 100px; /* Adjust for fixed header */
  }

  .project-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.project-workspace-page {
   display: flex;
   flex-direction: column;
   gap: 24px;
   min-height: 100vh;
}

.workspace-input,
.workspace-select {
  :deep(.v-field) {
    background: color-mix(in srgb, var(--erp-surface) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--erp-border) 80%, transparent);
    border-radius: 12px;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  :deep(.v-field__outline) {
    display: none;
  }

  :deep(.v-field__input) {
    color: var(--erp-text);
  }

  :deep(.v-label) {
    color: color-mix(in srgb, var(--erp-text) 70%, transparent);
    opacity: 0.9;
  }

  :deep(.v-field--focused .v-field__input) {
    color: var(--erp-text);
  }

  :deep(.v-field--focused) {
    border-color: var(--erp-accent-blue);
    background: color-mix(in srgb, var(--erp-surface) 85%, transparent);
  }

  :deep(.v-list) {
    background: color-mix(in srgb, var(--erp-surface) 98%, transparent);
    color: var(--erp-text);
  }

  :deep(.v-list-item--active) {
    background: color-mix(in srgb, var(--erp-accent-blue) 12%, transparent);
    color: var(--erp-text);
  }
}

:global(.workspace-select-menu) {
  background: color-mix(in srgb, var(--erp-surface) 98%, transparent) !important;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--erp-border) 85%, transparent);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18) !important;
}

:global(.workspace-select-menu .v-list) {
  background: transparent !important;
  color: var(--erp-text);
}

:global(.workspace-select-menu .v-list-item) {
  color: var(--erp-text);
}

:global(.workspace-select-menu .v-list-item--active) {
  background: color-mix(in srgb, var(--erp-accent-blue) 16%, transparent) !important;
}

:global(.workspace-select-menu .v-overlay__scrim) {
  background: transparent !important;
}
</style>

