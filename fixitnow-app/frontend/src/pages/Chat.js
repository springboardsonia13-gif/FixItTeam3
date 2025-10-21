import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import webSocketService from '../services/webSocketService';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { userId } = useParams(); // Get userId from URL parameter
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const roomSubscriptionRef = useRef(null);

  // Initialize WebSocket connection and load conversations
  useEffect(() => {
    if (!user) return;

    const initializeChat = async () => {
      try {
        // Connect to WebSocket
        await webSocketService.connect(
          () => {
            setConnected(true);
            toast.success('Connected to chat');
            
            // Subscribe to user notifications
            webSocketService.subscribeToUserNotifications(user.id, (notification) => {
              handleNewMessage(notification);
              toast.success('New message received');
            });
          },
          (error) => {
            setConnected(false);
            toast.error('Failed to connect to chat');
            console.error('WebSocket connection error:', error);
          }
        );

        // Load conversations
        const res = await apiService.getConversations(user.id);
        const loadedConversations = res.data;
        setConversations(loadedConversations);

        // Handle URL parameter - auto-select conversation with specific user
        if (userId) {
          console.log('Creating conversation for userId:', userId);
          console.log('Current user:', user);
          
          const existingConv = loadedConversations.find(conv => 
            conv.id === `${Math.min(user.id, parseInt(userId))}-${Math.max(user.id, parseInt(userId))}`
          );
          
          if (existingConv) {
            console.log('Found existing conversation:', existingConv);
            setSelectedConv(existingConv);
            toast.success('Conversation loaded!');
          } else {
            // Create a new conversation object for this user
            try {
              console.log('Fetching user profile for:', userId);
              const userResponse = await apiService.getUserProfile(userId);
              const otherUser = userResponse.data;
              console.log('Other user data:', otherUser);
              
              const conversationId = `${Math.min(user.id, parseInt(userId))}-${Math.max(user.id, parseInt(userId))}`;
              const newConversation = {
                id: conversationId,
                otherUserId: parseInt(userId),
                otherUserName: otherUser.name,
                lastMessageText: null,
                lastMessageTime: null,
                unreadCount: 0,
                lastMessageSender: null
              };
              
              console.log('Created new conversation:', newConversation);
              setSelectedConv(newConversation);
              toast.success(`Starting new conversation with ${otherUser.name}`);
            } catch (error) {
              console.error('Error creating conversation:', error);
              toast.error('Failed to start conversation');
            }
          }
        }
        // Handle navigation state (when coming from booking page)  
        else {
          const navigationState = location.state;
          if (navigationState?.selectedRoom) {
            const roomToSelect = navigationState.selectedRoom;
            setSelectedConv(roomToSelect);
            
            if (navigationState.fromBooking) {
              toast.success('Chat room opened for your booking!');
            }
          }
        }

      } catch (error) {
        setError('Failed to initialize chat.');
        console.error('Chat initialization error:', error);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (roomSubscriptionRef.current) {
        roomSubscriptionRef.current.unsubscribe();
      }
      webSocketService.disconnect();
    };
  }, [user, userId, location.state]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConv && user) {
      loadMessages();
      setupRoomSubscription();
      
      // Mark messages as read when entering room
      if (connected) {
        webSocketService.markAsRead(selectedConv.roomId || selectedConv.id, user.id);
      }
    }

    return () => {
      if (roomSubscriptionRef.current) {
        roomSubscriptionRef.current.unsubscribe();
        roomSubscriptionRef.current = null;
      }
    };
  }, [selectedConv, user, connected]);

  const loadMessages = async () => {
    if (!selectedConv) return;
    
    setLoading(true);
    try {
      const conversationId = selectedConv.id;
      const res = await apiService.getMessages(conversationId);
      setMessages(res.data);
    } catch (error) {
      setError('Failed to load messages.');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRoomSubscription = () => {
    if (!selectedConv || !connected) return;

    const conversationId = selectedConv.id;
    
    // Unsubscribe from previous conversation
    if (roomSubscriptionRef.current) {
      roomSubscriptionRef.current.unsubscribe();
    }

    // Subscribe to conversation updates
    roomSubscriptionRef.current = webSocketService.subscribe(`/topic/conversation/${conversationId}`, (message) => {
      const parsedMessage = JSON.parse(message.body);
      handleNewMessage(parsedMessage);
    });
  };

  const handleNewMessage = (message) => {
    // Only add message if it belongs to the current conversation
    const currentRoomId = selectedConv?.roomId || selectedConv?.id;
    if (message.roomId === currentRoomId) {
      setMessages(prevMessages => {
        // Check if message already exists to avoid duplicates
        const exists = prevMessages.some(msg => msg.id === message.id);
        if (!exists) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });

      // Mark as read if the message is from another user
      if (message.senderId !== user.id && connected) {
        setTimeout(() => {
          webSocketService.markAsRead(currentRoomId, user.id);
        }, 1000);
      }
    } else {
      // Update conversation list to show new message indicator
      setConversations(prev => prev.map(conv => {
        if ((conv.roomId || conv.id) === message.roomId) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: (conv.unreadCount || 0) + (message.senderId !== user.id ? 1 : 0)
          };
        }
        return conv;
      }));
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedConv || !user) return;
    
    const messageContent = newMsg.trim();
    setNewMsg(''); // Clear input immediately for better UX
    
    try {
      // Get the other user ID from conversation
      const [userId1, userId2] = selectedConv.id.split('-').map(id => parseInt(id));
      const receiverId = userId1 === user.id ? userId2 : userId1;
      
      // Send message via REST API (WebSocket will handle real-time updates)
      const msgData = {
        senderId: user.id,
        receiverId: receiverId,
        text: messageContent,
      };
      
      const response = await apiService.sendMessage(msgData);
      
      // Add message to local state immediately for better UX
      setMessages(prevMessages => [...prevMessages, response.data]);
      
    } catch (error) {
      setError('Failed to send message.');
      console.error('Send message error:', error);
      setNewMsg(messageContent); // Restore message content on error
      toast.error('Failed to send message');
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        
        {/* Connection Status */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-600' : 'bg-red-600'
          }`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      {error && <div className="mb-4 text-center text-red-500">{error}</div>}
      <div className="flex gap-6">
        <div className="w-1/3 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">Conversations</h2>
          <ul>
            {conversations.length === 0 && (
              <li className="text-gray-500 text-center py-8">
                No conversations found.
                <br />
                <span className="text-sm">Start chatting with a service provider!</span>
              </li>
            )}
            {conversations.map(conv => {
              const isSelected = selectedConv?.id === conv.id;
              const otherUserName = conv.otherUserName;
              const lastMessageText = conv.lastMessageText;
              const unreadCount = conv.unreadCount || 0;
              
              return (
                <li 
                  key={conv.id} 
                  className={`mb-2 p-3 rounded cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'
                  }`} 
                  onClick={() => setSelectedConv(conv)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{otherUserName}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {lastMessageText ? `${lastMessageText.slice(0, 40)}...` : 'No messages yet'}
                      </div>
                      {conv.lastMessageSender && (
                        <div className="text-xs text-gray-400">
                          Last message by {conv.lastMessageSender}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {conv.lastMessageTime && (
                        <div className="text-xs text-gray-500">
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      )}
                      {unreadCount > 0 && (
                        <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="w-2/3 bg-white shadow rounded-lg p-4 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="border-b pb-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConv.otherUserName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Conversation ID: {selectedConv.id}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-sm ${
                    connected ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      connected ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {connected ? 'Real-time' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: '400px' }}>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading messages...</div>
                ) : (
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isOwnMessage = msg.senderId === user.id;
                        const messageTime = msg.sentAt;
                        
                        return (
                          <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 text-gray-900'
                            }`}>
                              <div className="text-sm">{msg.text}</div>
                              <div className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                                {messageTime && new Date(messageTime).toLocaleString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {!msg.isRead && isOwnMessage && (
                                  <span className="ml-1">•</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={newMsg} 
                  onChange={e => setNewMsg(e.target.value)} 
                  placeholder={connected ? "Type a message..." : "Connecting..."}
                  disabled={loading || !connected} 
                />
                <button 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    loading || !connected || !newMsg.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  type="submit" 
                  disabled={loading || !connected || !newMsg.trim()}
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-gray-500 text-center mt-20">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the list to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;