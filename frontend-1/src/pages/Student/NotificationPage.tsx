import React, { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket";
import { useStudentNotifications, requestNotificationPermission } from "../../components/ChatNotification";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend.onrender.com/api";

type NotificationType = 'study_partner_request' | 'assignment_due' | 'course_update' | 'study_session' | 'achievement' | 'message';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  metadata?: any;
};

type Request = {
  id: string;
  requester_id: string;
  status: string;
  created_at: string;
  requester: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
};

export default function NotificationPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/users/partner-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // Get current user id from localStorage
  const userId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id;
    } catch {
      return null;
    }
  })();

  const { socket } = useSocket(userId);

  useEffect(() => {
    fetchRequests();
    fetchNotifications();
    requestNotificationPermission();
  }, []);

  // Listen for real-time study-partner-request events
  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      // Only add if not already present
      setRequests((prev) => {
        if (prev.some((r) => r.id === data.id)) return prev;
        return [{ ...data }, ...prev];
      });
    };
    socket.on("study-partner-request", handler);
    return () => {
      socket.off("study-partner-request", handler);
    };
  }, [socket]);

  // Enhanced browser notifications
  useStudentNotifications(socket, userId);
  // TODO: If you want to handle "assignment-reminder" with custom logic, extend useStudentNotifications in ChatNotification.tsx.

  const handleRespond = async (requestId: string, action: "accept" | "decline") => {
    setActionLoading(requestId + action);
    setError("");
    setSuccess(null);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/users/respond-partner-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to respond to request");
      } else {
        setSuccess(
          action === "accept"
            ? "Study partner request accepted! You can now interact."
            : "Request declined."
        );
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (err: any) {
      setError(err.message || "Failed to respond to request");
    } finally {
      setActionLoading(null);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'assignment_due': return 'bx-time-five';
      case 'course_update': return 'bx-book-open';
      case 'study_session': return 'bx-group';
      case 'achievement': return 'bx-trophy';
      case 'message': return 'bx-message';
      default: return 'bx-bell';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-blue-400 bg-blue-900/20';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'high') return n.priority === 'high' || n.priority === 'urgent';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 px-2 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <i className="bx bx-bell text-orange-400"></i>
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-orange-400 hover:text-orange-300 text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow flex items-center gap-2">
            <i className="bx bx-check-circle"></i>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow flex items-center gap-2">
            <i className="bx bx-error-circle"></i>
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="bx bx-bell"></i>
            Notifications
            {unreadCount > 0 && activeTab !== 'notifications' && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="bx bx-user-plus"></i>
            Partner Requests
            {requests.length > 0 && activeTab !== 'requests' && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'notifications' && (
          <>
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }, { key: 'high', label: 'High Priority' }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="text-gray-400 text-center py-8">
                  <i className="bx bx-loader-alt animate-spin text-2xl mb-2"></i>
                  <p>Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  <i className="bx bx-bell-off text-4xl mb-2"></i>
                  <p>No notifications to show</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-800 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-gray-800/50' : ''
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.action_url) {
                          window.location.href = notification.action_url;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                          <i className={`bx ${getNotificationIcon(notification.type)} text-lg`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.priority === 'urgent' ? 'bg-red-600 text-white' :
                                notification.priority === 'high' ? 'bg-orange-600 text-white' :
                                notification.priority === 'medium' ? 'bg-yellow-600 text-black' :
                                'bg-gray-600 text-gray-300'
                              }`}>
                                {notification.priority.toUpperCase()}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            {notification.action_url && (
                              <span className="text-orange-400 text-xs flex items-center gap-1">
                                Click to view <i className="bx bx-right-arrow-alt"></i>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6">
            {loading ? (
              <div className="text-gray-400 text-center py-8">
                <i className="bx bx-loader-alt animate-spin text-2xl mb-2"></i>
                <p>Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <i className="bx bx-user-plus text-4xl mb-2"></i>
                <p>No pending study partner requests</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {requests.map((req) => (
                  <li key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3">
                    <div className="flex items-center gap-3">
                      {req.requester.avatar_url ? (
                        <img
                          src={req.requester.avatar_url}
                          alt={req.requester.full_name || req.requester.email}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                          {(req.requester.full_name || req.requester.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white text-lg">{req.requester.full_name || req.requester.email}</div>
                        <div className="text-gray-400 text-sm">{req.requester.email}</div>
                        <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                          <i className="bx bx-time"></i>
                          Requested {new Date(req.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 sm:mt-0">
                      <button
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl ${
                          actionLoading === req.id + "accept" ? "opacity-60 cursor-wait" : ""
                        }`}
                        disabled={actionLoading === req.id + "accept"}
                        onClick={() => handleRespond(req.id, "accept")}
                      >
                        {actionLoading === req.id + "accept" ? (
                          <i className="bx bx-loader-alt animate-spin"></i>
                        ) : (
                          <i className="bx bx-check"></i>
                        )}
                        {actionLoading === req.id + "accept" ? "Accepting..." : "Accept"}
                      </button>
                      <button
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl ${
                          actionLoading === req.id + "decline" ? "opacity-60 cursor-wait" : ""
                        }`}
                        disabled={actionLoading === req.id + "decline"}
                        onClick={() => handleRespond(req.id, "decline")}
                      >
                        {actionLoading === req.id + "decline" ? (
                          <i className="bx bx-loader-alt animate-spin"></i>
                        ) : (
                          <i className="bx bx-x"></i>
                        )}
                        {actionLoading === req.id + "decline" ? "Declining..." : "Decline"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
