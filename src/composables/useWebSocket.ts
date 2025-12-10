import { ref, onMounted, onUnmounted } from 'vue';
import { 
  initializeWebSocket, 
  cleanupWebSocket, 
  joinRoom, 
  leaveRoom, 
  sendTypingStart, 
  sendTypingStop,
  sendReaction,
  on as wsOn,
  off as wsOff,
  isConnected,
  connectionError
} from '@/services/websocket';

export function useWebSocket() {
  const currentRoomId = ref<string | null>(null);
  const typingUsers = ref<string[]>([]);
  const isTyping = ref(false);
  const typingTimeout = ref<NodeJS.Timeout | null>(null);

  // Event handlers
  const eventHandlers = {
    new_message: (data: any) => {
      // This will be handled by the component
    },
    user_joined: (data: any) => {
      // This will be handled by the component
    },
    user_left: (data: any) => {
      // This will be handled by the component
    },
    typing_start: (data: any) => {
      if (data.roomId === currentRoomId.value && !typingUsers.value.includes(data.userId)) {
        typingUsers.value.push(data.userId);
      }
    },
    typing_stop: (data: any) => {
      if (data.roomId === currentRoomId.value) {
        const index = typingUsers.value.indexOf(data.userId);
        if (index > -1) {
          typingUsers.value.splice(index, 1);
        }
      }
    },
    online_update: (data: any) => {
      // This will be handled by the component
    },
    reaction: (data: any) => {
      // This will be handled by the component
    }
  };

  // Initialize WebSocket connection
  const init = () => {
    initializeWebSocket();
    
    // Set up event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      wsOn(event, handler);
    });
  };

  // Clean up WebSocket connection
  const cleanup = () => {
    if (currentRoomId.value) {
      leaveRoom(currentRoomId.value);
    }
    
    // Remove event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      wsOff(event, handler);
    });
    
    // Clear typing timeout
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value);
    }
  };

  // Join a room
  const joinRoomHandler = (roomId: string) => {
    if (currentRoomId.value) {
      leaveRoom(currentRoomId.value);
    }
    
    currentRoomId.value = roomId;
    joinRoom(roomId);
  };

  // Leave current room
  const leaveRoomHandler = () => {
    if (currentRoomId.value) {
      leaveRoom(currentRoomId.value);
      currentRoomId.value = null;
    }
  };

  // Handle typing input
  const handleTypingInput = () => {
    if (!currentRoomId.value) return;
    
    if (!isTyping.value) {
      isTyping.value = true;
      sendTypingStart(currentRoomId.value);
    }
    
    // Clear existing timeout
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeout.value = setTimeout(() => {
      if (isTyping.value && currentRoomId.value) {
        sendTypingStop(currentRoomId.value);
        isTyping.value = false;
      }
    }, 3000);
  };

  // Add reaction to message
  const addReaction = (messageId: string, emoji: string) => {
    if (currentRoomId.value) {
      sendReaction(currentRoomId.value, messageId, emoji);
    }
  };

  // Set custom event handlers
  const setEventHandler = (event: string, handler: (data: any) => void) => {
    wsOff(event, eventHandlers[event as keyof typeof eventHandlers]);
    eventHandlers[event as keyof typeof eventHandlers] = handler;
    wsOn(event, handler);
  };

  return {
    // State
    currentRoomId,
    typingUsers,
    isTyping,
    isConnected,
    connectionError,
    
    // Methods
    init,
    cleanup,
    joinRoom: joinRoomHandler,
    leaveRoom: leaveRoomHandler,
    handleTypingInput,
    addReaction,
    setEventHandler
  };
}
