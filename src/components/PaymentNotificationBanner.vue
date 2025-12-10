<template>
  <v-alert 
    v-if="showNotification" 
    type="warning" 
    variant="tonal" 
    class="mb-4"
    :style="{ background: 'var(--erp-warning-bg)', color: 'var(--erp-text)' }"
  >
    <template #title>
      <div class="d-flex align-center">
        <v-icon class="mr-2">mdi-cash-alert</v-icon>
        Escrow Funding Required
      </div>
    </template>
    
    <div class="mt-2">
      <p class="mb-2">
        <strong>{{ pendingTeamMembers.length }} team member(s)</strong> have been invited with payment terms but escrow needs funding.
      </p>
      
      <div class="mb-3">
        <h4 class="text-subtitle-1 mb-2">Pending Team Members:</h4>
        <div v-for="member in pendingTeamMembers" :key="member.id" class="mb-2">
          <div class="d-flex align-center">
            <v-icon size="16" class="mr-2">mdi-account</v-icon>
            <span class="font-weight-medium">{{ member.email }}</span>
            <v-chip size="x-small" variant="tonal" class="ml-2" :color="getPaymentTypeColor(member.paymentType)">
              {{ member.paymentType }}
            </v-chip>
          </div>
          <div class="text-caption ml-6" :style="{ color: 'var(--erp-text-secondary)' }">
            <span v-if="member.paymentType === 'SALARY'">
              {{ member.salaryAmount }} SIZ {{ member.salaryFrequency?.toLowerCase() }}
              ({{ calculateMonthlySalary(member.salaryAmount || 0, member.salaryFrequency || 'WEEKLY') }} SIZ/month)
            </span>
            <span v-else-if="member.paymentType === 'OVERSIGHT'">
              {{ member.oversightRate }}% of task payments
            </span>
            <span v-else-if="member.paymentType === 'MILESTONE'">
              {{ member.milestoneAmount }} SIZ per milestone
            </span>
          </div>
        </div>
      </div>
      
      <div class="d-flex align-center gap-2">
        <v-btn 
          color="primary" 
          variant="tonal" 
          size="small"
          @click="goToFunding"
        >
          <v-icon size="16" class="mr-1">mdi-wallet</v-icon>
          Fund Escrow
        </v-btn>
        
        <v-btn 
          color="secondary" 
          variant="text" 
          size="small"
          @click="dismissNotification"
        >
          <v-icon size="16" class="mr-1">mdi-close</v-icon>
          Dismiss
        </v-btn>
      </div>
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { projectInviteApi } from '@/services/projectApi';

interface PendingTeamMember {
  id: string;
  email: string;
  role: string;
  paymentType: string;
  salaryAmount?: number;
  salaryFrequency?: string;
  oversightRate?: number;
  milestoneAmount?: number;
  expiresAt: string;
}

const props = defineProps<{
  projectId: string;
}>();

const router = useRouter();
const dismissed = ref(false);
const pendingInvites = ref<PendingTeamMember[]>([]);

const showNotification = computed(() => {
  return !dismissed.value && pendingTeamMembers.value.length > 0;
});

const pendingTeamMembers = computed(() => {
  return pendingInvites.value.filter(invite => 
    invite.paymentType && 
    invite.paymentType !== 'PER_TASK' &&
    new Date(invite.expiresAt) > new Date()
  );
});

const getPaymentTypeColor = (paymentType: string) => {
  const colors: Record<string, string> = {
    'SALARY': 'success',
    'OVERSIGHT': 'info',
    'MILESTONE': 'warning',
    'HYBRID': 'primary'
  };
  return colors[paymentType] || 'grey';
};

const calculateMonthlySalary = (amount: number, frequency: string) => {
  if (!amount || !frequency) return 0;
  
  switch (frequency) {
    case 'WEEKLY':
      return Math.round(amount * 4.33);
    case 'BIWEEKLY':
      return Math.round(amount * 2.17);
    case 'MONTHLY':
      return amount;
    default:
      return 0;
  }
};

const goToFunding = () => {
  router.push(`/projects/${props.projectId}/fund-escrow`);
};

const dismissNotification = () => {
  dismissed.value = true;
  // Store dismissal in localStorage to persist across sessions
  localStorage.setItem(`payment-notification-dismissed-${props.projectId}`, 'true');
};

const loadPendingInvites = async () => {
  try {
    const invites = await projectInviteApi.getProjectInvites(props.projectId);
    pendingInvites.value = invites.filter((invite: any) => 
      invite.status === 'PENDING' && 
      invite.paymentType && 
      invite.paymentType !== 'PER_TASK'
    );
    
    // Check if notification was previously dismissed
    const wasDismissed = localStorage.getItem(`payment-notification-dismissed-${props.projectId}`);
    if (wasDismissed) {
      dismissed.value = true;
    }
  } catch (error) {
    console.error('Failed to load pending invites:', error);
  }
};

onMounted(() => {
  loadPendingInvites();
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
