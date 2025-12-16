<template>
  <div class="kanban-board">
    <div class="board-header">
      <h1 class="board-title">{{ board.title }}</h1>
      <div class="board-actions">
        <v-btn variant="outlined" @click="addList">
          <v-icon start>mdi-plus</v-icon>
          Add List
        </v-btn>
      </div>
    </div>

    <div class="lists-container" ref="listsContainer">
      <div
        v-for="list in lists"
        :key="list.id"
        class="list-wrapper"
      >
        <kanban-list
          :list="list"
          :cards="getCardsForList(list.id)"
          @add-card="addCard"
          @update-card="updateCard"
          @delete-card="deleteCard"
        />
      </div>

      <div class="add-list-placeholder" v-if="!isAddingList" @click="startAddingList">
        <v-icon>mdi-plus</v-icon>
        Add another list
      </div>

      <div class="add-list-form" v-else>
        <v-text-field
          v-model="newListTitle"
          label="List title"
          variant="outlined"
          density="comfortable"
          @keyup.enter="confirmAddList"
          @keyup.escape="cancelAddList"
          ref="listInput"
        />
        <div class="form-actions">
          <v-btn variant="text" @click="confirmAddList">Add list</v-btn>
          <v-btn variant="text" @click="cancelAddList">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import KanbanList from './KanbanList.vue'

interface Card {
  id: string
  title: string
  description?: string
  assignee?: string
  dueDate?: string
  labels?: string[]
  listId: string
  finAmount?: string // FIN tokens allocated
  taskId?: string // Blockchain task ID
}

interface List {
  id: string
  title: string
  cards: Card[]
}

interface Board {
  id: string
  title: string
  lists: List[]
}

const props = defineProps<{
  board: Board
}>()

const emit = defineEmits<{
  updateBoard: [board: Board]
}>()

// Reactive data
const lists = ref<List[]>(props.board.lists || [])
const isAddingList = ref(false)
const newListTitle = ref('')
const listInput = ref()

// Computed
const getCardsForList = (listId: string) => {
  return lists.value.find(l => l.id === listId)?.cards || []
}

// Methods
const addList = () => {
  startAddingList()
}

const startAddingList = () => {
  isAddingList.value = true
  newListTitle.value = ''
  nextTick(() => {
    listInput.value?.focus()
  })
}

const confirmAddList = () => {
  if (!newListTitle.value.trim()) return

  const newList: List = {
    id: `list-${Date.now()}`,
    title: newListTitle.value.trim(),
    cards: []
  }

  lists.value.push(newList)
  emit('updateBoard', { ...props.board, lists: lists.value })

  cancelAddList()
}

const cancelAddList = () => {
  isAddingList.value = false
  newListTitle.value = ''
}

const addCard = (listId: string, cardData: Omit<Card, 'id' | 'listId'>) => {
  const newCard: Card = {
    id: `card-${Date.now()}`,
    ...cardData,
    listId
  }

  const list = lists.value.find(l => l.id === listId)
  if (list) {
    list.cards.push(newCard)
    emit('updateBoard', { ...props.board, lists: lists.value })
  }
}

const updateCard = (cardId: string, updates: Partial<Card>) => {
  for (const list of lists.value) {
    const cardIndex = list.cards.findIndex(c => c.id === cardId)
    if (cardIndex > -1) {
      list.cards[cardIndex] = { ...list.cards[cardIndex], ...updates }
      emit('updateBoard', { ...props.board, lists: lists.value })
      break
    }
  }
}

const deleteCard = (cardId: string) => {
  for (const list of lists.value) {
    const cardIndex = list.cards.findIndex(c => c.id === cardId)
    if (cardIndex > -1) {
      list.cards.splice(cardIndex, 1)
      emit('updateBoard', { ...props.board, lists: lists.value })
      break
    }
  }
}
</script>

<style scoped>
.kanban-board {
  padding: 20px;
  height: 100vh;
  background: var(--erp-page-bg);
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.board-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0;
}

.board-actions {
  display: flex;
  gap: 12px;
}

.lists-container {
  display: flex;
  gap: 16px;
  height: calc(100vh - 100px);
  overflow-x: auto;
  padding-bottom: 20px;
}

.lists-wrapper {
  display: flex;
  gap: 16px;
  min-height: 100%;
}

.add-list-placeholder {
  min-width: 272px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--erp-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.add-list-placeholder:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--erp-accent-indigo);
}

.add-list-form {
  min-width: 272px;
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
