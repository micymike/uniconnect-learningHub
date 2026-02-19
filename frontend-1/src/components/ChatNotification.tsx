import { useEffect } from "react";

export function requestNotificationPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        resolve("granted");
      } else if (Notification.permission === "denied") {
        resolve("denied");
      } else {
        Notification.requestPermission().then(resolve);
      }
    } else {
      resolve("denied");
    }
  });
}

const notificationSoundBase64 = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // Short beep

function playNotificationSound() {
  try {
    const audio = new window.Audio(notificationSoundBase64);
    audio.play();
  } catch (e) {
    // Fallback: ignore sound error
  }
}

import toast from "./Toast";

export async function showNotification(title: string, options?: NotificationOptions): Promise<Notification | null> {
  // Debug log
  console.log("[Notification] Attempting to show:", title, options);

  if ("Notification" in window) {
    if (Notification.permission !== "granted") {
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          toast({ message: title + (options?.body ? ": " + options.body : ""), onClose: () => {} });
          return null;
        }
      } catch {
        toast({ message: title + (options?.body ? ": " + options.body : ""), onClose: () => {} });
        return null;
      }
    }
    playNotificationSound();
    const notification = new Notification(title, {
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "uniconnect-notification",
      requireInteraction: false,
      silent: false,
      ...options
    });

    // Auto-close after 5 seconds if not requiring interaction
    if (!options?.requireInteraction) {
      setTimeout(() => notification.close(), 5000);
    }

    // If service worker is registered, also show push notification
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "show-notification",
        title,
        options: {
          icon: "/logo.png",
          badge: "/logo.png",
          ...options
        }
      });
    }

    return notification;
  }
  // Fallback: show toast
  toast({ message: title + (options?.body ? ": " + options.body : ""), onClose: () => {} });
  return null;
}

export async function showStudentNotification(
  type: 'assignment' | 'study_session' | 'achievement' | 'message' | 'reminder',
  data: any
) {
  // Debug log
  console.log("[Notification] showStudentNotification:", type, data);

  const notifications = {
    assignment: {
      title: `📚 Assignment: ${data.title}`,
      body: `Due ${data.dueDate}. ${data.description || 'Click to view details.'}`,
      requireInteraction: true,
      tag: 'assignment-due'
    },
    study_session: {
      title: `👥 Study Session with ${data.partnerName}`,
      body: `Starting ${data.startTime}. ${data.subject ? `Subject: ${data.subject}` : 'Click to join.'}`,
      requireInteraction: true,
      tag: 'study-session'
    },
    achievement: {
      title: `🏆 Achievement Unlocked!`,
      body: data.message || "You've reached a new milestone. Great work!",
      requireInteraction: false,
      tag: 'achievement'
    },
    message: {
      title: `💬 New message from ${data.senderName}`,
      body: data.preview || 'Click to read the message.',
      requireInteraction: false,
      tag: 'new-message'
    },
    reminder: {
      title: `⏰ Reminder: ${data.title}`,
      body: data.message || 'You have an upcoming task.',
      requireInteraction: true,
      tag: 'reminder'
    }
  };

  const config = notifications[type];
  if (config) {
    // Only pass actions to service worker, not Notification API
    const { actions, ...notificationOptions } = {
      body: config.body,
      requireInteraction: config.requireInteraction,
      tag: config.tag,
      ...data
    };
    return await showNotification(config.title, notificationOptions);
  }
  return null;
}



export function useStudentNotifications(socket: any, userId: string) {
  useEffect(() => {
    if (!socket || !userId) return;
    
    // Assignment reminders
    socket.on('assignment-due-soon', (data: any) => {
      showStudentNotification('assignment', {
        title: data.title,
        dueDate: new Date(data.due_date).toLocaleDateString(),
        description: `Due in ${data.hours_remaining} hours`
      });
    });
    
    // Study session notifications
    socket.on('study-session-starting', (data: any) => {
      showStudentNotification('study_session', {
        partnerName: data.partner_name,
        startTime: new Date(data.start_time).toLocaleTimeString(),
        subject: data.subject
      });
    });
    
    // Achievement notifications
    socket.on('achievement-unlocked', (data: any) => {
      showStudentNotification('achievement', {
        message: data.message
      });
    });
    
    // New message notifications
    socket.on('new-message', (data: any) => {
      showStudentNotification('message', {
        senderName: data.sender_name,
        preview: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '')
      });
    });
    
    return () => {
      socket.off('assignment-due-soon');
      socket.off('study-session-starting');
      socket.off('achievement-unlocked');
      socket.off('new-message');
    };
  }, [socket, userId]);
}
