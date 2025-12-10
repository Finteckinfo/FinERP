<template>
  <div class="invitations-page">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Project Invitations</h1>
          <p class="text-body-1 text-medium-emphasis">
            Manage all your pending project invitations
          </p>
        </div>
        <v-btn 
          variant="outlined" 
          @click="refreshInvites"
          :loading="invitesLoading"
          :style="{ color: 'var(--erp-text)', borderColor: 'var(--erp-border)' }"
        >
          <v-icon size="16" class="mr-2">mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
          <v-card-text class="text-center pa-4">
            <v-avatar size="60" class="mb-3" :style="{ background: 'var(--erp-accent-indigo)' }">
              <v-icon size="30" color="white">mdi-email-outline</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold">{{ pendingInvites.length }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">Pending Invitations</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
          <v-card-text class="text-center pa-4">
            <v-avatar size="60" class="mb-3" :style="{ background: 'var(--erp-accent-green)' }">
              <v-icon size="30" color="white">mdi-check-circle</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold">{{ acceptedCount }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">Accepted Today</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
          <v-card-text class="text-center pa-4">
            <v-avatar size="60" class="mb-3" :style="{ background: 'var(--erp-accent-orange)' }">
              <v-icon size="30" color="white">mdi-clock-alert</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold">{{ expiringSoonCount }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">Expiring Soon</p>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
          <v-card-text class="text-center pa-4">
            <v-avatar size="60" class="mb-3" :style="{ background: 'var(--erp-accent-purple)' }">
              <v-icon size="30" color="white">mdi-account-group</v-icon>
            </v-avatar>
            <h3 class="text-h4 font-weight-bold">{{ totalProjectsCount }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">Total Projects</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card elevation="0" class="mb-6" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
      <v-card-text class="pa-4">
        <div class="d-flex flex-wrap align-center gap-3">
          <v-select
            v-model="selectedRole"
            :items="roleOptions"
            label="Filter by Role"
            variant="outlined"
            density="compact"
            clearable
            :style="{ minWidth: '150px' }"
          ></v-select>
          
          <v-select
            v-model="selectedPriority"
            :items="priorityOptions"
            label="Filter by Priority"
            variant="outlined"
            density="compact"
            clearable
            :style="{ minWidth: '150px' }"
          ></v-select>
          
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="Filter by Status"
            variant="outlined"
            density="compact"
            clearable
            :style="{ minWidth: '150px' }"
          ></v-select>
          
          <v-spacer></v-spacer>
          
          <v-btn 
            variant="text" 
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            <v-icon size="16" class="mr-1">mdi-filter-remove</v-icon>
            Clear Filters
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Invitations List -->
    <v-card elevation="0" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)', color: 'var(--erp-text)' }">
      <v-card-title class="pa-4 pb-2">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="mr-3" size="24" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-email-multiple</v-icon>
            <span class="text-h5 font-weight-medium">All Invitations</span>
            <v-chip 
              v-if="filteredInvites.length > 0" 
              size="small" 
              class="ml-3"
              :style="{ background: 'color-mix(in srgb, var(--erp-accent-green) 20%, transparent)', color: 'var(--erp-text)' }"
            >
              {{ filteredInvites.length }} Found
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-4 pt-0">
        <!-- Loading State -->
        <div v-if="invitesLoading" class="text-center pa-8">
          <v-progress-circular indeterminate size="48" :style="{ '--v-theme-primary': 'var(--erp-accent-indigo)' }"></v-progress-circular>
          <p class="text-body-1 text-medium-emphasis mt-4">Loading invitations...</p>
        </div>

        <!-- No Invites State -->
        <div v-else-if="filteredInvites.length === 0" class="text-center pa-8">
          <v-avatar size="120" class="mb-4" :style="{ background: 'var(--erp-surface)' }">
            <v-icon size="60" :style="{ color: 'var(--erp-border)' }">mdi-email-check</v-icon>
          </v-avatar>
          <h4 class="text-h5 text-medium-emphasis mb-2">
            {{ hasActiveFilters ? 'No Invitations Match Filters' : 'No Pending Invitations' }}
          </h4>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ hasActiveFilters ? 'Try adjusting your filters to see more results.' : 'You\'re all caught up! No project invitations waiting for your response.' }}
          </p>
          <v-btn 
            v-if="hasActiveFilters"
            variant="outlined" 
            @click="clearFilters"
            :style="{ color: 'var(--erp-text)', borderColor: 'var(--erp-border)' }"
          >
            <v-icon size="16" class="mr-1">mdi-filter-remove</v-icon>
            Clear Filters
          </v-btn>
          <v-btn 
            v-else
            variant="outlined" 
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
            v-for="invite in filteredInvites" 
            :key="invite.id"
            class="invite-card mb-4"
          >
            <v-card variant="outlined" class="invite-item" elevation="1" :style="{ background: 'var(--erp-card-bg)', border: '1px solid var(--erp-border)' }">
              <v-card-text class="pa-4">
                <div class="d-flex align-start justify-space-between">
                  <div class="invite-info flex-grow-1">
                    <!-- Role and Priority Chips -->
                    <div class="d-flex align-center mb-3 flex-wrap gap-2">
                      <v-chip 
                        size="small" 
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
                    <div class="invite-details d-flex align-center text-caption text-medium-emphasis mb-3 flex-wrap gap-3">
                      <div class="d-flex align-center">
                        <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-calendar</v-icon>
                        <span>{{ formatDate(invite.project?.startDate) }} - {{ formatDate(invite.project?.endDate) }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-email</v-icon>
                        <span>{{ invite.email }}</span>
                      </div>
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
                    <div class="project-stats-preview d-flex align-center text-caption text-medium-emphasis flex-wrap gap-3">
                      <div class="d-flex align-center">
                        <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-green)' }">mdi-account-group</v-icon>
                        <span>Team: {{ invite.project?.teamSize || 'N/A' }}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-icon size="16" class="mr-1" :style="{ color: 'var(--erp-accent-indigo)' }">mdi-folder</v-icon>
                        <span>Type: {{ getProjectTypeLabel(invite.project?.type || 'PROGRESSIVE') }}</span>
                      </div>
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
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { projectInviteApi } from '@/services/projectApi';

const router = useRouter();

// Reactive data
const pendingInvites = ref<any[]>([]);
const invitesLoading = ref(false);

// Filter states
const selectedRole = ref<string | null>(null);
const selectedPriority = ref<string | null>(null);
const selectedStatus = ref<string | null>(null);

// Filter options
const roleOptions = [
  { title: 'Project Manager', value: 'PROJECT_MANAGER' },
  { title: 'Employee', value: 'EMPLOYEE' },
  { title: 'Client', value: 'CLIENT' }
];

const priorityOptions = [
  { title: 'Low', value: 'LOW' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'High', value: 'HIGH' },
  { title: 'Urgent', value: 'URGENT' }
];

const statusOptions = [
  { title: 'Pending', value: 'PENDING' },
  { title: 'Accepted', value: 'ACCEPTED' },
  { title: 'Declined', value: 'DECLINED' },
  { title: 'Expired', value: 'EXPIRED' }
];

// Computed properties
const filteredInvites = computed(() => {
  let filtered = pendingInvites.value;

  if (selectedRole.value) {
    filtered = filtered.filter(invite => invite.role === selectedRole.value);
  }

  if (selectedPriority.value) {
    filtered = filtered.filter(invite => invite.project?.priority === selectedPriority.value);
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(invite => invite.status === selectedStatus.value);
  }

  return filtered;
});

const hasActiveFilters = computed(() => {
  return selectedRole.value || selectedPriority.value || selectedStatus.value;
});

const acceptedCount = computed(() => {
  // This would come from API in real implementation
  return 0;
});

const expiringSoonCount = computed(() => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
  
  return pendingInvites.value.filter(invite => {
    if (!invite.expiresAt) return false;
    const expiresAt = new Date(invite.expiresAt);
    return expiresAt <= threeDaysFromNow && expiresAt > now;
  }).length;
});

const totalProjectsCount = computed(() => {
  // This would come from API in real implementation
  return pendingInvites.value.length;
});

// Helper functions
const getRoleIcon = (role: string) => {
  const icons: Record<string, string> = {
    'PROJECT_MANAGER': 'mdi-account-tie',
    'EMPLOYEE': 'mdi-account',
    'CLIENT': 'mdi-account-star'
  };
  return icons[role] || 'mdi-account';
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'PROJECT_MANAGER': 'Project Manager',
    'EMPLOYEE': 'Employee',
    'CLIENT': 'Client'
  };
  return labels[role] || role;
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'URGENT': 'Urgent'
  };
  return labels[priority] || priority;
};

const getProjectTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'PROGRESSIVE': 'Progressive',
    'FIXED': 'Fixed',
    'HOURLY': 'Hourly'
  };
  return labels[type] || type;
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const formatRelativeDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `in ${diffDays} days`;
};

// API functions
const loadPendingInvites = async () => {
  try {
    invitesLoading.value = true;
    const response = await projectInviteApi.getUserInvites();
    console.log('Invites API response:', response);

    let invites = [];
    if (Array.isArray(response)) {
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
    if (error.response?.status === 404) {
      console.warn('Invites endpoint not found - backend may not be fully implemented');
    }
  } finally {
    invitesLoading.value = false;
  }
};

const refreshInvites = () => {
  loadPendingInvites();
};

const clearFilters = () => {
  selectedRole.value = null;
  selectedPriority.value = null;
  selectedStatus.value = null;
};

const acceptInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;

  invite.loading = true;

  try {
    console.log('Accepting invite:', inviteId);
    await projectInviteApi.acceptInvite(inviteId);
    console.log('Invite accepted successfully');
    
    // Remove from list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    
    // Show success message
    // toast.success('Project invitation accepted successfully!');
  } catch (error: any) {
    console.error('Failed to accept invite:', error);
    
    if (error.response?.status === 404) {
      console.error('Invite not found - may have been deleted or expired');
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    } else if (error.response?.status === 403) {
      console.error('Access denied - user may not have permission to accept this invite');
    } else if (error.response?.status === 409) {
      console.error('Conflict - invite may have already been accepted or declined');
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    }
    
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
    await projectInviteApi.declineInvite(inviteId);
    console.log('Invite declined successfully');
    
    // Remove from list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    
    // Show success message
    // toast.success('Project invitation declined.');
  } catch (error: any) {
    console.error('Failed to decline invite:', error);
    
    if (error.response?.status === 404) {
      console.error('Invite not found - may have been deleted or expired');
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    } else if (error.response?.status === 403) {
      console.error('Access denied - user may not have permission to decline this invite');
    } else if (error.response?.status === 409) {
      console.error('Conflict - invite may have already been accepted or declined');
      pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    }
    
    // toast.error('Failed to decline invitation. Please try again.');
  } finally {
    invite.loading = false;
  }
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

const viewProjectDetails = (projectId: string) => {
  if (projectId) {
    router.push(`/projects/${projectId}`);
  }
};

// Lifecycle
onMounted(() => {
  loadPendingInvites();
});
</script>

<style scoped>
.invitations-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  border-bottom: 1px solid var(--erp-border);
  padding-bottom: 24px;
}

.invite-card {
  transition: all 0.3s ease;
}

.invite-item {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid var(--erp-border);
}

.invite-item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
  border-color: var(--erp-accent-indigo);
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
  /* No scrollbar needed - content fits naturally */
}

/* Invite Message Styling */
.invite-message {
  border-left: 3px solid var(--erp-accent-indigo);
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
  border-top: 1px solid var(--erp-border);
  margin-top: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .invitations-page {
    padding: 16px;
  }
  
  .page-header {
    padding-bottom: 16px;
  }
  
  .page-header .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .invite-item {
    margin: 0 -4px;
    border-radius: 8px;
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
}

@media (max-width: 480px) {
  .invitations-page {
    padding: 12px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .page-header p {
    font-size: 0.9rem;
  }
}
</style>
