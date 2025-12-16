<template>
  <div class="kanban-card" @click="openCardDetails">
    <div class="card-content">
      <h4 class="card-title">{{ card.title }}</h4>
      <p class="card-description" v-if="card.description">{{ card.description }}</p>

      <div class="card-meta" v-if="card.assignee || card.dueDate || card.labels?.length">
        <div class="card-labels" v-if="card.labels?.length">
          <span
            v-for="label in card.labels"
            :key="label"
            class="card-label"
            :class="`label-${label.toLowerCase()}`"
          >
            {{ label }}
          </span>
        </div>

        <div class="card-footer">
          <div class="card-assignee" v-if="card.assignee">
            <v-avatar size="20">
              <span class="text-caption">{{ card.assignee.charAt(0).toUpperCase() }}</span>
            </v-avatar>
          </div>

          <div class="card-fin-amount" v-if="card.finAmount">
            <v-icon size="14">mdi-coin</v-icon>
            <span>{{ card.finAmount }} FIN</span>
          </div>

          <div class="card-due-date" v-if="card.dueDate">
            <v-icon size="14" :color="isOverdue ? 'error' : 'warning'">mdi-calendar</v-icon>
            <span :class="{ 'overdue': isOverdue }">{{ formatDueDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <v-btn
        icon
        size="small"
        variant="text"
        @click.stop="deleteCard"
      >
        <v-icon size="16">mdi-delete</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Card {
  id: string
  title: string
  description?: string
  assignee?: string
  dueDate?: string
  labels?: string[]
  listId: string
  finAmount?: string
  taskId?: string
}

const props = defineProps<{
  card: Card
}>()

const emit = defineEmits<{
  update: [cardId: string, updates: Partial<Card>]
  delete: [cardId: string]
}>()

// Computed
const isOverdue = computed(() => {
  if (!props.card.dueDate) return false
  const dueDate = new Date(props.card.dueDate)
  const now = new Date()
  return dueDate < now
})

const formatDueDate = computed(() => {
  if (!props.card.dueDate) return ''
  const date = new Date(props.card.dueDate)
  return date.toLocaleDateString()
})

// Methods
const openCardDetails = () => {
  // TODO: Open card details modal
  console.log('Open card details', props.card.id)
}

const deleteCard = () => {
  emit('delete', props.card.id)
}
</script>

<style scoped>
.kanban-card {
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 6px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 60px;
}

.kanban-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  line-height: 1.3;
}

.card-description {
  font-size: 12px;
  color: var(--erp-text-muted);
  margin: 0;
  line-height: 1.3;
}

.card-meta {
  margin-top: 8px;
}

.card-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.card-label {
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.label-bug {
  background: #e11d48;
  color: white;
}

.label-feature {
  background: #2563eb;
  color: white;
}

.label-enhancement {
  background: #16a34a;
  color: white;
}

.label-documentation {
  background: #ca8a04;
  color: white;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-assignee {
  display: flex;
  align-items: center;
}

.card-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--erp-text-muted);
}

.card-due-date.overdue {
  color: #dc2626;
}

.card-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.kanban-card:hover .card-actions {
  opacity: 1;
}
</style>
