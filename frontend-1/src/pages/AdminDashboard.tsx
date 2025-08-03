import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Extract full name from Supabase user_metadata
  const fullName = user?.user_metadata?.full_name || 
                  user?.fullName || 
                  user?.email || 
                  "Admin";

  // Extract role from user_metadata
  const userRole = user?.user_metadata?.role || 
                  user?.role || 
                  "admin";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col py-8 px-6 shadow-lg">
        <div className="text-2xl font-bold mb-8 tracking-tight text-orange-400">
          Admin Portal
        </div>
        <nav className="flex flex-col gap-4">
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 transition font-semibold"
            disabled
          >
            Dashboard
          </button>
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
            onClick={() => navigate("/admin/analytics")}
          >
            Analytics
          </button>
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
            onClick={() => navigate("/admin/courses")}
          >
            Manage Courses
          </button>
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
            onClick={() => navigate("/admin/quizzes")}
          >
            Manage Quizzes
          </button>
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
            onClick={() => navigate("/admin/lessons")}
          >
            Manage Lessons
          </button>
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </button>
        </nav>
        <div className="mt-auto pt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} UniConnect
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName
              )}&background=ff6600&color=fff`}
              alt="Admin Avatar"
              className="w-12 h-12 rounded-full border-2 border-orange-400"
            />
            <div>
              <div className="text-lg font-bold text-black">
                Welcome, {fullName}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {userRole}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow"
              onClick={() => navigate("/admin/courses")}
            >
              Manage Courses
            </button>
            <button
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium shadow"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Widgets */}
        <main className="flex-1 px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg p-6 flex flex-col items-center">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullName
              )}&background=fff&color=ff6600`}
              alt="Admin Avatar"
              className="w-20 h-20 rounded-full border-4 border-white mb-4"
            />
            <div className="text-xl font-bold text-white mb-1">
              {fullName}
            </div>
            <div className="text-white text-sm mb-2 capitalize">
              {userRole}
            </div>
            <div className="text-white text-xs">
              User ID: <span className="font-mono">{user.id || "N/A"}</span>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <div className="text-2xl font-bold text-orange-500 mb-4 text-center">
              Platform Stats
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Courses</span>
                <span className="text-3xl font-bold text-orange-500">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Quizzes</span>
                <span className="text-3xl font-bold text-orange-500">86</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Lessons</span>
                <span className="text-3xl font-bold text-orange-500">142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Students</span>
                <span className="text-3xl font-bold text-orange-500">1,284</span>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col">
            <div className="text-xl font-bold text-orange-400 mb-4 text-center">
              Quick Links
            </div>
            <button
              className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
              onClick={() => navigate("/admin/courses")}
            >
              Manage Courses
            </button>
            <button
              className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
              onClick={() => navigate("/admin/quizzes")}
            >
              Manage Quizzes
            </button>
            <button
              className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
              onClick={() => navigate("/admin/lessons")}
            >
              Manage Lessons
            </button>
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
              onClick={() => navigate("/admin/users")}
            >
              Manage Users
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}