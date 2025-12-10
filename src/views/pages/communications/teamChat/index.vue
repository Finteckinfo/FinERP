<template>
  <div class="team-chat-page">
    <!-- Main Chat Interface - Self-contained layout -->
    <div class="chat-interface">
      <!-- Mobile Toolbar - Only show in chat view on mobile -->
      <div class="mobile-chat-actions" v-if="isMobile && currentView === 'chat'">
        <v-btn icon variant="text" @click="currentView = 'projects'">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="spacer"></div>
        <v-btn icon variant="text" @click="currentView = 'members'">
          <v-icon>mdi-account-group</v-icon>
        </v-btn>
      </div>

      <!-- Projects Sidebar - Left Column -->
      <div 
        class="projects-column"
        :class="{ 
          'visible': isWide || isMedium || (isMobile && currentView === 'projects'),
          'hidden': isMobile && currentView !== 'projects'
        }"
      >
        <div class="sidebar-header">
          <div class="header-content">
            <h3>Projects</h3>
            <v-btn
              v-if="isMobile"
              icon
              variant="text"
              size="small"
              @click="currentView = 'chat'"
              class="toggle-btn"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        
        <div class="projects-list">
          <!-- Loading State -->
          <div v-if="loadingRooms" class="loading-state">
            <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <v-icon color="error" size="24">mdi-alert-circle</v-icon>
            <p class="error-text">{{ error }}</p>
          </div>

          <!-- Projects List -->
          <div 
            v-else
            v-for="project in projects" 
            :key="project.id"
            class="project-item"
            :class="{ active: selectedRoom?.projectId === project.id }"
            @click="selectProject(project); if (isMobile) currentView = 'chat'"
          >
            <div class="project-avatar">
              <v-avatar :color="getProjectColor(project.type)" size="36">
                <v-icon :icon="getProjectIcon(project.type)" color="white" size="18" />
              </v-avatar>
            </div>
            
            <div class="project-details">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-last-message">{{ getLastMessage(project.id) }}</div>
            </div>
            
            <div v-if="getUnreadCount(project.id) > 0" class="unread-badge">
              {{ getUnreadCount(project.id) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area - Middle Column -->
      <div 
        class="chat-column"
        :class="{ 
          'visible': isWide || isMedium || (isMobile && currentView === 'chat'),
          'hidden': isMobile && currentView !== 'chat'
        }"
      >
        <!-- Chat Header -->
        <div v-if="selectedRoom" class="chat-header">
          <div class="chat-project-info">
            <v-avatar :color="getProjectColor(selectedRoom.roomType)" size="40">
              <v-icon :icon="getProjectIcon(selectedRoom.roomType)" color="white" size="20" />
            </v-avatar>
            <div class="chat-project-details">
              <h3>{{ selectedRoom.roomName }}</h3>
              <p>{{ onlineMembers.length }} team members online</p>
            </div>
          </div>
          
          <div class="chat-actions">
            <v-btn
              v-if="isMedium || isWide"
              icon
              variant="text"
              @click="showMembersSidebar = !showMembersSidebar"
              :class="{ active: showMembersSidebar }"
            >
              <v-icon>mdi-account-group</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              @click="showChatSettings = !showChatSettings"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </div>
        </div>
        
        <!-- Empty Header for Chat -->
        <div v-else class="chat-header empty-header">
          <div class="chat-project-info">
            <h3>Team Chat</h3>
            <p>Select a project to start chatting</p>
          </div>
        </div>

        <!-- Chat Content -->
        <div v-if="selectedRoom" class="chat-content">
          <!-- Messages List -->
          <div class="messages-area">
            <div class="messages-list" ref="messagesList">
              <!-- Loading Messages -->
              <div v-if="loadingMessages" class="loading-messages">
                <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
                <span class="ml-2">Loading messages...</span>
              </div>

              <!-- Messages -->
              <div 
                v-else
                v-for="message in currentMessages" 
                :key="message.id"
                class="message-bubble"
                :class="{ 
                  'own-message': (message.senderId || message.sender_user_id) === currentUserId,
                  'system-message': message.type === 'system'
                }"
              >
                <div v-if="message.type !== 'system'" class="message-avatar">
                  <v-avatar size="32" :color="getUserColor(message.senderId || message.sender_user_id)">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </div>
                
                <div class="message-content">
                  <div v-if="message.type !== 'system'" class="message-header">
                    <span class="sender-name">{{ getSenderName(message.senderId || message.sender_user_id) }}</span>
                    <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  </div>
                  
                  <div class="message-text" :class="{ 'system-text': message.type === 'system' }">
                    {{ message.content }}
                  </div>
                  
                  <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                    <div 
                      v-for="(attachment, index) in message.attachments" 
                      :key="index"
                      class="attachment-item"
                    >
                      <v-icon>mdi-paperclip</v-icon>
                      <span>{{ typeof attachment === 'string' ? attachment : (attachment as any)?.name || attachment }}</span>
                      <v-btn size="x-small" variant="text">Download</v-btn>
                    </div>
                  </div>

                  <!-- Message Reactions -->
                  <div v-if="message.reactions && Object.keys(message.reactions).length > 0" class="message-reactions">
                    <v-chip
                      v-for="(users, emoji) in message.reactions"
                      :key="emoji"
                      size="x-small"
                      variant="outlined"
                      class="reaction-chip"
                    >
                      {{ emoji }} {{ users.length }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="typingUsers.length > 0" class="typing-indicator">
            <div class="typing-content">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="typing-text">
                {{ typingUsers.length === 1 ? getSenderName(typingUsers[0]) : `${typingUsers.length} people` }} 
                {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
              </span>
            </div>
          </div>

          <!-- Connection Status -->
          <div v-if="!isConnected" class="connection-status">
            <v-alert
              :type="connectionError ? 'error' : 'warning'"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              <template v-if="connectionError">
                Connection Error: {{ connectionError }}
              </template>
              <template v-else>
                Connecting to chat...
              </template>
            </v-alert>
          </div>

          <!-- Message Input -->
          <div class="message-input-area">
            <div class="input-container">
              <v-btn
                icon
                variant="text"
                class="attachment-btn"
              >
                <v-icon>mdi-paperclip</v-icon>
              </v-btn>
              
              <v-textarea
                v-model="newMessage"
                placeholder="Type your message..."
                variant="outlined"
                rows="1"
                auto-grow
                hide-details
                class="message-input"
                @keydown.enter.prevent="sendMessage"
                @input="handleTypingInput"
              />
              
              <v-btn
                color="primary"
                variant="flat"
                :disabled="!newMessage.trim()"
                @click="sendMessage"
                class="send-btn"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!selectedRoom" class="empty-chat-state">
          <v-avatar size="80" color="grey-lighten-3" class="mb-4">
            <v-icon size="40" color="grey">mdi-chat</v-icon>
          </v-avatar>
          <h5 class="text-h5 text-medium-emphasis mb-2">Select a Project</h5>
          <p class="text-body-1 text-medium-emphasis">
            Choose a project from the sidebar to start chatting with your team members.
          </p>
        </div>
      </div>

      <!-- Members Sidebar - Right Column -->
      <div 
        class="members-column"
        :class="{ 
          'visible': (isWide && showMembersSidebar) || (isMobile && currentView === 'members'),
          'hidden': !isWide || !showMembersSidebar || (isMobile && currentView !== 'members')
        }"
      >
        <div class="sidebar-header">
          <div class="header-content">
            <h3>Team Members</h3>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="isMobile ? (currentView = 'chat') : (showMembersSidebar = false)"
              class="toggle-btn"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        
        <div class="members-list">
          <!-- Online Members -->
          <div class="member-section">
            <div class="section-header">
              <span class="section-title">Online ({{ onlineMembers.length }})</span>
            </div>
            <div 
              v-for="memberId in onlineMembers" 
              :key="memberId"
              class="member-item online"
            >
              <v-avatar size="32" :color="getUserColor(memberId)">
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>
              <div class="member-info">
                <span class="member-name">{{ getSenderName(memberId) }}</span>
                <span class="member-role">{{ projectMembers.find(m => m.id === memberId)?.role || 'Member' }}</span>
              </div>
              <div class="online-indicator"></div>
            </div>
          </div>

          <!-- Offline Members -->
          <div class="member-section">
            <div class="section-header">
              <span class="section-title">Offline ({{ offlineMembers.length }})</span>
            </div>
            <div 
              v-for="member in offlineMembers" 
              :key="member.id"
              class="member-item offline"
            >
              <v-avatar size="32" :color="getUserColor(member.id)">
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role">{{ member.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { api, projectApi, userRoleApi } from '@/services/projectApi';
import { RetroGrid } from '@/components/ui/retro-grid';
import { 
  initializeWebSocket, 
  cleanupWebSocket, 
  joinRoom as wsJoinRoom, 
  leaveRoom as wsLeaveRoom, 
  sendTypingStart, 
  sendTypingStop,
  sendReaction,
  on as wsOn,
  off as wsOff,
  isConnected,
  connectionError
} from '@/services/websocket';

// Types
interface Project {
  id: string;
  name: string;
  description?: string;
  type: 'PROGRESSIVE' | 'PARALLEL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  startDate: string;
  endDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatRoom {
  id: string;
  roomName: string;
  roomType: string;
  projectId?: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  attachments: string[];
  reactions: { [emoji: string]: string[] };
  reply_to?: string;
  edited: boolean;
  timestamp: number;
  sender_user_id: string;
  senderId?: string; // For compatibility
  type?: string; // For compatibility
  messageType?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

// Reactive data
const projects = ref<Project[]>([]);
const selectedRoom = ref<ChatRoom | null>(null);
const showProjectsSidebar = ref(true);
const showMembersSidebar = ref(false);
const showChatSettings = ref(false);
const newMessage = ref('');
const currentUserId = ref('user-1'); // This should come from auth
const sidebarWidth = ref(280);

// Responsive state
const isMobile = ref(false);
const isMedium = ref(false);
const isWide = ref(false);
const currentView = ref<'projects' | 'chat' | 'members'>('chat');

// Real-time states
const isTyping = ref(false);
const typingUsers = ref<string[]>([]);
const typingTimeout = ref<NodeJS.Timeout | null>(null);

// API data
const chatRooms = ref<ChatRoom[]>([]);
const currentMessages = ref<ChatMessage[]>([]);
const onlineMembers = ref<string[]>([]);
const projectMembers = ref<TeamMember[]>([]);
const unreadCounts = ref<{ [roomId: string]: number }>({});

// Loading states
const loadingRooms = ref(false);
const loadingMessages = ref(false);
const error = ref<string | null>(null);

// Auth store
const authStore = useAuthStore();

// Remove manual auth handling - api instance handles it automatically

// Computed properties
const offlineMembers = computed(() => {
  return projectMembers.value.filter(member => !member.online);
});

const updateResponsiveState = () => {
  const width = window.innerWidth;
  isMobile.value = width < 768;
  isMedium.value = width >= 768 && width < 1200;
  isWide.value = width >= 1200;
  
  // Auto-set initial view based on screen size
  if (isMobile.value && currentView.value === 'chat' && !selectedRoom.value) {
    currentView.value = 'projects';
  }
};

// API Methods
const fetchProjects = async () => {
  try {
    loadingRooms.value = true;
    error.value = null;
    
    const response = await projectApi.getUserProjectsSimple();
    projects.value = response.projects || response || [];
    
    console.log('Fetched projects for team chat:', projects.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch projects';
    console.error('Error fetching projects:', err);
  } finally {
    loadingRooms.value = false;
  }
};

const fetchChatRooms = async () => {
  try {
    const response = await api.get('/chat/rooms');
    chatRooms.value = response.data;
    
    // Filter to only show project rooms
    chatRooms.value = chatRooms.value.filter(room => room.roomType === 'project');
  } catch (err) {
    console.error('Error fetching chat rooms:', err);
    // Don't set error for chat rooms as projects are the primary source
  }
};

const fetchMessages = async (roomId: string) => {
  try {
    loadingMessages.value = true;
    error.value = null;
    
    const response = await api.get(`/chat/rooms/${roomId}/messages`);
    currentMessages.value = response.data.messages;
    
    // Clear unread count for this room
    unreadCounts.value[roomId] = 0;
    
    nextTick(() => {
      scrollToBottom();
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch messages';
    console.error('Error fetching messages:', err);
  } finally {
    loadingMessages.value = false;
  }
};

const fetchProjectMembers = async (projectId: string) => {
  try {
    const response = await userRoleApi.getAccessibleProjectTeam(projectId);
    const team = Array.isArray(response) ? response : (response.team || response.userRoles || response.data || []);
    
    projectMembers.value = team.map((userRole: any) => ({
      id: userRole.userId || userRole.user?.id || userRole.id,
      name: userRole.user?.firstName && userRole.user?.lastName 
        ? `${userRole.user.firstName} ${userRole.user.lastName}`
        : userRole.user?.email || userRole.name || 'Unknown User',
      role: userRole.role || 'Member',
      online: onlineMembers.value.includes(userRole.userId || userRole.user?.id || userRole.id)
    }));
  } catch (err) {
    console.error('Error fetching project members:', err);
    // Keep existing members if fetch fails
  }
};

const fetchOnlineMembers = async (roomId: string) => {
  try {
    const response = await api.get(`/chat/rooms/${roomId}/online`);
    onlineMembers.value = response.data.online;
    
    // Update project members online status
    projectMembers.value.forEach(member => {
      member.online = onlineMembers.value.includes(member.id);
    });
  } catch (err) {
    console.error('Error fetching online members:', err);
  }
};

const fetchUnreadCount = async (roomId: string) => {
  try {
    const response = await api.get(`/chat/rooms/${roomId}/unread`);
    unreadCounts.value[roomId] = response.data.count;
  } catch (err) {
    console.error('Error fetching unread count:', err);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedRoom.value) return;
  
  try {
    await api.post(`/chat/rooms/${selectedRoom.value.id}/messages`, {
      content: newMessage.value.trim(),
      messageType: 'text'
    });
    
    // Message will be received via WebSocket, so we just clear the input
    newMessage.value = '';
    
    // Stop typing indicator
    if (isTyping.value) {
      sendTypingStop(selectedRoom.value.id);
      isTyping.value = false;
    }
    
  } catch (err) {
    console.error('Error sending message:', err);
    error.value = err instanceof Error ? err.message : 'Failed to send message';
  }
};

const joinRoom = async (roomId: string) => {
  try {
    await api.post(`/chat/rooms/${roomId}/join`);
  } catch (err) {
    console.error('Error joining room:', err);
  }
};

const resetUnreadCount = async (roomId: string) => {
  try {
    await api.post(`/chat/rooms/${roomId}/unread/reset`);
    unreadCounts.value[roomId] = 0;
  } catch (err) {
    console.error('Error resetting unread count:', err);
  }
};

// WebSocket Event Handlers
const handleNewMessage = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const newMsg: ChatMessage = {
      id: data.id,
      content: data.content,
      attachments: data.attachments || [],
      reactions: data.reactions || {},
      reply_to: data.reply_to,
      edited: data.edited || false,
      timestamp: data.timestamp,
      sender_user_id: data.sender_user_id,
      messageType: data.messageType || 'text'
    };
    
    currentMessages.value.push(newMsg);
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const handleUserJoined = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      content: `${getSenderName(data.userId)} joined the chat`,
      attachments: [],
      reactions: {},
      edited: false,
      timestamp: Date.now(),
      sender_user_id: 'system',
      messageType: 'system'
    };
    
    currentMessages.value.push(systemMessage);
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const handleUserLeft = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      content: `${getSenderName(data.userId)} left the chat`,
      attachments: [],
      reactions: {},
      edited: false,
      timestamp: Date.now(),
      sender_user_id: 'system',
      messageType: 'system'
    };
    
    currentMessages.value.push(systemMessage);
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const handleTypingStart = (data: any) => {
  if (data.roomId === selectedRoom.value?.id && data.userId !== currentUserId.value) {
    if (!typingUsers.value.includes(data.userId)) {
      typingUsers.value.push(data.userId);
    }
  }
};

const handleTypingStop = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const index = typingUsers.value.indexOf(data.userId);
    if (index > -1) {
      typingUsers.value.splice(index, 1);
    }
  }
};

const handleOnlineUpdate = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    onlineMembers.value = data.online;
    
    // Update project members online status
    projectMembers.value.forEach(member => {
      member.online = onlineMembers.value.includes(member.id);
    });
  }
};

const handleReaction = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const message = currentMessages.value.find(msg => msg.id === data.messageId);
    if (message) {
      if (!message.reactions) {
        message.reactions = {};
      }
      if (!message.reactions[data.emoji]) {
        message.reactions[data.emoji] = [];
      }
      
      if (!message.reactions[data.emoji].includes(data.userId)) {
        message.reactions[data.emoji].push(data.userId);
      }
    }
  }
};

// Methods
const selectProject = async (project: Project) => {
  // Find or create chat room for this project
  let room = chatRooms.value.find(r => r.projectId === project.id);
  
  if (!room) {
    // Create a virtual room for the project
    room = {
      id: `project-${project.id}`,
      roomName: project.name,
      roomType: 'project',
      projectId: project.id,
      createdAt: project.createdAt
    };
    chatRooms.value.push(room);
  }
  
  // Leave previous room if any
  if (selectedRoom.value) {
    wsLeaveRoom(selectedRoom.value.id);
  }
  
  selectedRoom.value = room;
  
  // Join the new room via WebSocket
  wsJoinRoom(room.id);
  
  // Fetch project members, messages, and online members
  await Promise.all([
    fetchProjectMembers(project.id),
    fetchMessages(room.id),
    fetchOnlineMembers(room.id),
    resetUnreadCount(room.id)
  ]);
};

const selectRoom = async (room: ChatRoom) => {
  // Leave previous room if any
  if (selectedRoom.value) {
    wsLeaveRoom(selectedRoom.value.id);
  }
  
  selectedRoom.value = room;
  
  // Join the new room via WebSocket
  wsJoinRoom(room.id);
  
  // Fetch messages and online members
  await Promise.all([
    fetchMessages(room.id),
    fetchOnlineMembers(room.id),
    resetUnreadCount(room.id)
  ]);
};

const getProjectColor = (type: string) => {
  switch (type) {
    case 'PROGRESSIVE': return 'primary';
    case 'PARALLEL': return 'success';
    case 'project': return 'primary';
    case 'direct': return 'success';
    case 'group': return 'warning';
    default: return 'grey';
  }
};

const getProjectIcon = (type: string) => {
  switch (type) {
    case 'PROGRESSIVE': return 'mdi-timeline';
    case 'PARALLEL': return 'mdi-layers';
    case 'project': return 'mdi-folder';
    case 'direct': return 'mdi-account';
    case 'group': return 'mdi-account-group';
    default: return 'mdi-folder';
  }
};

const getUserColor = (userId: string) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  const index = userId.split('-')[1] ? parseInt(userId.split('-')[1]) % colors.length : 0;
  return colors[index] || 'grey';
};

const getSenderName = (senderId: string) => {
  if (senderId === 'system') return 'System';
  const member = projectMembers.value.find(m => m.id === senderId);
  return member ? member.name : `User ${senderId}`;
};

const formatMessageTime = (timestamp: number) => {
  const now = Date.now();
  const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

const scrollToBottom = () => {
  const messagesList = document.querySelector('.messages-list');
  if (messagesList) {
    messagesList.scrollTop = messagesList.scrollHeight;
  }
};

// Toggle functions removed - using currentView for mobile navigation instead

const getUnreadCount = (roomId: string) => {
  return unreadCounts.value[roomId] || 0;
};

const getLastMessage = (roomId: string) => {
  // This would need to be implemented with a separate API call
  // or stored in the room data
  return 'No messages yet';
};

// Typing indicator functions
const handleTypingInput = () => {
  if (!selectedRoom.value) return;
  
  if (!isTyping.value) {
    isTyping.value = true;
    sendTypingStart(selectedRoom.value.id);
  }
  
  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  // Set new timeout to stop typing indicator
  typingTimeout.value = setTimeout(() => {
    if (isTyping.value) {
      sendTypingStop(selectedRoom.value!.id);
      isTyping.value = false;
    }
  }, 3000); // Stop typing after 3 seconds of inactivity
};

// Add reaction to message
const addReaction = (messageId: string, emoji: string) => {
  if (selectedRoom.value) {
    sendReaction(selectedRoom.value.id, messageId, emoji);
  }
};

// Watch for room changes to scroll to bottom
watch(selectedRoom, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

onMounted(async () => {
  // Initialize WebSocket connection
  initializeWebSocket();
  
  // Set up WebSocket event listeners
  wsOn('new_message', handleNewMessage);
  wsOn('user_joined', handleUserJoined);
  wsOn('user_left', handleUserLeft);
  wsOn('typing_start', handleTypingStart);
  wsOn('typing_stop', handleTypingStop);
  wsOn('online_update', handleOnlineUpdate);
  wsOn('reaction', handleReaction);
  
  await Promise.all([
    fetchProjects(),
    fetchChatRooms()
  ]);
  
  // Project members will be loaded when a project is selected
  projectMembers.value = [];

  updateResponsiveState();
  window.addEventListener('resize', updateResponsiveState);
  
  // Set initial view based on screen size
  if (isMobile.value) {
    // On mobile, start with projects list if no room selected, otherwise chat
    currentView.value = selectedRoom.value ? 'chat' : 'projects';
  } else {
    showProjectsSidebar.value = true;
    if (isWide.value) {
      showMembersSidebar.value = false; // Hidden by default on wide screens
    } else if (isMedium.value) {
      showMembersSidebar.value = false; // Hidden by default on tablet
    }
  }
});

onUnmounted(() => {
  // Clean up WebSocket listeners
  wsOff('new_message', handleNewMessage);
  wsOff('user_joined', handleUserJoined);
  wsOff('user_left', handleUserLeft);
  wsOff('typing_start', handleTypingStart);
  wsOff('typing_stop', handleTypingStop);
  wsOff('online_update', handleOnlineUpdate);
  wsOff('reaction', handleReaction);
  
  // Leave current room if any
  if (selectedRoom.value) {
    wsLeaveRoom(selectedRoom.value.id);
  }
  
  // Clean up typing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  // Clean up resize listener
  window.removeEventListener('resize', updateResponsiveState);
});
</script>

<style scoped>
.team-chat-page {
  min-height: 100vh;
  height: 100vh;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Chat Interface - Main Container */
.chat-interface {
  display: flex;
  flex: 1;
  height: 100%;
  background: var(--erp-card-bg);
  border-radius: 0;
  border: none;
  overflow: hidden;
  margin: 0;
  position: relative;
}

/* Mobile toolbar */
.mobile-chat-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--erp-surface);
  border-bottom: 1px solid var(--erp-border);
  flex-shrink: 0;
  z-index: 10;
}

.mobile-chat-actions .spacer { 
  flex: 1; 
}

/* Column Layouts - Projects Column (Left) */
.projects-column {
  display: flex;
  flex-direction: column;
  background: var(--erp-surface);
  border-right: 1px solid var(--erp-border);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  overflow: hidden;
}

.projects-column.visible {
  display: flex;
}

.projects-column.hidden {
  display: none;
}

/* Chat Column (Middle) */
.chat-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--erp-card-bg);
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.chat-column.visible {
  display: flex;
}

.chat-column.hidden {
  display: none;
}

/* Members Column (Right) */
.members-column {
  display: flex;
  flex-direction: column;
  background: var(--erp-surface);
  border-left: 1px solid var(--erp-border);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  overflow: hidden;
}

.members-column.visible {
  display: flex;
}

.members-column.hidden {
  display: none;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
  flex-shrink: 0;
}

.sidebar-header .header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.toggle-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.toggle-btn:hover {
  opacity: 1;
}

/* Projects List */
.projects-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.error-text {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-top: 0.5rem;
}

.project-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.project-item:hover {
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.project-item.active {
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
  border-left: 3px solid var(--erp-accent-green);
}

.project-avatar {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.project-details {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin-bottom: 0.25rem;
}

.project-last-message {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unread-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--erp-accent-green);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Header */
.empty-header {
  justify-content: flex-start;
}

.empty-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.empty-header p {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0.25rem 0 0 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
  flex-shrink: 0;
}

.chat-project-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-project-details h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.chat-project-details p {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.chat-actions .v-btn.active {
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
  color: var(--erp-accent-green);
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow: hidden;
}

.messages-list {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 70%;
  margin-bottom: 0.5rem;
}

.message-bubble.own-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-bubble.system-message {
  align-self: center;
  max-width: 100%;
  justify-content: center;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.sender-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
}

.message-time {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.6;
}

.message-text {
  background: var(--erp-surface);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--erp-text);
  word-wrap: break-word;
  border: 1px solid var(--erp-border);
}

.own-message .message-text {
  background: var(--erp-accent-green);
  color: white;
  border-color: var(--erp-accent-green);
}

.system-text {
  background: var(--erp-border);
  color: var(--erp-text);
  opacity: 0.8;
  font-style: italic;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
}

.message-attachments {
  margin-top: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--erp-border);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--erp-text);
}

.message-reactions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.reaction-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
}

.message-input-area {
  padding: 1rem;
  border-top: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.attachment-btn {
  flex-shrink: 0;
}

.message-input {
  flex: 1;
}

.send-btn {
  flex-shrink: 0;
}

/* Members List */
.members-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 0;
}

.member-section {
  margin-bottom: 1rem;
}

.section-header {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--erp-text);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  position: relative;
}

.member-item:hover {
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.member-item.online .member-name {
  color: var(--erp-text);
}

.member-item.offline .member-name {
  color: var(--erp-text);
  opacity: 0.6;
}

.member-item.offline .member-role {
  opacity: 0.5;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.125rem;
  display: block;
}

.member-role {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  display: block;
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid var(--erp-surface);
  position: absolute;
  top: 0.75rem;
  left: 2.5rem;
}

/* Typing Indicator */
.typing-indicator {
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--erp-text);
  opacity: 0.6;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  font-style: italic;
}

/* Connection Status */
.connection-status {
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

/* Empty Chat State */
.empty-chat-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  flex: 1;
  background: var(--erp-card-bg);
}

/* Responsive Design - Desktop (≥1200px) - 3 columns */
@media (min-width: 1200px) {
  .chat-interface {
    display: flex;
    flex-direction: row;
  }
  
  .projects-column {
    width: 25%;
    min-width: 280px;
    max-width: 320px;
  }
  
  .chat-column {
    flex: 1;
    min-width: 0;
  }
  
  .members-column {
    width: 30%;
    min-width: 280px;
    max-width: 360px;
  }
  
  .mobile-chat-actions {
    display: none;
  }
}

/* Tablet (768px - 1199px) - 2 columns */
@media (min-width: 768px) and (max-width: 1199px) {
  .chat-interface {
    display: flex;
    flex-direction: row;
  }
  
  .projects-column {
    width: 25%;
    min-width: 240px;
    max-width: 280px;
  }
  
  .chat-column {
    flex: 1;
    min-width: 0;
  }
  
  .members-column.hidden {
    display: none;
  }
  
  .members-column.visible {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 320px;
    max-width: 80%;
    z-index: 100;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
  }
  
  .mobile-chat-actions {
    display: none;
  }
}

/* Mobile (<768px) - Single column with progressive disclosure */
@media (max-width: 767px) {
  .chat-interface {
    display: flex;
    flex-direction: column;
    position: relative;
  }
  
  .projects-column {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 100;
    border-right: none;
  }
  
  .projects-column.hidden {
    display: none;
  }
  
  .chat-column {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 50;
  }
  
  .chat-column.hidden {
    display: none;
  }
  
  .members-column {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    z-index: 100;
    border-left: none;
  }
  
  .members-column.hidden {
    display: none;
  }
  
  .chat-header {
    padding: 0.75rem 1rem;
  }
  
  .chat-project-details h3 {
    font-size: 1rem;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .messages-list {
    padding: 0.75rem;
  }
  
  .message-input-area {
    padding: 0.75rem;
  }
  
  .project-item {
    padding: 0.75rem;
  }
  
  .sidebar-header {
    padding: 0.75rem 1rem;
  }
}

/* Small Mobile (<480px) */
@media (max-width: 480px) {
  .chat-header {
    padding: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .chat-project-info {
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }
  
  .chat-project-details h3 {
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .chat-project-details p {
    font-size: 0.75rem;
  }
  
  .chat-actions {
    flex-shrink: 0;
  }
  
  .message-bubble {
    max-width: 90%;
  }
  
  .message-text {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .project-item {
    padding: 0.5rem;
  }
  
  .project-avatar .v-avatar {
    width: 28px !important;
    height: 28px !important;
  }
  
  .project-name {
    font-size: 0.8rem;
  }
  
  .project-last-message {
    font-size: 0.7rem;
  }
  
  .input-container {
    gap: 0.5rem;
  }
  
  .message-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  
  .sidebar-header {
    padding: 0.5rem;
  }
}
</style>