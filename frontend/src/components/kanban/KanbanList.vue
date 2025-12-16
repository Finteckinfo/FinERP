<template>
  <div class="kanban-list">
    <div class="list-header">
      <h3 class="list-title">{{ list.title }}</h3>
      <div class="list-actions">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="toggleAddCard"
        >
          <v-icon size="16">mdi-plus</v-icon>
        </v-btn>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="deleteList"
        >
          <v-icon size="16">mdi-dots-horizontal</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="cards-container">
      <div
        v-for="card in cards"
        :key="card.id"
        class="card-wrapper"
      >
        <kanban-card
          :card="card"
          @update="updateCard"
          @delete="deleteCard"
        />
      </div>
    </div>

    <div class="add-card-section" v-if="isAddingCard">
      <v-textarea
        v-model="newCardTitle"
        label="Task title"
        variant="outlined"
        density="comfortable"
        rows="2"
        @keyup.ctrl.enter="confirmAddCard"
        @keyup.escape="cancelAddCard"
        ref="cardInput"
      />
      <v-text-field
        v-model="newCardAssignee"
        label="Assignee (wallet address)"
        variant="outlined"
        density="comfortable"
        placeholder="0x..."
      />
      <v-text-field
        v-model="newCardFinAmount"
        label="FIN tokens to allocate"
        variant="outlined"
        density="comfortable"
        type="number"
        placeholder="1000"
      />
      <div class="card-form-actions">
        <v-btn variant="text" @click="confirmAddCard">Add task</v-btn>
        <v-btn variant="text" @click="cancelAddCard">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <div class="add-card-placeholder" v-else @click="toggleAddCard">
      <v-icon size="16">mdi-plus</v-icon>
      Add a card
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import KanbanCard from './KanbanCard.vue'

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

interface List {
  id: string
  title: string
  cards: Card[]
}

const props = defineProps<{
  list: List
  cards: Card[]
}>()

const emit = defineEmits<{
  addCard: [listId: string, cardData: Omit<Card, 'id' | 'listId'>]
  updateCard: [cardId: string, updates: Partial<Card>]
  deleteCard: [cardId: string]
}>()

// Reactive data
const isAddingCard = ref(false)
const newCardTitle = ref('')
const newCardAssignee = ref('')
const newCardFinAmount = ref('')
const cardInput = ref()

// Computed
const cards = computed({
  get: () => props.cards,
  set: (value: Card[]) => {
    // Update listId for moved cards
    value.forEach(card => {
      if (card.listId !== props.list.id) {
        emit('updateCard', card.id, { listId: props.list.id })
      }
    })
  }
})

// Methods
const toggleAddCard = () => {
  isAddingCard.value = !isAddingCard.value
  if (isAddingCard.value) {
    newCardTitle.value = ''
    nextTick(() => {
      cardInput.value?.focus()
    })
  }
}

const confirmAddCard = () => {
  if (!newCardTitle.value.trim()) return

  emit('addCard', props.list.id, {
    title: newCardTitle.value.trim(),
    description: '',
    assignee: newCardAssignee.value,
    finAmount: newCardFinAmount.value
  })

  cancelAddCard()
}

const cancelAddCard = () => {
  isAddingCard.value = false
  newCardTitle.value = ''
  newCardAssignee.value = ''
  newCardFinAmount.value = ''
}

const updateCard = (cardId: string, updates: Partial<Card>) => {
  emit('updateCard', cardId, updates)
}

const deleteCard = (cardId: string) => {
  emit('deleteCard', cardId)
}

const deleteList = () => {
  // TODO: Implement delete list
  console.log('Delete list', props.list.id)
}

const onCardDragEnd = (event: any) => {
  // Handle card movement between lists
  if (event.from !== event.to) {
    // Card moved to different list
    const cardId = event.item._underlying_vm_.card.id
    emit('updateCard', cardId, { listId: props.list.id })
  }
}
</script>

<style scoped>
.kanban-list {
  width: 272px;
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 200px;
}

.list-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--erp-border);
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  flex: 1;
}

.list-actions {
  display: flex;
  gap: 4px;
}

.cards-container {
  flex: 1;
  padding: 8px;
  min-height: 100px;
}

.cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 50px;
}

.add-card-section {
  padding: 12px;
  background: var(--erp-card-bg);
  border-top: 1px solid var(--erp-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-card-placeholder {
  padding: 8px 12px;
  color: var(--erp-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}

.add-card-placeholder:hover {
  color: var(--erp-accent-indigo);
}
</style>
