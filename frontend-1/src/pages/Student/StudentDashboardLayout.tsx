// src/layouts/StudentDashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function StudentDashboardLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user?.user_metadata?.full_name || 
                  user?.fullName || 
                  user?.email || 
                  "Student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.full_name || "Student"
              )}&background=ff6600&color=fff`}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-orange-400"
            />
            <div>
              <div className="text-lg font-bold text-black">
                Welcome, {fullName}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {user.role || "student"}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-8 py-8 overflow-auto">
          <Outlet /> {/* Nested routes will render here */}
        </main>
      </div>
    </div>
  );
}