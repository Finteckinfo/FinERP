import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';

// WebSocket connection state
export const isConnected = ref(false);
export const connectionError = ref<string | null>(null);

// WebSocket instance
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Event listeners
const eventListeners = reactive<{ [event: string]: Function[] }>({});

// Auth store
const authStore = useAuthStore();

// WebSocket URL
const getWebSocketURL = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
  const url = new URL(backendUrl);
  const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${url.host}/ws`;
};

// Connect to WebSocket
export const connectWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  const token = authStore.user?.token || '';
  if (!token) {
    connectionError.value = 'No authentication token available';
    return;
  }

  try {
    const wsUrl = `${getWebSocketURL()}?token=${encodeURIComponent(token)}`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      isConnected.value = true;
      connectionError.value = null;
      reconnectAttempts = 0;
      emit('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        emit('message', data);

        // Handle specific message types
        if (data.type) {
          emit(data.type, data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      isConnected.value = false;

      if (event.code !== 1000) { // Not a normal closure
        connectionError.value = `Connection closed: ${event.reason || 'Unknown error'}`;
        attemptReconnect();
      }

      emit('disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      connectionError.value = 'WebSocket connection error';
      emit('error', error);
    };

  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
    connectionError.value = 'Failed to create WebSocket connection';
  }
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close(1000, 'User disconnected');
    ws = null;
  }

  isConnected.value = false;
};

// Attempt to reconnect
const attemptReconnect = () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
    connectionError.value = 'Max reconnection attempts reached';
    return;
  }

  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s

  console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);

  reconnectTimeout = setTimeout(() => {
    connectWebSocket();
  }, delay);
};

// Send message through WebSocket
export const sendWebSocketMessage = (message: any) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    return true;
  } else {
    console.warn('WebSocket is not connected');
    return false;
  }
};

// Event system
export const on = (event: string, callback: Function) => {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
};

export const off = (event: string, callback: Function) => {
  if (eventListeners[event]) {
    const index = eventListeners[event].indexOf(callback);
    if (index > -1) {
      eventListeners[event].splice(index, 1);
    }
  }
};

export const emit = (event: string, data?: any) => {
  if (eventListeners[event]) {
    eventListeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket event listener for '${event}':`, error);
      }
    });
  }
};

// Join a chat room
export const joinRoom = (roomId: string) => {
  return sendWebSocketMessage({
    type: 'join_room',
    roomId,
    timestamp: Date.now()
  });
};

// Leave a chat room
export const leaveRoom = (roomId: string) => {
  return sendWebSocketMessage({
    type: 'leave_room',
    roomId,
    timestamp: Date.now()
  });
};

// Send typing indicator
export const sendTypingStart = (roomId: string) => {
  return sendWebSocketMessage({
    type: 'typing_start',
    roomId,
    timestamp: Date.now()
  });
};

export const sendTypingStop = (roomId: string) => {
  return sendWebSocketMessage({
    type: 'typing_stop',
    roomId,
    timestamp: Date.now()
  });
};

// Send reaction to a message
export const sendReaction = (roomId: string, messageId: string, emoji: string) => {
  return sendWebSocketMessage({
    type: 'reaction',
    roomId,
    messageId,
    emoji,
    timestamp: Date.now()
  });
};

// Initialize WebSocket connection when auth token is available
export const initializeWebSocket = () => {
  if (authStore.user?.token && !ws) {
    connectWebSocket();
  }
};

// Cleanup on app unmount
export const cleanupWebSocket = () => {
  disconnectWebSocket();
  // Clear all event listeners
  Object.keys(eventListeners).forEach(event => {
    delete eventListeners[event];
  });
};
