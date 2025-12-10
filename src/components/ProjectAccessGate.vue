<template>
  <div :class="{ 'dark-theme': isDark }">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-4">Checking project access...</p>
    </div>
    
    <!-- Access Denied -->
    <div v-else-if="!hasAccess" class="text-center py-8">
      <v-icon size="64" color="error">mdi-lock</v-icon>
      <h3 class="text-h6 mt-4 text-error">Access Denied</h3>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        You don't have permission to access this project.
      </p>
      <v-btn color="primary" @click="$router.push('/dashboard')">
        Go to Dashboard
      </v-btn>
    </div>
    
    <!-- Project Acceptance Required -->
    <div v-else-if="needsAcceptance" class="text-center py-8">
      <v-icon size="64" color="warning">mdi-clock-outline</v-icon>
      <h3 class="text-h6 mt-4 text-warning">Project Access Pending</h3>
      <p class="text-body-2 text-grey-darken-1 mb-4">
        You need to accept this project invitation before you can access it.
      </p>
      <v-btn color="primary" @click="showAcceptanceModal = true">
        Review Project Details
      </v-btn>
    </div>
    
    <!-- Access Granted -->
    <div v-else>
      <slot></slot>
    </div>
    
    <!-- Project Acceptance Modal -->
    <v-dialog v-model="showAcceptanceModal" persistent max-width="600">
      <v-card :class="{ 'dark-theme': isDark }">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-handshake</v-icon>
          Accept Project Invitation
        </v-card-title>
        
        <v-card-text>
          <div v-if="projectInvite" class="project-acceptance">
            <h4 class="text-h6 mb-3">{{ projectInvite.project.name }}</h4>
            
            <div class="acceptance-details">
              <div class="detail-row">
                <v-icon size="small" color="grey">mdi-account-tie</v-icon>
                <span class="ml-2">
                  <strong>Your Role:</strong> 
                  <v-chip 
                    :color="getRoleColor(projectInvite.role)" 
                    variant="tonal" 
                    size="small"
                    class="ml-2"
                  >
                    {{ getRoleLabel(projectInvite.role) }}
                  </v-chip>
                </span>
              </div>
              
              <div class="detail-row">
                <v-icon size="small" color="grey">mdi-text</v-icon>
                <span class="ml-2">
                  <strong>Description:</strong> {{ projectInvite.project.description || 'No description provided' }}
                </span>
              </div>
              
              <div class="detail-row">
                <v-icon size="small" color="grey">mdi-calendar-range</v-icon>
                <span class="ml-2">
                  <strong>Timeline:</strong> {{ formatDate(projectInvite.project.startDate) }} - {{ formatDate(projectInvite.project.endDate) }}
                </span>
              </div>
              
              <div class="detail-row">
                <v-icon size="small" color="grey">mdi-flag</v-icon>
                <span class="ml-2">
                  <strong>Priority:</strong> 
                  <v-chip 
                    :color="getPriorityColor(projectInvite.project.priority)" 
                    variant="tonal" 
                    size="small"
                    class="ml-2"
                  >
                    {{ getPriorityLabel(projectInvite.project.priority) }}
                  </v-chip>
                </span>
              </div>
              
                             <div class="detail-row">
                 <v-icon size="small" color="grey">mdi-clock-outline</v-icon>
                 <span class="ml-2">
                   <strong>Expires:</strong> {{ formatDate(projectInvite.expiresAt) }}
                 </span>
               </div>
            </div>
            
            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
              icon="mdi-information"
            >
              By accepting this project, you agree to participate and contribute according to your assigned role.
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-4 pb-4">
          <v-spacer></v-spacer>
          <v-btn 
            color="error" 
            variant="outlined"
            @click="declineProject"
            :loading="responding"
            :disabled="responding"
          >
            Decline
          </v-btn>
          <v-btn 
            color="success" 
            variant="elevated"
            @click="acceptProject"
            :loading="responding"
            :disabled="responding"
          >
            Accept Project
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNextAuth } from '@/composables/useNextAuth';
import { userRoleApi, projectInviteApi, type UserRole, type ProjectInvite } from '@/services/projectApi';
import { useTheme } from '@/composables/useTheme';

// Props
interface Props {
  projectId: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'accessGranted': [userRole: UserRole];
  'accessDenied': [];
}>();

// Composables
const router = useRouter();
const { user } = useNextAuth();
const { isDark } = useTheme();

// Reactive data
const loading = ref(true);
const hasAccess = ref(false);
const needsAcceptance = ref(false);
const userRole = ref<UserRole | null>(null);
const projectInvite = ref<ProjectInvite | null>(null);
const showAcceptanceModal = ref(false);
const responding = ref(false);

// Computed
const canAccessProject = computed(() => {
  return hasAccess.value && !needsAcceptance.value;
});

// Methods
const checkProjectAccess = async () => {
  if (!user.value?.id || !props.projectId) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  try {
    // Check if user has a role in this project
    const role = await userRoleApi.getUserRoleInProject(props.projectId, user.value.id);
    
    if (role) {
      userRole.value = role;
      hasAccess.value = true;
      needsAcceptance.value = false;
      emit('accessGranted', role);
    } else {
      // Check if user has a pending invite
      const invites = await projectInviteApi.getUserInvites();
      const pendingInvite = invites.find((invite: any) => 
        invite.projectId === props.projectId && invite.status === 'PENDING'
      );
      
      if (pendingInvite) {
        projectInvite.value = pendingInvite;
        hasAccess.value = true;
        needsAcceptance.value = true;
      } else {
        hasAccess.value = false;
        needsAcceptance.value = false;
        emit('accessDenied');
      }
    }
  } catch (error: any) {
    console.error('Failed to check project access:', error);
    
    // If 404, user doesn't have a role - check for pending invites
    if (error.response?.status === 404) {
      try {
        const invites = await projectInviteApi.getUserInvites();
        const pendingInvite = invites.find((invite: any) => 
          invite.projectId === props.projectId && invite.status === 'PENDING'
        );
        
        if (pendingInvite) {
          projectInvite.value = pendingInvite;
          hasAccess.value = true;
          needsAcceptance.value = true;
        } else {
          hasAccess.value = false;
          needsAcceptance.value = false;
          emit('accessDenied');
        }
      } catch (inviteError) {
        console.error('Failed to check pending invites:', inviteError);
        hasAccess.value = false;
        needsAcceptance.value = false;
        emit('accessDenied');
      }
    } else {
      // Other errors (network, 500, etc.) - deny access
      hasAccess.value = false;
      needsAcceptance.value = false;
      emit('accessDenied');
    }
  } finally {
    loading.value = false;
  }
};

const acceptProject = async () => {
  if (!projectInvite.value) return;
  
  responding.value = true;
  try {
    await projectInviteApi.respondToInvite(projectInvite.value.id, 'ACCEPTED');
    
    // Refresh access check
    await checkProjectAccess();
    
    // Close modal
    showAcceptanceModal.value = false;
    
    // Show success message or redirect
    // You could show a toast notification here
  } catch (error) {
    console.error('Failed to accept project:', error);
    // You could show an error toast here
  } finally {
    responding.value = false;
  }
};

const declineProject = async () => {
  if (!projectInvite.value) return;
  
  responding.value = true;
  try {
    await projectInviteApi.respondToInvite(projectInvite.value.id, 'DECLINED');
    
    // Redirect to dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to decline project:', error);
    // You could show an error toast here
  } finally {
    responding.value = false;
  }
};

// Helper functions
const getRoleColor = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'deep-purple';
    case 'PROJECT_MANAGER': return 'blue';
    case 'EMPLOYEE': return 'green';
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

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'red';
    case 'HIGH': return 'orange';
    case 'MEDIUM': return 'yellow';
    case 'LOW': return 'green';
    default: return 'grey';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'Critical';
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    default: return priority;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  // Wait for Clerk to be ready before checking access
  if (user.value) {
    checkProjectAccess();
  }
});

// Watch for user changes and load data when ready
watch(user, (newUser) => {
  if (newUser && props.projectId) {
    console.log('User authenticated, checking project access...');
    checkProjectAccess();
  }
}, { immediate: true });

// Watch for projectId changes
watch(() => props.projectId, () => {
  if (props.projectId && user.value) {
    checkProjectAccess();
  }
});
</script>

<style scoped>
.project-acceptance {
  text-align: left;
}

.acceptance-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.detail-row {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.detail-row .v-icon {
  flex-shrink: 0;
}
</style>
