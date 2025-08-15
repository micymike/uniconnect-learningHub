// src/layouts/StudentDashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function StudentDashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-72 min-h-screen">
        <main className="w-full min-h-screen overflow-auto">
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
    </div>
  );
}