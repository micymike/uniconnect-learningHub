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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          onClick={() => navigate("courses")}
        >
          Manage Courses
        </button>
        <button
          className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
          onClick={() => navigate("quizzes")}
        >
          Manage Quizzes
        </button>
        <button
          className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
          onClick={() => navigate("lessons")}
        >
          Manage Lessons
        </button>
        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition"
          onClick={() => navigate("users")}
        >
          Manage Users
        </button>
      </div>
    </div>
  );
}