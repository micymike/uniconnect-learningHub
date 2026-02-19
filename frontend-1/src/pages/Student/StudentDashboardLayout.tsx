// src/layouts/StudentDashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { requestNotificationPermission, useStudentNotifications } from "../../components/ChatNotification";
import NotificationPopup from "../../components/NotificationPopup";

export default function StudentDashboardLayout() {
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
    requestNotificationPermission();
  }, []);

  useStudentNotifications(socket, userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-72 min-h-screen">
        <main className="w-full min-h-screen overflow-auto">
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
      <NotificationPopup userId={userId} />
    </div>
  );
}
