import React from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

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

  const stats = [
    { label: "Total Courses", value: 24, icon: "bx bx-book", color: "text-orange-500" },
    { label: "Total Quizzes", value: 86, icon: "bx bx-question-mark", color: "text-green-500" },
    { label: "Total Lessons", value: 142, icon: "bx bx-play-circle", color: "text-blue-500" },
    { label: "Total Students", value: 1284, icon: "bx bx-user", color: "text-purple-500" }
  ];

  const managementCards = [
    { 
      title: "Course Management", 
      description: "Create, edit, and organize courses for students", 
      icon: "bx bx-book-open", 
      path: "courses",
      color: "text-orange-500"
    },
    { 
      title: "Quiz Management", 
      description: "Design and manage quizzes for course assessments", 
      icon: "bx bx-help-circle", 
      path: "quizzes",
      color: "text-green-500"
    },
    { 
      title: "Lesson Management", 
      description: "Structure and organize lesson content and materials", 
      icon: "bx bx-video", 
      path: "lessons",
      color: "text-blue-500"
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, <span className="text-orange-500">{fullName.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-gray-400 text-lg">Ready to manage your learning platform?</p>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="bx bx-user-circle text-orange-500 mr-2"></i>
          Admin Profile
        </h2>
        <div className="flex items-center space-x-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              fullName
            )}&background=ff6600&color=fff&size=80`}
            alt="Admin Avatar"
            className="w-16 h-16 rounded-full border-4 border-orange-500"
          />
          <div>
            <div className="text-lg font-bold text-white mb-1">{fullName}</div>
            <div className="text-orange-500 text-sm font-semibold capitalize mb-1">{userRole}</div>
            <div className="text-gray-400 text-xs">
              User ID: <span className="font-mono text-gray-300">{user.id || "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <i className={`${stat.icon} text-2xl ${stat.color}`}></i>
              <span className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Overview */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 animate-fade-in-up animation-delay-300">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="bx bx-trending-up text-orange-500 mr-2"></i>
          Platform Overview
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Platform Growth</span>
              <span className="text-orange-500 font-semibold">+24%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">89</div>
              <div className="text-gray-400 text-sm">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">15</div>
              <div className="text-gray-400 text-sm">New This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">95%</div>
              <div className="text-gray-400 text-sm">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Tools */}
      <div className="animate-fade-in-up animation-delay-600">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <i className="bx bx-cog text-orange-500 mr-2"></i>
          Management Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {managementCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group animate-fade-in-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
                  <i className={`${card.icon} text-2xl ${card.color}`}></i>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Status</div>
                  <div className="text-sm font-semibold text-green-500">Active</div>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                {card.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {card.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <i className="bx bx-shield-check mr-1"></i>
                  <span>Admin Access</span>
                </div>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 flex items-center"
                  onClick={() => navigate(card.path)}
                >
                  <span>Manage</span>
                  <i className="bx bx-right-arrow-alt ml-1"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 animate-fade-in-up animation-delay-900">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="bx bx-zap text-orange-500 mr-2"></i>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Analytics", icon: "bx bx-bar-chart-alt-2", path: "/admin/analytics" },
            { label: "Reports", icon: "bx bx-file-blank", path: "/admin/reports" },
            { label: "Settings", icon: "bx bx-cog", path: "/admin/settings" },
            { label: "Support", icon: "bx bx-support", path: "/admin/support" }
          ].map((action, index) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 group"
            >
              <i className={`${action.icon} text-2xl text-orange-500 mb-2 block group-hover:animate-bounce`}></i>
              <span className="text-white text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}