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

const StudyChat: React.FC = () => {
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

    // Join rooms for all study mates when socket connects
    studyMates.forEach(mate => {
      socket.emit('joinRoom', {
        userId: user.id,
        otherUserId: mate.user.id
      });
    });

    socket.on('newMessage', (message: Message) => {
      console.log('Received new message:', message);
      console.log('message.senderId:', message.senderId, 'message.receiverId:', message.receiverId);
      
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        // Add message to the array - it will be filtered in render
        return [...prev, message];
      });
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

  useEffect(() => {
    loadStudyMates();
  }, []);

  const loadStudyMates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/available-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      // Map user_profiles rows to StudyMate shape for compatibility
setStudyMates(
  Array.isArray(data)
    ? data.map((profile: any) => ({
        id: profile.id,
        user: {
          id: profile.user?.id || profile.id,
          email: profile.user?.email || profile.email,
          user_metadata: profile.user?.user_metadata || {
            full_name:
              profile.full_name && profile.full_name.trim().length > 0
                ? profile.full_name
                : (profile.name || profile.username || profile.email),
            avatar_url: profile.avatar_url || null,
            role: profile.role || 'user',
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
        },
        is_online: profile.is_online ?? false,
        last_seen: profile.last_seen ? new Date(profile.last_seen) : null,
        is_typing: false
      }))
    : []
);
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const loadMessages = async (mateId: string) => {
    setMessagesLoading(true);
    try {
      if (!mateId) {
        setMessages([]);
        setMessagesLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/messages/${mateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        setMessages([]);
        setToast({ type: 'error', message: `Failed to load messages (${response.status}): ${response.statusText}` });
        setMessagesLoading(false);
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        setMessages([]);
        setToast({ type: 'error', message: 'Invalid response format from server.' });
        setMessagesLoading(false);
        return;
      }
      // Empty array is valid - it just means no messages yet
      setMessages(data);
    } catch (error: any) {
      setMessages([]);
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
    if (!socket) return;

    socket.emit('deleteMessage', {
      messageId,
      userId: user.id
    });
  };

  const selectMate = (mate: StudyMate) => {
    if (!mate?.user?.id) {
      setSelectedMate(null);
      setMessages([]);
      return;
    }
    setSelectedMate(mate);
    // Clear messages immediately to avoid showing wrong conversation
    setMessages([]);
    loadMessages(mate.user.id);
    if (socket && user?.id) {
      console.log('Joining room for users:', user.id, mate.user.id);
      socket.emit('joinRoom', {
        userId: user.id,
        otherUserId: mate.user.id
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col lg:flex-row">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {/* Sidebar */}
      <div className={`${selectedMate ? 'hidden lg:flex' : 'flex'} w-full max-w-full lg:max-w-xs lg:w-80 bg-gray-800 border-r border-gray-700 flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Study Chat</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          {/* Search */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={searchUsers}
                className="absolute right-2 top-2 text-gray-400 hover:text-orange-500"
              >
                <i className="bx bx-search"></i>
              </button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-gray-700 rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 hover:bg-gray-600 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata.full_name)}&background=ff6600&color=fff&size=32`}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-white text-sm">{user.user_metadata.full_name}</span>
                    </div>
                    <button
                      onClick={() => addStudyMate(user.id)}
                      className="text-orange-500 hover:text-orange-400"
                    >
                      <i className="bx bx-plus"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Study Mates List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-gray-400 text-sm font-semibold mb-3">Study Mates</h3>
          {studyMates.map((mate) => (
            <div
              key={mate.id}
              onClick={() => selectMate(mate)}
              className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                selectedMate?.id === mate.id ? 'bg-orange-500' : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={
                      mate.user.user_metadata.avatar_url
                        ? mate.user.user_metadata.avatar_url
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(mate.user.user_metadata.full_name)}&background=ff6600&color=fff&size=40`
                    }
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                    mate.is_online ? 'bg-green-400' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{mate.user.user_metadata.full_name}</p>
                  <p className="text-gray-400 text-xs">
                    {mate.is_online
                      ? 'Online'
                      : mate.last_seen
                        ? `Last seen ${formatTime(mate.last_seen)}`
                        : 'Last seen Unknown'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedMate ? 'flex' : 'hidden lg:flex'} flex-1 flex-col h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen`}>
        {selectedMate ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedMate(null)}
                  className="lg:hidden text-white hover:text-orange-500 mr-2"
                >
                  <i className="bx bx-arrow-back text-xl"></i>
                </button>
                <img
                  src={
                    selectedMate.user.user_metadata.avatar_url
                      ? selectedMate.user.user_metadata.avatar_url
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMate.user.user_metadata.full_name)}&background=ff6600&color=fff&size=40`
                  }
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="text-white font-semibold">{selectedMate.user.user_metadata.full_name}</h2>
                  <p className="text-gray-400 text-sm">
                    {selectedMate.is_online
                      ? 'Online'
                      : selectedMate.last_seen
                        ? `Last seen ${formatTime(selectedMate.last_seen)}`
                        : 'Last seen Unknown'}
                    {typingUsers.has(selectedMate.user.id) && ' • typing...'}
                    {' • '}{filteredMessages.length} messages
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden">
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
                      <div className={`w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
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

            {/* Message Input */}
            <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <i className="bx bx-send"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center text-gray-400">
              <i className="bx bx-message-dots text-6xl mb-4"></i>
              <p className="text-xl">Select a study mate to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyChat;
