<template>
  <div class="messages-page">
    <!-- Header Section -->
    <div class="messages-header">
      <RetroGrid />
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="48" color="white">mdi-message-text</v-icon>
        </div>
        <h1 class="header-title">Messages</h1>
        <p class="header-subtitle">Stay updated with system notifications and important announcements</p>
      </div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container">
      <!-- Filter Tabs -->
      <div class="messages-nav">
        <div class="nav-container">
          <div class="mobile-tabs">
            <select v-model="activeTab" class="mobile-tab-select">
              <option value="all">All Messages</option>
              <option value="notifications">Notifications</option>
              <option value="alerts">Alerts</option>
              <option value="announcements">Announcements</option>
            </select>
          </div>
          <div class="tab-nav">
            <button 
              class="tab-button"
              :class="{ active: activeTab === 'all' }"
              @click="activeTab = 'all'"
            >
              <v-icon size="20">mdi-inbox</v-icon>
              <span>All Messages</span>
              <div class="tab-indicator"></div>
            </button>
            
            <button 
              class="tab-button"
              :class="{ active: activeTab === 'notifications' }"
              @click="activeTab = 'notifications'"
            >
              <v-icon size="20">mdi-bell</v-icon>
              <span>Notifications</span>
              <div class="tab-indicator"></div>
            </button>
            
            <button 
              class="tab-button"
              :class="{ active: activeTab === 'alerts' }"
              @click="activeTab = 'alerts'"
            >
              <v-icon size="20">mdi-alert-circle</v-icon>
              <span>Alerts</span>
              <div class="tab-indicator"></div>
            </button>
            
            <button 
              class="tab-button"
              :class="{ active: activeTab === 'announcements' }"
              @click="activeTab = 'announcements'"
            >
              <v-icon size="20">mdi-bullhorn</v-icon>
              <span>Announcements</span>
              <div class="tab-indicator"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Messages Content -->
      <div class="messages-content">
        <div class="messages-list">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="primary" class="mb-4"></v-progress-circular>
            <p class="text-medium-emphasis">Loading messages...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <v-icon size="48" color="error" class="mb-4">mdi-alert-circle</v-icon>
            <h5 class="text-h5 text-error mb-2">Error Loading Messages</h5>
            <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
            <v-btn color="primary" @click="loadMessages">Try Again</v-btn>
          </div>

          <!-- Message Item -->
          <div 
            v-else
            v-for="message in filteredMessages" 
            :key="message.id"
            class="message-item"
            :class="{ 
              'unread': !message.read, 
              'urgent': message.priority === 'urgent',
              'high': message.priority === 'high'
            }"
            @click="openMessage(message)"
          >
            <div class="message-avatar">
              <v-avatar 
                :color="getPriorityColor(message.priority)"
                size="40"
              >
                <v-icon :icon="getMessageIcon(message.type)" color="white" size="20" />
              </v-avatar>
            </div>
            
            <div class="message-content">
              <div class="message-header">
                <h4 class="message-title">{{ message.title }}</h4>
                <div class="message-meta">
                  <v-chip 
                    v-if="message.priority === 'urgent'"
                    size="x-small" 
                    color="error"
                    class="priority-chip"
                  >
                    Urgent
                  </v-chip>
                  <v-chip 
                    v-else-if="message.priority === 'high'"
                    size="x-small" 
                    color="warning"
                    class="priority-chip"
                  >
                    High
                  </v-chip>
                  <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                </div>
              </div>
              
              <p class="message-preview">{{ message.preview }}</p>
              
              <div class="message-footer">
                <div class="message-type">
                  <v-icon size="16" :icon="getMessageIcon(message.type)" />
                  <span>{{ getMessageTypeLabel(message.type) }}</span>
                </div>
                <div v-if="!message.read" class="unread-indicator"></div>
              </div>
            </div>
            
            <div class="message-actions">
              <v-btn
                icon
                size="small"
                variant="text"
                @click.stop="toggleRead(message)"
              >
                <v-icon :icon="message.read ? 'mdi-email-open' : 'mdi-email'" />
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                @click.stop="deleteMessageHandler(message.id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && !error && filteredMessages.length === 0" class="empty-state">
            <v-avatar size="80" color="grey-lighten-3" class="mb-4">
              <v-icon size="40" color="grey">mdi-inbox</v-icon>
            </v-avatar>
            <h5 class="text-h5 text-medium-emphasis mb-2">No Messages</h5>
            <p class="text-body-1 text-medium-emphasis">
              You're all caught up! No {{ activeTab === 'all' ? '' : activeTab }} messages at the moment.
            </p>
          </div>
        </div>

        <!-- Message Detail Panel -->
        <div v-if="selectedMessage" class="message-detail">
          <div class="detail-header">
            <div class="detail-title">
              <h3>{{ selectedMessage.title }}</h3>
              <div class="detail-meta">
                <span class="detail-time">{{ formatFullTime(selectedMessage.createdAt) }}</span>
                <v-chip 
                  size="small"
                  :color="getPriorityColor(selectedMessage.priority)"
                  class="detail-priority"
                >
                  {{ getPriorityLabel(selectedMessage.priority) }}
                </v-chip>
              </div>
            </div>
            <v-btn
              icon
              variant="text"
              @click="closeMessage"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          
          <div class="detail-content">
            <div class="detail-body">
              {{ selectedMessage.content }}
            </div>
            
            <div v-if="selectedMessage.attachments" class="detail-attachments">
              <h4>Attachments</h4>
              <div class="attachment-list">
                <div 
                  v-for="attachment in selectedMessage.attachments" 
                  :key="attachment.id"
                  class="attachment-item"
                >
                  <v-icon>mdi-paperclip</v-icon>
                  <span>{{ attachment.name }}</span>
                  <v-btn size="small" variant="text">Download</v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/services/projectApi';
import { RetroGrid } from '@/components/ui/retro-grid';

// Types
interface Message {
  id: string;
  title: string;
  preview: string;
  content: string;
  type: string;
  priority: string;
  read: boolean;
  createdAt: Date;
  attachments: any[] | null;
}

interface ChatRoom {
  id: string;
  roomName: string;
  roomType: string;
  projectId?: string;
  createdAt: string;
}

// Reactive data
const activeTab = ref('all');
const selectedMessage = ref<Message | null>(null);
const messages = ref<Message[]>([]);
const chatRooms = ref<ChatRoom[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Auth store
const authStore = useAuthStore();

// Remove manual auth handling - api instance handles it automatically

// Computed properties
const filteredMessages = computed(() => {
  if (activeTab.value === 'all') {
    return messages.value;
  }
  return messages.value.filter(message => message.type === activeTab.value);
});

// API Methods
const fetchChatRooms = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await api.get('/chat/rooms');
    chatRooms.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch chat rooms';
    console.error('Error fetching chat rooms:', err);
  } finally {
    loading.value = false;
  }
};

const fetchMessages = async (roomId: string) => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await api.get(`/chat/rooms/${roomId}/messages`);
    
    // Convert API messages to our Message format
    messages.value = response.data.messages.map((msg: any) => ({
      id: msg.id,
      title: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
      preview: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
      content: msg.content,
      type: msg.messageType || 'notification',
      priority: 'medium', // Default priority since API doesn't have this
      read: false, // Default to unread
      createdAt: new Date(msg.timestamp),
      attachments: msg.attachments || null
    }));
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch messages';
    console.error('Error fetching messages:', err);
  } finally {
    loading.value = false;
  }
};

const markMessageAsRead = async (messageId: string) => {
  try {
    // This would be a custom endpoint for system messages
    // For now, just update locally
    const message = messages.value.find(msg => msg.id === messageId);
    if (message) {
      message.read = true;
    }
  } catch (err) {
    console.error('Error marking message as read:', err);
  }
};

const deleteMessage = async (messageId: string) => {
  try {
    // This would be a custom endpoint for system messages
    // For now, just remove locally
    const index = messages.value.findIndex(msg => msg.id === messageId);
    if (index > -1) {
      messages.value.splice(index, 1);
    }
    if (selectedMessage.value?.id === messageId) {
      selectedMessage.value = null;
    }
  } catch (err) {
    console.error('Error deleting message:', err);
  }
};

const loadMessages = async () => {
  await fetchChatRooms();
  
  // Load messages from the first available room (system messages)
  if (chatRooms.value.length > 0) {
    const systemRoom = chatRooms.value.find(room => room.roomType === 'system');
    if (systemRoom) {
      await fetchMessages(systemRoom.id);
    }
  }
};

// Methods
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'grey';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'Urgent';
    case 'high': return 'High Priority';
    case 'medium': return 'Medium Priority';
    case 'low': return 'Low Priority';
    default: return 'Normal';
  }
};

const getMessageIcon = (type: string) => {
  switch (type) {
    case 'notification': return 'mdi-bell';
    case 'alert': return 'mdi-alert-circle';
    case 'announcement': return 'mdi-bullhorn';
    default: return 'mdi-message';
  }
};

const getMessageTypeLabel = (type: string) => {
  switch (type) {
    case 'notification': return 'Notification';
    case 'alert': return 'Alert';
    case 'announcement': return 'Announcement';
    default: return 'Message';
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const formatFullTime = (date: Date) => {
  return date.toLocaleString();
};

const openMessage = async (message: Message) => {
  selectedMessage.value = message;
  if (!message.read) {
    await markMessageAsRead(message.id);
  }
};

const closeMessage = () => {
  selectedMessage.value = null;
};

const toggleRead = async (message: Message) => {
  message.read = !message.read;
  if (message.read) {
    await markMessageAsRead(message.id);
  }
};

const deleteMessageHandler = async (messageId: string) => {
  await deleteMessage(messageId);
};

onMounted(async () => {
  await loadMessages();
});
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

/* Header Section */
.messages-header {
  background: transparent;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.header-icon {
  margin-bottom: 1.5rem;
}

.header-icon .v-icon {
  color: var(--erp-accent-green);
}

.header-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
}

.header-subtitle {
  font-size: 1.25rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0;
  font-weight: 400;
}

/* Messages Navigation */
.messages-nav {
  background: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.mobile-tabs {
  display: none;
  padding: 0.75rem 0;
}

.mobile-tab-select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;
  color: var(--erp-text);
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
}

.tab-nav {
  display: flex;
  gap: 0;
  position: relative;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--erp-text);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 140px;
  justify-content: center;
}

.tab-button:hover {
  color: var(--erp-text);
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.tab-button.active {
  color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 8%, var(--erp-surface));
  border-bottom-color: var(--erp-accent-green);
}

.tab-button .v-icon {
  transition: all 0.3s ease;
}

.tab-button.active .v-icon {
  color: var(--erp-accent-green);
  transform: scale(1.1);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: var(--erp-accent-green);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 2px 2px 0 0;
}

.tab-button.active .tab-indicator {
  width: 100%;
}

.tab-button span {
  transition: all 0.3s ease;
  font-weight: inherit;
}

.tab-button.active span {
  font-weight: 600;
}

/* Messages Container */
.messages-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.messages-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: calc(100vh - 300px);
}

.messages-list {
  background: var(--erp-card-bg);
  border-radius: 16px;
  border: 1px solid var(--erp-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  flex: 1;
}

.error-state .v-icon {
  margin-bottom: 1rem;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--erp-border);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.message-item:hover {
  background: var(--erp-surface);
}

.message-item.unread {
  background: color-mix(in srgb, var(--erp-accent-green) 3%, var(--erp-card-bg));
  border-left: 4px solid var(--erp-accent-green);
}

.message-item.urgent {
  background: color-mix(in srgb, #ef4444 5%, var(--erp-card-bg));
  border-left: 4px solid #ef4444;
}

.message-item.high {
  background: color-mix(in srgb, #f59e0b 3%, var(--erp-card-bg));
  border-left: 4px solid #f59e0b;
}

.message-avatar {
  margin-right: 1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.message-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
  flex: 1;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.priority-chip {
  font-size: 0.75rem !important;
  height: 20px !important;
}

.message-time {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.message-preview {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.6;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: var(--erp-accent-green);
  border-radius: 50%;
  flex-shrink: 0;
}

.message-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.message-item:hover .message-actions {
  opacity: 1;
}

/* Message Detail Panel */
.message-detail {
  background: var(--erp-card-bg);
  border-radius: 16px;
  border: 1px solid var(--erp-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--erp-border);
}

.detail-title h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--erp-text);
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-time {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.detail-priority {
  font-size: 0.75rem !important;
}

.detail-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.detail-body {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--erp-text);
  margin-bottom: 2rem;
}

.detail-attachments h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--erp-text);
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--erp-surface);
  border-radius: 8px;
  border: 1px solid var(--erp-border);
}

.attachment-item span {
  flex: 1;
  color: var(--erp-text);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .messages-content {
    grid-template-columns: 1fr;
    height: auto;
    gap: 1rem;
  }
  
  .message-detail {
    height: 400px;
    margin-top: 1rem;
    order: 2;
  }
  
  .messages-list {
    order: 1;
  }
}

@media (max-width: 768px) {
  .messages-container {
    background: transparent !important;
    padding: 0 !important;
  }
  
  .messages-header {
    padding: 1.5rem 1rem;
    margin-bottom: 1rem;
  }
  
  .header-title {
    font-size: 1.75rem;
  }
  
  .header-subtitle {
    font-size: 0.9rem;
  }
  
  .nav-container {
    padding: 0;
  }

  .mobile-tabs { display: block; }
  .tab-nav { display: none; }
  
  .tab-button {
    padding: 0.75rem 1rem;
    min-width: 120px;
    font-size: 0.9rem;
    background: var(--erp-surface) !important;
    border-radius: 8px;
    margin-right: 0.5rem;
  }
  
  .messages-content {
    gap: 0.75rem;
    background: transparent !important;
  }
  
  .message-detail {
    height: 350px;
    margin-top: 0.75rem;
    background: var(--erp-surface) !important;
    border-radius: 8px;
  }
  
  .message-item {
    padding: 1rem;
  }
  
  .detail-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .detail-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .messages-header {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
  
  .header-subtitle {
    font-size: 0.85rem;
  }
  
  .nav-container {
    padding: 0;
  }

  .mobile-tab-select {
    font-size: 0.9rem;
    padding: 0.5rem 0.625rem;
  }
  
  .tab-button {
    padding: 0.5rem 0.75rem;
    min-width: 90px;
    font-size: 0.8rem;
    gap: 0.25rem;
    margin-right: 0.25rem;
  }
  
  .tab-button .v-icon {
    font-size: 16px;
  }
  
  .messages-container {
    padding: 0;
  }
  
  .messages-content {
    gap: 0.5rem;
  }
  
  .message-detail {
    height: 300px;
    margin-top: 0.5rem;
  }
  
  .message-item {
    padding: 0.75rem;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .message-meta {
    align-self: flex-end;
  }
  
  .message-title {
    font-size: 0.9rem;
  }
  
  .message-preview {
    font-size: 0.8rem;
  }
  
  .message-time {
    font-size: 0.75rem;
  }
  
  .detail-header {
    padding: 1rem 1rem 0.75rem 1rem;
  }
  
  .detail-content {
    padding: 1rem;
  }
  
  .detail-title h3 {
    font-size: 1.25rem;
  }
  
  .detail-body {
    font-size: 0.9rem;
  }
  
  .attachment-item {
    padding: 0.75rem;
  }
  
  .attachment-item span {
    font-size: 0.85rem;
  }
}
</style>