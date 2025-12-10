<template>
  <div class="calendar-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading calendar...</p>
    </div>

    <!-- Month View -->
    <div v-else-if="currentView === 'month'" class="month-view">
      <div class="month-header">
        <div 
          v-for="day in weekDays" 
          :key="day" 
          class="weekday-header"
        >
          {{ day }}
        </div>
      </div>
      
      <div class="month-grid">
        <div 
          v-for="(day, index) in monthDays" 
          :key="index"
          :class="[
            'month-day',
            { 
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'selected': day.isSelected
            }
          ]"
          @click="handleDateClick(day.date)"
        >
          <div class="day-number">{{ day.date.getDate() }}</div>
          <div class="day-tasks">
            <TaskCard
              v-for="task in getTasksForDate(day.date)"
              :key="task.id"
              :task="task"
              :compact="true"
              @click="handleTaskClick(task)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-else-if="currentView === 'week'" class="week-view">
      <div class="week-header">
        <div class="time-column"></div>
        <div 
          v-for="day in weekDaysData" 
          :key="day.date.toISOString()"
          :class="[
            'weekday-column',
            { 
              'today': day.isToday,
              'selected': day.isSelected
            }
          ]"
          @click="handleDateClick(day.date)"
        >
          <div class="weekday-name">{{ day.name }}</div>
          <div class="weekday-date">{{ day.date.getDate() }}</div>
        </div>
      </div>
      
      <div class="week-grid">
        <div class="time-labels">
          <div 
            v-for="hour in timeSlots" 
            :key="hour"
            class="time-label"
          >
            {{ formatHour(hour) }}
          </div>
        </div>
        
        <div class="week-columns">
          <div 
            v-for="day in weekDaysData" 
            :key="day.date.toISOString()"
            class="weekday-column"
          >
            <div 
              v-for="hour in timeSlots" 
              :key="hour"
              class="time-slot"
              @click="handleTimeSlotClick(day.date, hour)"
            >
              <TaskCard
                v-for="task in getTasksForTimeSlot(day.date, hour)"
                :key="task.id"
                :task="task"
                :compact="true"
                @click="handleTaskClick(task)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-else-if="currentView === 'day'" class="day-view">
      <div class="day-header">
        <div class="time-column">Time</div>
        <div class="day-column">
          <div class="day-info">
            <div class="day-name">{{ formatDayName(currentDate) }}</div>
            <div class="day-date">{{ formatDayDate(currentDate) }}</div>
          </div>
        </div>
      </div>
      
      <div class="day-grid">
        <div class="time-labels">
          <div 
            v-for="hour in timeSlots" 
            :key="hour"
            class="time-label"
          >
            {{ formatHour(hour) }}
          </div>
        </div>
        
        <div class="day-column">
          <div 
            v-for="hour in timeSlots" 
            :key="hour"
            class="time-slot"
            @click="handleTimeSlotClick(currentDate, hour)"
          >
            <TaskCard
              v-for="task in getTasksForTimeSlot(currentDate, hour)"
              :key="task.id"
              :task="task"
              @click="handleTaskClick(task)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TaskCard from './TaskCard.vue'
import type { Task } from '@/services/projectApi'

interface Props {
  currentView: 'month' | 'week' | 'day'
  currentDate: Date
  tasks: Task[]
  selectedTask: Task | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'task-click': [task: Task]
  'date-click': [date: Date]
  'time-slot-click': [date: Date, hour: number]
}>()

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const timeSlots = Array.from({ length: 24 }, (_, i) => i)

// Month view helpers
const monthDays = computed(() => {
  const year = props.currentDate.getFullYear()
  const month = props.currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    days.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === props.currentDate.toDateString()
    })
  }
  
  return days
})

// Week view helpers
const weekDaysData = computed(() => {
  const startOfWeek = new Date(props.currentDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day
  startOfWeek.setDate(diff)
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    days.push({
      date,
      name: weekDays[i],
      isToday: date.toDateString() === today.toDateString(),
      isSelected: date.toDateString() === props.currentDate.toDateString()
    })
  }
  
  return days
})

// Task filtering helpers
const getTasksForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return props.tasks.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0]
    return taskDate === dateStr
  }).slice(0, 3) // Limit to 3 tasks in month view
}

const getTasksForTimeSlot = (date: Date, hour: number) => {
  const dateStr = date.toISOString().split('T')[0]
  return props.tasks.filter(task => {
    if (!task.dueDate) return false
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0]
    if (taskDate !== dateStr) return false
    
    // For tasks with start time, check if they fall in this hour
    if (task.startDate) {
      const startHour = new Date(task.startDate).getHours()
      return startHour === hour
    }
    
    // For tasks without start time, show in the morning (9 AM)
    return hour === 9
  })
}

// Event handlers
const handleDateClick = (date: Date) => {
  emit('date-click', date)
}

const handleTaskClick = (task: Task) => {
  emit('task-click', task)
}

const handleTimeSlotClick = (date: Date, hour: number) => {
  emit('time-slot-click', date, hour)
}

// Format helpers
const formatHour = (hour: number) => {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

const formatDayName = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

const formatDayDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.calendar-view {
  height: 100%;
  overflow: hidden;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--erp-card-bg);
  color: var(--erp-text);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--erp-border);
  border-top: 4px solid var(--erp-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Month View */
.month-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--erp-surface);
  border-bottom: 1px solid var(--erp-border);
}

.weekday-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: var(--erp-text);
  font-size: 0.875rem;
}

.month-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  overflow: hidden;
}

.month-day {
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  overflow: hidden;
  background: var(--erp-card-bg);
}

.month-day:hover {
  background-color: var(--erp-surface);
}

.month-day.other-month {
  background-color: var(--erp-surface);
  opacity: 0.6;
}

.month-day.today {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 12%, transparent);
}

.month-day.selected {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 18%, transparent);
  border-color: var(--erp-accent-indigo);
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--erp-text);
}

.day-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Week View */
.week-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  background-color: var(--erp-surface);
  border-bottom: 1px solid var(--erp-border);
}

.time-column {
  padding: 1rem 0.5rem;
  font-weight: 600;
  color: var(--erp-text);
  font-size: 0.875rem;
  text-align: center;
}

.weekday-column {
  padding: 1rem 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s;
  border-right: 1px solid var(--erp-border);
}

.weekday-column:hover {
  background-color: var(--erp-surface);
}

.weekday-column.today {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 12%, transparent);
}

.weekday-column.selected {
  background-color: color-mix(in srgb, var(--erp-accent-indigo) 18%, transparent);
  border-color: var(--erp-accent-indigo);
}

.weekday-name {
  font-weight: 600;
  color: var(--erp-text);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.weekday-date {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--erp-text);
}

.week-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 60px 1fr;
  overflow: hidden;
}

.time-labels {
  background-color: #f8fafc;
  border-right: 1px solid var(--erp-border);
}

.time-label {
  height: 60px;
  padding: 0.5rem;
  font-size: 0.75rem;
  color: var(--erp-text);
  text-align: right;
  border-bottom: 1px solid var(--erp-border);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.week-columns {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  overflow: hidden;
}

.weekday-column {
  border-right: 1px solid #e2e8f0;
  overflow: hidden;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid var(--erp-border);
  padding: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.time-slot:hover {
  background-color: var(--erp-surface);
}

/* Day View */
.day-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.day-header {
  display: grid;
  grid-template-columns: 60px 1fr;
  background-color: var(--erp-surface);
  border-bottom: 1px solid var(--erp-border);
}

.day-column {
  padding: 1rem;
  text-align: center;
  border-right: 1px solid var(--erp-border);
}

.day-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.day-name {
  font-weight: 600;
  color: var(--erp-text);
  font-size: 0.875rem;
}

.day-date {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--erp-text);
}

.day-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 60px 1fr;
  overflow: hidden;
}

/* Responsive design */
@media (max-width: 768px) {
  .month-grid {
    font-size: 0.75rem;
  }
  
  .weekday-header,
  .time-label {
    font-size: 0.75rem;
  }
  
  .weekday-date,
  .day-date {
    font-size: 1rem;
  }
  
  .time-slot {
    height: 50px;
  }
  
  .time-labels .time-label {
    height: 50px;
  }
}
</style>
