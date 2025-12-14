<template>
  <div class="payment-config-form">
    <div class="config-header">
      <v-icon color="success" class="mr-2">mdi-cash</v-icon>
      <span class="header-title">Payment Configuration</span>
    </div>

    <!-- Payment Type Selection -->
    <v-select
      v-model="localConfig.paymentType"
      label="Payment Model"
      :items="paymentTypeOptions"
      variant="outlined"
      density="compact"
      class="mb-3"
      @update:model-value="handlePaymentTypeChange"
    >
      <template v-slot:item="{ props: itemProps, item }">
        <v-list-item v-bind="itemProps">
          <template v-slot:prepend>
            <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-select>

    <!-- Per-Task Configuration -->
    <div v-if="showPerTask">
      <v-alert type="info" variant="tonal" density="compact" class="mb-3">
        <div class="text-caption">
          Payment amounts will be set when creating individual tasks
        </div>
      </v-alert>
    </div>

    <!-- Salary Configuration -->
    <div v-if="showSalary" class="salary-config">
      <v-row dense>
        <v-col cols="12" sm="7">
          <v-text-field
            v-model.number="localConfig.salaryAmount"
            label="Salary Amount"
            type="number"
            :min="0"
            :step="0.01"
            suffix="FIN"
            variant="outlined"
            density="compact"
            :rules="[v => v > 0 || 'Amount required']"
          />
        </v-col>
        <v-col cols="12" sm="5">
          <v-select
            v-model="localConfig.salaryFrequency"
            label="Frequency"
            :items="frequencyOptions"
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>

      <v-alert type="success" variant="tonal" density="compact" class="mb-3">
        <div class="text-caption">
          <strong>{{ formatSalaryPreview }}</strong> will be paid automatically
        </div>
      </v-alert>
    </div>

    <!-- Manager Oversight Configuration -->
    <div v-if="showOversight" class="oversight-config">
      <v-text-field
        v-model.number="localConfig.oversightRate"
        label="Oversight Fee"
        type="number"
        :min="0"
        :max="100"
        :step="0.5"
        suffix="%"
        variant="outlined"
        density="compact"
        hint="Percentage of each task payment in this department"
        persistent-hint
        class="mb-3"
      />

      <v-alert type="info" variant="tonal" density="compact">
        <div class="text-caption">
          Manager will receive {{ localConfig.oversightRate || 0 }}% of each approved task payment automatically
        </div>
      </v-alert>
    </div>

    <!-- Milestone Configuration -->
    <div v-if="showMilestone" class="milestone-config">
      <v-text-field
        v-model.number="localConfig.milestoneAmount"
        label="Milestone Bonus"
        type="number"
        :min="0"
        :step="0.01"
        suffix="FIN"
        variant="outlined"
        density="compact"
        hint="Paid when all department tasks are completed"
        persistent-hint
      />
    </div>

    <!-- Hybrid Configuration -->
    <div v-if="showHybrid" class="hybrid-config">
      <v-alert type="warning" variant="tonal" density="compact" class="mb-3">
        <div class="text-caption">
          <strong>Hybrid Payment:</strong> Combine salary + task bonuses
        </div>
      </v-alert>

      <v-row dense>
        <v-col cols="12" sm="7">
          <v-text-field
            v-model.number="localConfig.salaryAmount"
            label="Base Salary"
            type="number"
            :min="0"
            :step="0.01"
            suffix="FIN"
            variant="outlined"
            density="compact"
          />
        </v-col>
        <v-col cols="12" sm="5">
          <v-select
            v-model="localConfig.salaryFrequency"
            label="Frequency"
            :items="frequencyOptions"
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>

      <v-checkbox
        v-model="localConfig.includeTaskPayments"
        label="Plus task completion bonuses"
        density="compact"
        hide-details
        class="mb-2"
      />

      <div v-if="role === 'PROJECT_MANAGER'" class="mt-2">
        <v-checkbox
          v-model="localConfig.includeOversight"
          label="Plus oversight fees"
          density="compact"
          hide-details
        />
        
        <v-text-field
          v-if="localConfig.includeOversight"
          v-model.number="localConfig.oversightRate"
          label="Oversight %"
          type="number"
          :min="0"
          :max="100"
          suffix="%"
          variant="outlined"
          density="compact"
          class="mt-2"
        />
      </div>
    </div>

    <!-- Estimated Cost -->
    <div v-if="estimatedCost > 0" class="estimated-cost mt-3">
      <v-divider class="mb-3" />
      <div class="cost-row">
        <span class="cost-label">Estimated Cost (30 days):</span>
        <span class="cost-value">{{ formatAmount(estimatedCost) }} FIN</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface PaymentConfig {
  paymentType: 'PER_TASK' | 'SALARY' | 'OVERSIGHT' | 'MILESTONE' | 'HYBRID' | null;
  salaryAmount?: number;
  salaryFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  oversightRate?: number;
  milestoneAmount?: number;
  includeTaskPayments?: boolean;
  includeOversight?: boolean;
}

interface Props {
  modelValue: PaymentConfig | undefined;
  role: string;
}

interface Emits {
  (e: 'update:modelValue', value: PaymentConfig): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const localConfig = ref<PaymentConfig>(props.modelValue ? { ...props.modelValue } : { paymentType: 'PER_TASK' });

// Payment type options
const paymentTypeOptions = computed(() => {
  const base = [
    {
      value: 'PER_TASK',
      title: 'Per-Task Payment',
      description: 'Paid when individual tasks are completed',
      icon: 'mdi-checkbox-marked-circle',
      color: 'primary'
    },
    {
      value: 'SALARY',
      title: 'Regular Salary',
      description: 'Fixed payment on a schedule (weekly/monthly)',
      icon: 'mdi-calendar-clock',
      color: 'success'
    }
  ];

  if (props.role === 'PROJECT_MANAGER') {
    base.push({
      value: 'OVERSIGHT',
      title: 'Oversight Fees',
      description: 'Percentage of department task payments',
      icon: 'mdi-eye-check',
      color: 'info'
    });
    base.push({
      value: 'MILESTONE',
      title: 'Milestone Bonus',
      description: 'Paid when all department tasks complete',
      icon: 'mdi-flag-checkered',
      color: 'warning'
    });
  }

  base.push({
    value: 'HYBRID',
    title: 'Hybrid Payment',
    description: 'Combine salary + task bonuses + oversight',
    icon: 'mdi-chart-timeline-variant',
    color: 'secondary'
  });

  return base;
});

const frequencyOptions = [
  { value: 'WEEKLY', title: 'Weekly' },
  { value: 'BIWEEKLY', title: 'Bi-weekly (Every 2 weeks)' },
  { value: 'MONTHLY', title: 'Monthly' }
];

// Show/hide sections
const showPerTask = computed(() => localConfig.value.paymentType === 'PER_TASK');
const showSalary = computed(() => localConfig.value.paymentType === 'SALARY');
const showOversight = computed(() => localConfig.value.paymentType === 'OVERSIGHT');
const showMilestone = computed(() => localConfig.value.paymentType === 'MILESTONE');
const showHybrid = computed(() => localConfig.value.paymentType === 'HYBRID');

// Formatted salary preview
const formatSalaryPreview = computed(() => {
  if (!localConfig.value.salaryAmount || !localConfig.value.salaryFrequency) {
    return '';
  }

  const freq = localConfig.value.salaryFrequency.toLowerCase();
  return `${formatAmount(localConfig.value.salaryAmount)} FIN ${freq}`;
});

// Estimated 30-day cost
const estimatedCost = computed(() => {
  let cost = 0;

  if (localConfig.value.paymentType === 'SALARY' || localConfig.value.paymentType === 'HYBRID') {
    const amount = localConfig.value.salaryAmount || 0;
    const freq = localConfig.value.salaryFrequency;

    if (freq === 'WEEKLY') cost += amount * 4.3;
    else if (freq === 'BIWEEKLY') cost += amount * 2.15;
    else if (freq === 'MONTHLY') cost += amount;
  }

  if (localConfig.value.paymentType === 'MILESTONE') {
    cost = localConfig.value.milestoneAmount || 0;
  }

  return cost;
});

// Methods
const handlePaymentTypeChange = () => {
  // Reset other fields when payment type changes
  if (localConfig.value.paymentType === 'PER_TASK') {
    localConfig.value.salaryAmount = undefined;
    localConfig.value.salaryFrequency = undefined;
    localConfig.value.oversightRate = undefined;
    localConfig.value.milestoneAmount = undefined;
  } else if (localConfig.value.paymentType === 'SALARY') {
    localConfig.value.oversightRate = undefined;
    localConfig.value.milestoneAmount = undefined;
    localConfig.value.salaryFrequency = localConfig.value.salaryFrequency || 'WEEKLY';
  } else if (localConfig.value.paymentType === 'OVERSIGHT') {
    localConfig.value.salaryAmount = undefined;
    localConfig.value.salaryFrequency = undefined;
    localConfig.value.milestoneAmount = undefined;
    localConfig.value.oversightRate = localConfig.value.oversightRate || 5;
  } else if (localConfig.value.paymentType === 'MILESTONE') {
    localConfig.value.salaryAmount = undefined;
    localConfig.value.salaryFrequency = undefined;
    localConfig.value.oversightRate = undefined;
  } else if (localConfig.value.paymentType === 'HYBRID') {
    localConfig.value.salaryFrequency = localConfig.value.salaryFrequency || 'WEEKLY';
  }

  emit('update:modelValue', localConfig.value);
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    localConfig.value = { ...newValue };
  }
}, { deep: true });

// Emit changes
watch(localConfig, (newValue) => {
  emit('update:modelValue', newValue);
}, { deep: true });
</script>

<style scoped>
.payment-config-form {
  padding: 16px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
}

.config-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--erp-text);
}

.estimated-cost {
  padding: 12px;
  background: var(--erp-surface);
  border-radius: 8px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cost-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  opacity: 0.7;
}

.cost-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--erp-accent-green);
}
</style>

