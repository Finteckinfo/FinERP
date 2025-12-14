<template>
  <v-dialog v-model="isOpen" max-width="700" persistent>
    <v-card v-if="invitation" class="invitation-modal">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4 bg-gradient">
        <div class="d-flex align-items-center justify-space-between w-100">
          <div class="d-flex align-items-center">
            <v-avatar size="48" class="mr-3" color="primary">
              <v-icon size="32" color="white">mdi-briefcase</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold">{{ invitation.project?.name || 'Project Invitation' }}</h2>
              <p class="text-caption text-medium-emphasis mb-0">
                You've been invited to join this project
              </p>
            </div>
          </div>
          <v-btn icon variant="text" @click="close" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <!-- Project Overview -->
        <div class="project-overview mb-6">
          <h3 class="text-h6 font-weight-medium mb-3 d-flex align-items-center">
            <v-icon class="mr-2" color="primary">mdi-information</v-icon>
            Project Overview
          </h3>
          
          <v-row>
            <v-col cols="12">
              <p class="text-body-1">{{ invitation.project?.description || 'No description provided' }}</p>
            </v-col>
          </v-row>

          <v-row class="mt-2">
            <v-col cols="12" sm="6">
              <div class="info-item">
                <v-icon size="20" class="mr-2" color="primary">mdi-calendar-range</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Duration</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ formatDate(invitation.project?.startDate) }} - {{ formatDate(invitation.project?.endDate) }}
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="info-item">
                <v-icon size="20" class="mr-2" color="primary">mdi-flag</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Priority</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ invitation.project?.priority || 'MEDIUM' }}
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="info-item">
                <v-icon size="20" class="mr-2" color="primary">mdi-account-group</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Team Size</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ invitation.project?.teamSize || 'TBD' }} members
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="info-item">
                <v-icon size="20" class="mr-2" color="primary">mdi-folder-outline</v-icon>
                <div>
                  <div class="text-caption text-medium-emphasis">Project Type</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ invitation.project?.type || 'PROGRESSIVE' }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Your Role -->
        <div class="role-section mb-6">
          <h3 class="text-h6 font-weight-medium mb-3 d-flex align-items-center">
            <v-icon class="mr-2" color="success">mdi-account-tie</v-icon>
            Your Role & Compensation
          </h3>

          <v-card variant="tonal" color="success" class="pa-4">
            <div class="d-flex align-items-center mb-3">
              <v-chip color="success" variant="elevated" class="mr-2">
                {{ getRoleLabel(invitation.role) }}
              </v-chip>
              <span class="text-body-2">in {{ invitation.departmentName || 'TBD' }}</span>
            </div>

            <!-- Payment Details -->
            <div v-if="invitation.paymentConfig" class="payment-details mt-4">
              <v-divider class="mb-3"></v-divider>
              <h4 class="text-subtitle-2 font-weight-medium mb-2">💰 Payment Structure</h4>
              
              <div v-if="invitation.paymentConfig.paymentType === 'PER_TASK'" class="payment-info">
                <v-icon size="18" class="mr-2" color="success">mdi-cash-check</v-icon>
                <span class="text-body-2">Paid per completed task</span>
              </div>

              <div v-else-if="invitation.paymentConfig.paymentType === 'SALARY'" class="payment-info">
                <v-icon size="18" class="mr-2" color="success">mdi-cash-multiple</v-icon>
                <span class="text-body-2">
                  {{ invitation.paymentConfig.salaryAmount }} FIN /
                  {{ invitation.paymentConfig.salaryFrequency }}
                </span>
              </div>

              <div v-else-if="invitation.paymentConfig.paymentType === 'OVERSIGHT'" class="payment-info">
                <v-icon size="18" class="mr-2" color="success">mdi-eye-check</v-icon>
                <span class="text-body-2">
                  {{ invitation.paymentConfig.oversightRate }}% of team payments
                </span>
              </div>

              <div v-else-if="invitation.paymentConfig.paymentType === 'MILESTONE'" class="payment-info">
                <v-icon size="18" class="mr-2" color="success">mdi-flag-checkered</v-icon>
                <span class="text-body-2">
                  {{ invitation.paymentConfig.milestoneAmount }} FIN per milestone
                </span>
              </div>

              <v-alert type="info" variant="tonal" density="compact" class="mt-3">
                <template v-slot:prepend>
<v-icon  size="20">mdi-information</v-icon>
</template>
                <span class="text-caption">
                  Payments in FIN tokens are held in secure escrow and released automatically when work is approved
                </span>
              </v-alert>
            </div>
          </v-card>
        </div>

        <!-- Personal Message -->
        <div v-if="invitation.message" class="message-section mb-6">
          <h3 class="text-h6 font-weight-medium mb-3 d-flex align-items-center">
            <v-icon class="mr-2" color="info">mdi-message-text</v-icon>
            Message from Project Owner
          </h3>
          <v-card variant="outlined" class="pa-4">
            <p class="text-body-1 mb-0 font-italic">"{{ invitation.message }}"</p>
          </v-card>
        </div>

        <!-- Next Steps -->
        <div class="next-steps-section">
          <h3 class="text-h6 font-weight-medium mb-3 d-flex align-items-center">
            <v-icon class="mr-2" color="warning">mdi-clipboard-check</v-icon>
            What Happens Next?
          </h3>
          <v-timeline density="compact" side="end">
            <v-timeline-item dot-color="success" size="small">
              <div class="text-body-2">
                <strong>Accept Invitation</strong> - Join the project team
              </div>
            </v-timeline-item>
            <v-timeline-item dot-color="info" size="small">
              <div class="text-body-2">
                <strong>Connect Wallet</strong> - Set up FIN token payments (if not done)
              </div>
            </v-timeline-item>
            <v-timeline-item dot-color="primary" size="small">
              <div class="text-body-2">
                <strong>Access Dashboard</strong> - View tasks & start working
              </div>
            </v-timeline-item>
            <v-timeline-item dot-color="warning" size="small">
              <div class="text-body-2">
                <strong>Get Paid</strong> - Receive FIN when tasks are approved
              </div>
            </v-timeline-item>
          </v-timeline>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-6">
        <v-btn
          variant="outlined"
          @click="decline"
          :loading="declining"
          :disabled="accepting"
        >
          <v-icon start>mdi-close</v-icon>
          Decline
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="success"
          variant="elevated"
          size="large"
          @click="accept"
          :loading="accepting"
          :disabled="declining"
        >
          <v-icon start>mdi-check-bold</v-icon>
          Accept & Join Project
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  modelValue: boolean
  invitation: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'accept', invitationId: string): void
  (e: 'decline', invitationId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

const accepting = ref(false)
const declining = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'PROJECT_MANAGER': 'Project Manager',
    'EMPLOYEE': 'Employee',
    'CLIENT': 'Client',
    'PROJECT_OWNER': 'Project Owner'
  }
  return labels[role] || role
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'TBD'
  return new Date(dateString).toLocaleDateString()
}

const close = () => {
  if (!accepting.value && !declining.value) {
    isOpen.value = false
  }
}

const accept = async () => {
  if (!props.invitation) return
  accepting.value = true
  try {
    emit('accept', props.invitation.id)
  } finally {
    accepting.value = false
  }
}

const decline = async () => {
  if (!props.invitation) return
  declining.value = true
  try {
    emit('decline', props.invitation.id)
  } finally {
    declining.value = false
  }
}
</script>

<style scoped>
.invitation-modal {
  border-radius: 16px;
  overflow: hidden;
}

.bg-gradient {
  background: linear-gradient(135deg, rgba(91, 200, 91, 0.1) 0%, rgba(75, 183, 75, 0.05) 100%);
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

.payment-info {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.next-steps-section {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 16px;
  border-radius: 12px;
}
</style>
