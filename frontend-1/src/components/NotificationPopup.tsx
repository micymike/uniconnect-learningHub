import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

interface NotificationPopup {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface NotificationPopupProps {
  userId: string | null;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<NotificationPopup[]>([]);
  const { socket } = useSocket(userId);

  useEffect(() => {
    if (!socket || !userId) return;

    // Listen for real-time notifications
    socket.on('new-notification', (data: any) => {
      const popup: NotificationPopup = {
        id: data.id || Date.now().toString(),
        title: data.title || 'New Notification',
        message: data.message || '',
        type: data.priority === 'urgent' ? 'error' : data.priority === 'high' ? 'warning' : 'info',
        duration: data.priority === 'urgent' ? 0 : 5000 // Urgent notifications don't auto-dismiss
      };
      
      setNotifications(prev => [...prev, popup]);
    });

    socket.on('study-partner-request', (data: any) => {
      const popup: NotificationPopup = {
        id: Date.now().toString(),
        title: '👥 New Study Partner Request',
        message: `${data?.requester?.full_name || data?.requester?.email || 'Someone'} wants to be your study partner!`,
        type: 'info',
        duration: 0 // Don't auto-dismiss
      };
      
      setNotifications(prev => [...prev, popup]);
    });

    socket.on('assignment-due-soon', (data: any) => {
      const popup: NotificationPopup = {
        id: Date.now().toString(),
        title: '⏰ Assignment Due Soon',
        message: `${data.title} is due in ${data.hours_remaining} hours!`,
        type: data.hours_remaining <= 2 ? 'error' : 'warning',
        duration: 0
      };
      
      setNotifications(prev => [...prev, popup]);
    });

    socket.on('study-session-starting', (data: any) => {
      const popup: NotificationPopup = {
        id: Date.now().toString(),
        title: '📚 Study Session Starting',
        message: `Your session with ${data.partner_name} is starting now!`,
        type: 'info',
        duration: 8000
      };
      
      setNotifications(prev => [...prev, popup]);
    });

    socket.on('achievement-unlocked', (data: any) => {
      const popup: NotificationPopup = {
        id: Date.now().toString(),
        title: '🏆 Achievement Unlocked!',
        message: data.message,
        type: 'success',
        duration: 6000
      };
      
      setNotifications(prev => [...prev, popup]);
    });

    return () => {
      socket.off('new-notification');
      socket.off('study-partner-request');
      socket.off('assignment-due-soon');
      socket.off('study-session-starting');
      socket.off('achievement-unlocked');
    };
  }, [socket, userId]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500 text-white';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500 text-white';
      case 'error':
        return 'bg-red-600 border-red-500 text-white';
      default:
        return 'bg-blue-600 border-blue-500 text-white';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border-l-4 shadow-lg animate-slide-in ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
            >
              <i className="bx bx-x text-lg"></i>
            </button>
          </div>
          {notification.type === 'info' && notification.title.includes('Study Partner') && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  window.location.href = '/student/notifications';
                  removeNotification(notification.id);
                }}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium transition-colors"
              >
                View Request
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;