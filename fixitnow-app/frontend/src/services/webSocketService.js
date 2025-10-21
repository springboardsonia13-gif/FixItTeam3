import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(onConnect, onError) {
    if (this.client && this.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Create STOMP client over SockJS
        this.client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
          connectHeaders: {
            // Add authentication headers if needed
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // Set up connection handlers
        this.client.onConnect = (frame) => {
          console.log('Connected to WebSocket:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          
          if (onConnect) onConnect(frame);
          resolve(frame);
        };

        this.client.onStompError = (frame) => {
          console.error('STOMP Error:', frame);
          this.connected = false;
          
          if (onError) onError(frame);
          reject(frame);
        };

        this.client.onWebSocketError = (error) => {
          console.error('WebSocket Error:', error);
          this.connected = false;
          
          if (onError) onError(error);
          reject(error);
        };

        this.client.onDisconnect = () => {
          console.log('Disconnected from WebSocket');
          this.connected = false;
          this.subscriptions.clear();
          
          // Attempt reconnection
          this.handleReconnection();
        };

        // Activate the client
        this.client.activate();

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      console.log('Disconnected from WebSocket');
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, 5000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Subscribe to a topic/queue
  subscribe(destination, callback, headers = {}) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    try {
      const subscription = this.client.subscribe(destination, callback, headers);
      this.subscriptions.set(destination, subscription);
      console.log(`Subscribed to ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`Failed to subscribe to ${destination}:`, error);
      return null;
    }
  }

  // Unsubscribe from a topic/queue
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`Unsubscribed from ${destination}`);
    }
  }

  // Send message to a destination
  send(destination, message, headers = {}) {
    if (!this.client || !this.connected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(message),
        headers
      });
      console.log(`Message sent to ${destination}:`, message);
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${destination}:`, error);
      return false;
    }
  }

  // Join a chat room
  joinRoom(roomId, user) {
    const message = {
      sender: user.name,
      userId: user.id,
      type: 'JOIN'
    };
    
    this.send(`/app/chat.addUser/${roomId}`, message);
  }

  // Send a chat message
  sendChatMessage(roomId, senderId, content) {
    const message = {
      senderId,
      content,
      type: 'CHAT'
    };
    
    return this.send(`/app/chat.sendMessage/${roomId}`, message);
  }

  // Mark messages as read
  markAsRead(roomId, userId) {
    const message = {
      userId,
      type: 'READ'
    };
    
    this.send(`/app/chat.markAsRead/${roomId}`, message);
  }

  // Subscribe to room messages
  subscribeToRoom(roomId, onMessage) {
    return this.subscribe(`/topic/room/${roomId}`, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        onMessage(parsedMessage);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  }

  // Subscribe to user notifications
  subscribeToUserNotifications(userId, onNotification) {
    return this.subscribe(`/user/${userId}/queue/notifications`, (notification) => {
      try {
        const parsedNotification = JSON.parse(notification.body);
        onNotification(parsedNotification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;