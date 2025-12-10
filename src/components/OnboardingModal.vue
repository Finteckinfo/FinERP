<template>
  <div :class="{ 'dark-theme': isDark }">
    <v-dialog v-model="showModal" persistent max-width="700" scrollable>
    <v-card :class="{ 'dark-theme': isDark }">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-email-outline</v-icon>
        Project Invitations
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Loading your invitations...</p>
        </div>
        
        <div v-else-if="pendingInvites.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-email-check</v-icon>
          <h3 class="text-h6 mt-4 text-grey-darken-1">No Pending Invitations</h3>
          <p class="text-body-2 text-grey">You're all caught up!</p>
        </div>
        
        <div v-else>
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
            icon="mdi-information"
          >
            You have {{ pendingInvites.length }} pending project invitation(s). 
            Review and respond to each one below.
          </v-alert>
          
          <div v-for="invite in pendingInvites" :key="invite.id" class="mb-4">
            <v-card variant="outlined" class="invite-card">
              <v-card-title class="d-flex align-center">
                <v-icon 
                  :color="getRoleColor(invite.role)" 
                  class="mr-2"
                >
                  {{ getRoleIcon(invite.role) }}
                </v-icon>
                {{ invite.project.name }}
                <v-chip 
                  :color="getRoleColor(invite.role)" 
                  variant="tonal" 
                  size="small" 
                  class="ml-auto"
                >
                  {{ getRoleLabel(invite.role) }}
                </v-chip>
              </v-card-title>
              
              <v-card-text>
                <div class="project-details">
                  <div class="detail-row">
                    <v-icon size="small" color="grey">mdi-text</v-icon>
                    <span class="ml-2">{{ invite.project.description || 'No description provided' }}</span>
                  </div>
                  
                  <div class="detail-row">
                    <v-icon size="small" color="grey">mdi-calendar-range</v-icon>
                    <span class="ml-2">
                      {{ formatDate(invite.project.startDate) }} - {{ formatDate(invite.project.endDate) }}
                    </span>
                  </div>
                  
                  <div class="detail-row">
                    <v-icon size="small" color="grey">mdi-flag</v-icon>
                    <span class="ml-2">
                      Priority: 
                      <v-chip 
                        :color="getPriorityColor(invite.project.priority)" 
                        variant="tonal" 
                        size="x-small"
                      >
                        {{ getPriorityLabel(invite.project.priority) }}
                      </v-chip>
                    </span>
                  </div>
                  
                  <div class="detail-row">
                    <v-icon size="small" color="grey">mdi-clock-outline</v-icon>
                    <span class="ml-2">
                      Expires: {{ formatDate(invite.expiresAt) }}
                    </span>
                  </div>
                </div>
              </v-card-text>
              
              <v-card-actions class="px-4 pb-4">
                <v-btn 
                  color="success" 
                  variant="elevated"
                  @click="acceptInvite(invite.id)"
                  :loading="invite.loading"
                  :disabled="invite.loading"
                  prepend-icon="mdi-check"
                >
                  Accept Project
                </v-btn>
                
                <v-btn 
                  color="error" 
                  variant="outlined"
                  @click="declineInvite(invite.id)"
                  :loading="invite.loading"
                  :disabled="invite.loading"
                  prepend-icon="mdi-close"
                >
                  Decline
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </v-card-text>
      
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="tonal"
          @click="closeModal"
        >
          {{ pendingInvites.length === 0 ? 'Close' : 'Continue to Dashboard' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useNextAuth } from '@/composables/useNextAuth';
import { projectInviteApi, type ProjectInvite } from '@/services/projectApi';
import { useTheme } from '@/composables/useTheme';

// Props
interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'inviteResponded': [inviteId: string, status: 'ACCEPTED' | 'DECLINED'];
}>();

// Composables
const { user } = useNextAuth();
const { isDark } = useTheme();

// Reactive data
const loading = ref(false);
const pendingInvites = ref<(ProjectInvite & { loading?: boolean })[]>([]);

// Computed
const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
const loadUserInvites = async () => {
  if (!user.value?.id) return;
  
  loading.value = true;
  try {
    const invites = await projectInviteApi.getUserInvites();
    pendingInvites.value = invites.filter((invite: any) => invite.status === 'PENDING');
  } catch (error) {
    console.error('Failed to load user invites:', error);
    // You could show a toast notification here
  } finally {
    loading.value = false;
  }
};

const acceptInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;
  
  invite.loading = true;
  try {
    await projectInviteApi.respondToInvite(inviteId, 'ACCEPTED');
    emit('inviteResponded', inviteId, 'ACCEPTED');
    
    // Remove the accepted invite from the list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    
    // If no more invites, close modal
    if (pendingInvites.value.length === 0) {
      closeModal();
    }
  } catch (error) {
    console.error('Failed to accept invite:', error);
    // You could show a toast notification here
  } finally {
    invite.loading = false;
  }
};

const declineInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;
  
  invite.loading = true;
  try {
    await projectInviteApi.respondToInvite(inviteId, 'DECLINED');
    emit('inviteResponded', inviteId, 'DECLINED');
    
    // Remove the declined invite from the list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    
    // If no more invites, close modal
    if (pendingInvites.value.length === 0) {
      closeModal();
    }
  } catch (error) {
    console.error('Failed to decline invite:', error);
    // You could show a toast notification here
  } finally {
    invite.loading = false;
  }
};

const closeModal = () => {
  showModal.value = false;
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

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'mdi-crown';
    case 'PROJECT_MANAGER': return 'mdi-account-tie';
    case 'EMPLOYEE': return 'mdi-account';
    default: return 'mdi-account';
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
  if (showModal.value) {
    loadUserInvites();
  }
});

// Watch for modal open to load invites
watch(() => showModal.value, (newValue) => {
  if (newValue) {
    loadUserInvites();
  }
});
</script>

<style scoped>
.invite-card {
  border-left: 4px solid var(--v-primary-base);
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
