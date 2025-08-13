import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user?.user_metadata?.full_name || 
                  user?.fullName || 
                  user?.email || 
                  "Admin";
  const userRole = user?.user_metadata?.role || 
                  user?.role || 
                  "admin";

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-8 w-full max-w-6xl">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              fullName
            )}&background=fff&color=ff6600`}
            alt="Admin Avatar"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white mb-4"
          />
          <div className="text-lg sm:text-xl font-bold text-white mb-1">
            {fullName}
          </div>
          <div className="text-white text-xs sm:text-sm mb-2 capitalize">
            {userRole}
          </div>
          <div className="text-white text-xs">
            User ID: <span className="font-mono">{user.id || "N/A"}</span>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col">
          <div className="text-lg sm:text-2xl font-bold text-orange-500 mb-4 text-center">
            Platform Stats
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-xs sm:text-base">Total Courses</span>
              <span className="text-xl sm:text-3xl font-bold text-orange-500">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-xs sm:text-base">Total Quizzes</span>
              <span className="text-xl sm:text-3xl font-bold text-orange-500">86</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-xs sm:text-base">Total Lessons</span>
              <span className="text-xl sm:text-3xl font-bold text-orange-500">142</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-xs sm:text-base">Total Students</span>
              <span className="text-xl sm:text-3xl font-bold text-orange-500">1,284</span>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 flex flex-col">
          <div className="text-lg sm:text-xl font-bold text-orange-400 mb-4 text-center">
            Quick Links
          </div>
          <button
            className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 rounded font-semibold transition text-xs sm:text-base"
            onClick={() => navigate("courses")}
          >
            Manage Courses
          </button>
          <button
            className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 rounded font-semibold transition text-xs sm:text-base"
            onClick={() => navigate("quizzes")}
          >
            Manage Quizzes
          </button>
          <button
            className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 rounded font-semibold transition text-xs sm:text-base"
            onClick={() => navigate("lessons")}
          >
            Manage Lessons
          </button>
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 rounded font-semibold transition text-xs sm:text-base"
            onClick={() => navigate("users")}
          >
            Manage Users
          </button>
        </div>
      </div>
    </div>
  );
}
