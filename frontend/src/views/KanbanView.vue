<template>
  <div class="kanban-view">
    <v-container fluid>
      <div class="view-header">
        <h1 class="page-title">Project Kanban Board</h1>
        <div class="view-actions">
          <v-btn variant="outlined" @click="saveBoard">
            <v-icon start>mdi-content-save</v-icon>
            Save Board
          </v-btn>
        </div>
      </div>

      <KanbanBoard
        :board="board"
        @update-board="updateBoard"
        @add-card="addCard"
        @update-card="updateCard"
        @delete-card="deleteCard"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet'
import { getTasksForProject, allocateTask, completeTask } from '@/services/projectEscrowService'
import { ethers } from 'ethers'

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

interface Board {
  id: string
  title: string
  lists: List[]
}

const route = useRoute()
const { user, isConnected } = useMetaMaskWallet()

// Reactive data
const board = ref<Board>({
  id: 'project-board',
  title: 'Project Tasks',
  lists: [
    { id: 'list-1', title: 'To Do', cards: [] },
    { id: 'list-2', title: 'In Progress', cards: [] },
    { id: 'list-3', title: 'Done', cards: [] }
  ]
})

const projectId = computed(() => route.params.id as string)

// Methods
const updateBoard = (updatedBoard: Board) => {
  board.value = updatedBoard
  console.log('Board updated:', board.value)
}

const addCard = async (listId: string, cardData: Omit<Card, 'id' | 'listId'>) => {
  if (!isConnected.value || !user.value?.address) {
    alert('Please connect your wallet first')
    return
  }

  try {
    // Call blockchain allocateTask
    const signer = new ethers.BrowserProvider(window.ethereum).getSigner()
    const chainId = 11155111 // Sepolia for demo
    const taskId = await allocateTask(chainId, await signer, projectId.value, cardData.assignee || user.value.address, cardData.finAmount || '0')

    // Add card to board
    const newCard: Card = {
      id: `card-${Date.now()}`,
      ...cardData,
      listId,
      taskId
    }

    const list = board.value.lists.find(l => l.id === listId)
    if (list) {
      list.cards.push(newCard)
    }

    console.log('Task allocated on blockchain:', taskId)
  } catch (error) {
    console.error('Failed to allocate task:', error)
    alert('Failed to allocate task on blockchain')
  }
}

const updateCard = async (cardId: string, updates: Partial<Card>) => {
  // Find the card
  let card: Card | undefined
  for (const list of board.value.lists) {
    card = list.cards.find(c => c.id === cardId)
    if (card) break
  }

  if (!card) return

  // If moved to done list, complete the task
  if (updates.listId === 'list-3' && card.taskId) {
    try {
      const signer = new ethers.BrowserProvider(window.ethereum).getSigner()
      const chainId = 11155111 // Sepolia for demo
      await completeTask(chainId, await signer, card.taskId)
      console.log('Task completed on blockchain:', card.taskId)
    } catch (error) {
      console.error('Failed to complete task:', error)
      alert('Failed to complete task on blockchain')
      return
    }
  }

  // Update card
  Object.assign(card, updates)
  console.log('Card updated:', card)
}

const deleteCard = (cardId: string) => {
  for (const list of board.value.lists) {
    const index = list.cards.findIndex(c => c.id === cardId)
    if (index > -1) {
      list.cards.splice(index, 1)
      break
    }
  }
  console.log('Card deleted:', cardId)
}

const saveBoard = () => {
  console.log('Saving board...', board.value)
}

const loadTasks = async () => {
  if (!projectId.value) return

  try {
    const chainId = 11155111 // Sepolia for demo
    const provider = new ethers.BrowserProvider(window.ethereum)
    const tasks = await getTasksForProject(chainId, provider, projectId.value)

    // Map tasks to cards
    const cards: Card[] = tasks.map(task => ({
      id: `card-${task.id}`,
      title: `Task ${task.id}`,
      description: `Assigned to ${task.worker}`,
      assignee: task.worker,
      listId: task.status === 'COMPLETED' ? 'list-3' : task.status === 'IN_PROGRESS' ? 'list-2' : 'list-1',
      finAmount: task.amount,
      taskId: task.id
    }))

    // Assign cards to lists
    board.value.lists.forEach(list => {
      list.cards = cards.filter(card => card.listId === list.id)
    })

    console.log('Tasks loaded:', tasks)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.kanban-view {
  min-height: 100vh;
  background: var(--erp-page-bg);
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0;
}

.view-actions {
  display: flex;
  gap: 12px;
}
</style>
