import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

interface ChatNotificationProps {
  userId: string | null;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({ userId }) => {
  const { socket } = useSocket(userId);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newMessage', (message: any) => {
      // Only show notification if user is not in the chat with the sender
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/study-chat')) {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          message: `New message from ${message.senderName}`,
          timestamp: new Date()
        }]);

        // Auto remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== Date.now()));
        }, 5000);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [socket]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-up"
        >
          <div className="flex items-center space-x-2">
            <i className="bx bx-message-dots"></i>
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatNotification;