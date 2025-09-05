import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../hooks/useSocket';
import Toast from '../../components/Toast';
import 'boxicons/css/boxicons.min.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://uniconnect-learninghub-backend.onrender.com/api';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
}

interface UserMetadata {
  full_name: string;
  avatar_url?: string | null;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface StudyMate {
  id: string;
  user: {
    id: string;
    email: string;
    user_metadata: UserMetadata;
  };
  is_online: boolean;
  last_seen: Date | null;
  is_typing: boolean;
}

interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
}

interface StudyChatProps {
  partnerId?: string;
}

const StudyChat: React.FC<StudyChatProps> = ({ partnerId }) => {
  const [user, setUser] = useState<any>(null);
  const { socket, isConnected } = useSocket(user?.id);
  const [studyMates, setStudyMates] = useState<StudyMate[]>([]);
  const [selectedMate, setSelectedMate] = useState<StudyMate | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Filter messages for the current conversation
  const filteredMessages = selectedMate && user?.id 
    ? messages.filter(message => 
        (message.senderId === user.id && message.receiverId === selectedMate.user.id) ||
        (message.senderId === selectedMate.user.id && message.receiverId === user.id)
      )
    : [];

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.on('newMessage', (message: Message) => {
      console.log('Received new message:', message);
      console.log('message.senderId:', message.senderId, 'message.receiverId:', message.receiverId);

      // Only add the message if it is for the currently selected conversation
      if (
        selectedMate &&
        user?.id &&
        (
          (message.senderId === user.id && message.receiverId === selectedMate.user.id) ||
          (message.senderId === selectedMate.user.id && message.receiverId === user.id)
        )
      ) {
        setMessages(prev => {
          // Remove any temporary message with same content and sender
          const withoutTemp = prev.filter(m => 
            !(m.id.startsWith('temp-') && 
              m.senderId === message.senderId && 
              m.content === message.content)
          );
          
          // Check if real message already exists
          const exists = withoutTemp.some(m => m.id === message.id);
          if (exists) return withoutTemp;
          
          // Add the real message
          return [...withoutTemp, {
            ...message,
            timestamp: new Date(message.timestamp)
          }];
        });
      }
    });

    socket.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    socket.on('messageEdited', (message: Message) => {
      setMessages(prev => prev.map(m => m.id === message.id ? message : m));
    });

    socket.on('messageDeleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageEdited');
      socket.off('messageDeleted');
    };
  }, [socket, user?.id, studyMates, selectedMate]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  // Always clear and reload messages when partnerId changes
  useEffect(() => {
    if (partnerId) {
      loadStudyMates().then(() => {
        const partner = studyMates.find(mate => mate.user.id === partnerId);
        if (partner) {
          setSelectedMate(partner);
          setMessages([]); // Clear messages before loading new ones
          loadMessages(partner.user.id);
        }
      });
    } else {
      loadStudyMates();
      setSelectedMate(null);
      setMessages([]);
    }
  }, [partnerId]);

  const loadStudyMates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/users/study-partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      // The endpoint returns { partners: [...] }
      setStudyMates(
        Array.isArray(data.partners)
          ? data.partners.map((partner: any) => ({
              id: partner.id,
              user: {
                id: partner.id,
                email: partner.email,
                user_metadata: {
                  full_name: partner.full_name || partner.email,
                  avatar_url: partner.avatar_url || null,
                  role: partner.role || 'user',
                  created_at: partner.created_at,
                  updated_at: partner.updated_at
                }
              },
              is_online: partner.is_online ?? false,
              last_seen: partner.last_seen ? new Date(partner.last_seen) : null,
              is_typing: false
            }))
          : []
      );
    } catch (error) {
      console.error('Error loading study partners:', error);
    }
  };

  const loadMessages = async (mateId: string) => {
    setMessagesLoading(true);
    try {
      if (!mateId) {
        setMessagesLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/messages/${mateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setToast({ type: 'error', message: `Failed to load messages (${response.status}): ${response.statusText}` });
        setMessagesLoading(false);
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        setToast({ type: 'error', message: 'Invalid response format from server.' });
        setMessagesLoading(false);
        return;
      }
      
      // Convert timestamps and merge with existing messages
      const newMessages = data.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      setMessages(prev => {
        // Remove existing messages for this conversation
        const otherMessages = prev.filter(m => 
          !((m.senderId === user?.id && m.receiverId === mateId) ||
            (m.senderId === mateId && m.receiverId === user?.id))
        );
        // Add the loaded messages
        return [...otherMessages, ...newMessages];
      });
    } catch (error: any) {
      setToast({ type: 'error', message: `Error loading messages: ${error?.message || 'Unknown error'}` });
      console.error('Error loading messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = () => {
    if (!user || !user.id) {
      setToast({ type: 'error', message: 'User not loaded. Please log in again.' });
      return;
    }
    if (!selectedMate) {
      setToast({ type: 'error', message: 'No study mate selected.' });
      return;
    }
    if (!socket || !isConnected) {
      setToast({ type: 'error', message: 'Not connected to chat server.' });
      return;
    }
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    
    // Create temporary message for immediate UI update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedMate.user.id,
      content: messageContent,
      timestamp: new Date(),
      isEdited: false
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    
    // Send to server
    console.log('Sending message:', { senderId: user.id, receiverId: selectedMate.user.id, content: messageContent });
    socket.emit('sendMessage', {
      senderId: user.id,
      receiverId: selectedMate.user.id,
      content: messageContent
    });

    setNewMessage('');
    stopTyping();
  };

  const handleTyping = () => {
    if (!selectedMate || !socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        senderId: user.id,
        receiverId: selectedMate.user.id,
        isTyping: true
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && selectedMate && socket) {
      setIsTyping(false);
      socket.emit('typing', {
        senderId: user.id,
        receiverId: selectedMate.user.id,
        isTyping: false
      });
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/search-users?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSearchResults(data.map((item: any) => item.user));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const addStudyMate = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/chat/study-mates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studyMateId: userId })
      });
      loadStudyMates();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding study mate:', error);
    }
  };

  const editMessage = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const saveEdit = () => {
    if (!editingMessage || !socket) return;

    socket.emit('editMessage', {
      messageId: editingMessage,
      userId: user.id,
      content: editContent
    });

    setEditingMessage(null);
    setEditContent('');
  };

  const deleteMessage = (messageId: string) => {
    if (!socket || !selectedMate) return;

    socket.emit('deleteMessage', {
      messageId,
      userId: user.id,
      receiverId: selectedMate.user.id
    });
  };

  const selectMate = (mate: StudyMate) => {
    if (!mate?.user?.id) {
      setSelectedMate(null);
      setMessages([]);
      return;
    }
    setSelectedMate(mate);
    setMessages([]); // Clear messages before loading new ones
    loadMessages(mate.user.id);
  };

  const canEditMessage = (message: Message) => {
    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    return message.senderId === user?.id && diffMinutes <= 15;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-row relative">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar toggle button for mobile */}
      <button
        className="fixed bottom-6 right-6 z-30 bg-orange-500 text-white rounded-full p-4 shadow-lg sm:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Study Partners"
      >
        <i className="bx bx-group text-2xl"></i>
      </button>

      {/* Chat Area */}
      <div className="flex flex-col h-full w-full relative">
        {selectedMate ? (
          <>
            {/* Chat Header - Sticky at top */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 left-0 right-0 z-20">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-black font-bold">
                  {selectedMate.user.user_metadata.full_name
                    ? selectedMate.user.user_metadata.full_name[0].toUpperCase()
                    : selectedMate.user.email[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white font-semibold text-lg">
                    {selectedMate.user.user_metadata.full_name || selectedMate.user.email}
                  </h2>
                  <span className={`text-sm ${
                    selectedMate.is_online ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {selectedMate.is_online ? 'Online' : 'Offline'}
                    {typingUsers.has(selectedMate.user.id) && ' • typing...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto overflow-x-hidden">
              {messagesLoading ? (
                <div className="text-center text-gray-400 mt-8">
                  <p>Loading messages...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-lg break-words ${
                        message.senderId === user?.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-700 text-white'
                      }`}>
                        {editingMessage === message.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-transparent border-b border-gray-300 focus:outline-none"
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={saveEdit}
                                className="text-xs bg-green-500 px-2 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMessage(null)}
                                className="text-xs bg-gray-500 px-2 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                                {message.isEdited && ' (edited)'}
                              </span>
                              {message.senderId === user?.id && (
                                <div className="flex space-x-1">
                                  {canEditMessage(message) && (
                                    <button
                                      onClick={() => editMessage(message.id, message.content)}
                                      className="text-xs opacity-70 hover:opacity-100"
                                    >
                                      <i className="bx bx-edit"></i>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="text-xs opacity-70 hover:opacity-100"
                                  >
                                    <i className="bx bx-trash"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input - Sticky at bottom */}
            <div className="bg-gray-800 border-t border-gray-700 p-3 sm:p-4 sticky bottom-0 left-0 right-0 z-10">
              <div className="flex space-x-2 sm:space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors flex-shrink-0"
                >
                  <i className="bx bx-send text-sm sm:text-base"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="text-center text-gray-400">
              <i className="bx bx-message-dots text-4xl sm:text-6xl mb-4"></i>
              <p className="text-lg sm:text-xl">Select a study mate to start chatting</p>
            </div>
          </div>
        )}
      </div>
      {/* Sidebar - Study Partners (Right Side) */}
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden sm:flex w-64 h-full bg-gray-900 border-l border-gray-800 flex-col items-center py-4 overflow-y-auto">
        <h3 className="text-white text-lg font-bold mb-4">Study Partners</h3>
        <div className="flex-1 w-full">
          {studyMates.length === 0 ? (
            <div className="text-gray-400 text-center mt-8">No study partners</div>
          ) : (
            <ul className="space-y-2 w-full">
              {studyMates.map((mate) => (
                <li
                  key={mate.id}
                  className={`flex items-center px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMate?.id === mate.id
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                  onClick={() => selectMate(mate)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-black font-bold mr-2">
                    {mate.user.user_metadata.full_name
                      ? mate.user.user_metadata.full_name[0].toUpperCase()
                      : mate.user.email[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm truncate">
                      {mate.user.user_metadata.full_name ||
                        mate.user.email}
                    </span>
                    <span className="text-xs text-gray-400">
                      {mate.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative ml-auto w-64 h-full bg-gray-900 border-l border-gray-800 flex flex-col items-center py-4 overflow-y-auto z-50">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close"
            >
              <i className="bx bx-x"></i>
            </button>
            <h3 className="text-white text-lg font-bold mb-4 mt-6">Study Partners</h3>
            <div className="flex-1 w-full">
              {studyMates.length === 0 ? (
                <div className="text-gray-400 text-center mt-8">No study partners</div>
              ) : (
                <ul className="space-y-2 w-full">
                  {studyMates.map((mate) => (
                    <li
                      key={mate.id}
                      className={`flex items-center px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                        selectedMate?.id === mate.id
                          ? "bg-orange-500 text-white"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        selectMate(mate);
                        setSidebarOpen(false);
                      }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-black font-bold mr-2">
                        {mate.user.user_metadata.full_name
                          ? mate.user.user_metadata.full_name[0].toUpperCase()
                          : mate.user.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-sm truncate">
                          {mate.user.user_metadata.full_name ||
                            mate.user.email}
                        </span>
                        <span className="text-xs text-gray-400">
                          {mate.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyChat;
