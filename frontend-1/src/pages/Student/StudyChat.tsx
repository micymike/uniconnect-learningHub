import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../hooks/useSocket';
import Toast from '../../components/Toast';
import { fetchWithAuth } from '../../lib/utils';
import ReactMarkdown from 'react-markdown';
import 'boxicons/css/boxicons.min.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://uniconnect-learninghub-backend-yspz.onrender.com/api';

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
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const { socket, isConnected } = useSocket(user?.id);
  const [studyMates, setStudyMates] = useState<StudyMate[]>([]);
  const [selectedMate, setSelectedMate] = useState<StudyMate | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showMention, setShowMention] = useState(false);
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
        (message.senderId === selectedMate.user.id && message.receiverId === user.id) ||
        (message.senderId === 'ai' && message.receiverId === selectedMate.user.id)
      )
    : [];

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.on('newMessage', (message: Message) => {
      // Only add the message if it is for the currently selected conversation
      // Include AI messages (senderId: 'ai') in the conversation
      if (
        selectedMate &&
        user?.id &&
        (
          (message.senderId === user.id && message.receiverId === selectedMate.user.id) ||
          (message.senderId === selectedMate.user.id && message.receiverId === user.id) ||
          (message.senderId === 'ai' && message.receiverId === selectedMate.user.id)
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

        // Show enhanced browser notification for new messages
        if (
          message.senderId === selectedMate.user.id &&
          typeof window !== "undefined" &&
          (document.visibilityState !== "visible" || !document.hasFocus())
        ) {
          import('../../components/ChatNotification').then(({ showStudentNotification }) => {
            showStudentNotification('message', {
              senderName: selectedMate.user.user_metadata.full_name || selectedMate.user.email,
              preview: message.content
            });
          });
        }
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

  // Load partner data when partnerId changes
  useEffect(() => {
    if (partnerId && user?.id) {
      // Create a mock partner object for the selected partner
      const mockPartner: StudyMate = {
        id: partnerId,
        user: {
          id: partnerId,
          email: '',
          user_metadata: {
            full_name: 'Study Partner'
          }
        },
        is_online: false,
        last_seen: null,
        is_typing: false
      };
      setSelectedMate(mockPartner);
      setMessages([]);
      loadMessages(partnerId);
    } else {
      setSelectedMate(null);
      setMessages([]);
    }
  }, [partnerId, user?.id]);

  const loadStudyMates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth(`${API_BASE}/users/study-partners`, {
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
      const response = await fetchWithAuth(`${API_BASE}/chat/messages/${mateId}`, {
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

  const sendMessage = async () => {
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

    // Detect @studybuddy or @ai tag at the start
    const aiTagMatch = messageContent.match(/^@(?:studybuddy|ai|assistant)\s+/i);
    if (aiTagMatch) {
      // Remove the tag and get the question
      const question = messageContent.replace(/^@(?:studybuddy|ai|assistant)\s+/i, '').trim();
      if (!question) {
        setToast({ type: 'error', message: 'Please enter a question for the AI.' });
        return;
      }

      // Show AI typing indicator
      setAiIsTyping(true);

      setNewMessage('');
      stopTyping();

      // Add the user's question immediately with a specific timestamp
      const questionTimestamp = new Date();
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        senderId: user.id,
        receiverId: selectedMate.user.id,
        content: `@studybuddy ${question}`,
        timestamp: questionTimestamp,
        isEdited: false
      };
      setMessages(prev => [...prev, userMessage]);

      try {
        // Call AI API
        const token = localStorage.getItem('token');
        const aiRes = await fetchWithAuth(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message: question, context: { userId: user.id, partnerId: selectedMate.user.id } })
        });
        
        let aiAnswer = 'Sorry, I could not answer that.';
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          aiAnswer = aiData.reply || aiData.answer || aiData.response || aiAnswer;
        }

        // Add the AI response immediately with timestamp after question
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          senderId: 'ai',
          receiverId: selectedMate.user.id,
          content: aiAnswer,
          timestamp: new Date(questionTimestamp.getTime() + 1000), // 1 second after question
          isEdited: false
        };
        setMessages(prev => [...prev, aiMessage]);

        // Save both messages to database
        await saveMessageToDB({
          senderId: user.id,
          receiverId: selectedMate.user.id,
          content: `@studybuddy ${question}`,
          timestamp: questionTimestamp,
          isEdited: false
        });
        await saveMessageToDB({
          senderId: 'ai',
          receiverId: selectedMate.user.id,
          content: aiAnswer,
          timestamp: new Date(questionTimestamp.getTime() + 1000),
          isEdited: false
        });

        // Also emit to socket for other participants
        socket.emit('sendMessage', {
          senderId: user.id,
          receiverId: selectedMate.user.id,
          content: `@studybuddy ${question}`
        });
        socket.emit('sendMessage', {
          senderId: 'ai',
          receiverId: selectedMate.user.id,
          content: aiAnswer
        });
      } catch (err) {
        // Add error message as AI response
        const errorMessage: Message = {
          id: `ai-error-${Date.now()}`,
          senderId: 'ai',
          receiverId: selectedMate.user.id,
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(questionTimestamp.getTime() + 1000), // 1 second after question
          isEdited: false
        };
        setMessages(prev => [...prev, errorMessage]);
        setToast({ type: 'error', message: 'Failed to get AI response.' });
      } finally {
        setAiIsTyping(false);
      }
      return;
    }

    // Normal message flow
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId: selectedMate.user.id,
      content: messageContent,
      timestamp: new Date(),
      isEdited: false
    };

    setMessages(prev => [...prev, tempMessage]);

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
      const response = await fetchWithAuth(`${API_BASE}/chat/search-users?q=${searchQuery}`, {
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
      await fetchWithAuth(`${API_BASE}/chat/study-mates`, {
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

  const saveMessageToDB = async (message: Omit<Message, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      await fetchWithAuth(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          timestamp: message.timestamp.toISOString()
        })
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };

  // Helper: Group AI Q&A pairs
  const groupMessagesForDisplay = (messages: Message[]) => {
    const result: Array<{ question?: Message; ai?: Message; normal?: Message }> = [];
    let i = 0;
    while (i < messages.length) {
      const msg = messages[i];
      // Detect AI Q&A pair
      if (
        msg.senderId === user?.id &&
        msg.content.startsWith('@studybuddy')
      ) {
        // Look ahead for AI response
        const aiMsg = messages[i + 1];
        if (aiMsg && aiMsg.senderId === 'ai') {
          result.push({ question: msg, ai: aiMsg });
          i += 2;
          continue;
        }
        result.push({ question: msg });
        i += 1;
        continue;
      }
      // AI message not paired, show as normal
      if (msg.senderId === 'ai') {
        result.push({ ai: msg });
        i += 1;
        continue;
      }
      // Normal message
      result.push({ normal: msg });
      i += 1;
    }
    return result;
  };

  return (
    <div className="h-full bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {selectedMate ? (
        <>
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
                {groupMessagesForDisplay(filteredMessages).map((item, idx) => (
                  <React.Fragment key={item.question?.id || item.ai?.id || item.normal?.id || idx}>
                    {/* AI Q&A Pair */}
                    {item.question && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-lg break-words bg-orange-500 text-white">
                          <p>{item.question.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(item.question.timestamp)}
                              {item.question.isEdited && ' (edited)'}
                            </span>
                            {item.question.senderId === user?.id && (
                              <div className="flex space-x-1">
                                {canEditMessage(item.question) && (
                                  <button
                                    onClick={() => editMessage(item.question!.id, item.question!.content)}
                                    className="text-xs opacity-70 hover:opacity-100"
                                  >
                                    <i className="bx bx-edit"></i>
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteMessage(item.question!.id)}
                                  className="text-xs opacity-70 hover:opacity-100"
                                >
                                  <i className="bx bx-trash"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {item.ai && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-lg break-words bg-blue-600 text-white border-l-4 border-blue-400">
                          <div className="flex items-center mb-2">
                            <i className="bx bx-bot text-blue-300 mr-1"></i>
                            <span className="text-xs font-semibold text-blue-300">StudyBuddy AI</span>
                          </div>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{item.ai.content}</ReactMarkdown>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(item.ai.timestamp)}
                              {item.ai.isEdited && ' (edited)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Normal message */}
                    {item.normal && (
                      <div className={`flex ${item.normal.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-lg break-words ${
                          item.normal.senderId === user?.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 text-white'
                        }`}>
                          {editingMessage === item.normal.id ? (
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
                              <p>{item.normal.content}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-70">
                                  {formatTime(item.normal.timestamp)}
                                  {item.normal.isEdited && ' (edited)'}
                                </span>
                                {item.normal.senderId === user?.id && (
                                  <div className="flex space-x-1">
                                    {canEditMessage(item.normal) && (
                                      <button
                                        onClick={() => editMessage(item.normal!.id, item.normal!.content)}
                                        className="text-xs opacity-70 hover:opacity-100"
                                      >
                                        <i className="bx bx-edit"></i>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteMessage(item.normal!.id)}
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
                    )}
                  </React.Fragment>
                ))}
                {aiIsTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md px-3 py-2 rounded-lg bg-gray-700 text-white flex items-center space-x-2">
                      <span className="font-bold text-orange-400">@studybuddy</span>
                      <span className="animate-pulse">AI is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-gray-800 border-t border-gray-700 p-3 sm:p-4">
            <div className="flex space-x-2 sm:space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                    // Show mention if "@" is typed at start or after space
                    const val = e.target.value;
                    const cursor = e.target.selectionStart || 0;
                    if (
                      val[cursor - 1] === '@' &&
                      (cursor === 1 || val[cursor - 2] === ' ')
                    ) {
                      setShowMention(true);
                    } else if (!val.includes('@')) {
                      setShowMention(false);
                    }
                  }}
                  onKeyDown={e => {
                    if (showMention && (e.key === 'Enter' || e.key === 'Tab')) {
                      e.preventDefault();
                      setNewMessage(prev => prev.replace(/@$/, '@studybuddy '));
                      setShowMention(false);
                    } else if (e.key === 'Escape') {
                      setShowMention(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowMention(false), 100)}
                  onFocus={e => {
                    // Show mention if "@" is present at cursor
                    const val = e.target.value;
                    const cursor = e.target.selectionStart || 0;
                    if (
                      val[cursor - 1] === '@' &&
                      (cursor === 1 || val[cursor - 2] === ' ')
                    ) {
                      setShowMention(true);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="w-full max-w-2xl bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                />
                {showMention && (
                  <div className="absolute left-0 bottom-full mb-1 z-50 bg-gray-800 border border-orange-400 rounded shadow-lg w-56">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-orange-500 hover:text-white text-orange-400 font-semibold rounded transition-colors"
                      onMouseDown={e => {
                        e.preventDefault();
                        setNewMessage(prev => prev.replace(/@$/, '@studybuddy '));
                        setShowMention(false);
                      }}
                    >
                      <span className="font-bold">@studybuddy</span> <span className="text-xs text-gray-300">Ask the AI assistant</span>
                    </button>
                  </div>
                )}
              </div>
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
  );
};

export default StudyChat;
