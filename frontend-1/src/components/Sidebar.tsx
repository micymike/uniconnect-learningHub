import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const navItems = [
  { label: "Dashboard", path: "dashboard", icon: "bx bx-home" },
  { label: "Courses", path: "courses", icon: "bx bx-book" }
];

const aiTools = [
  { label: "Study Buddy", path: "/student/chatbot", icon: "bx bx-message-dots" },
//  { label: "Study Chat", path: "/student/study-chat", icon: "bx bx-chat" },
  { label: "Flashcards", path: "/student/flashcards", icon: "bx bx-collection" },
  { label: "Task Scheduler", path: "/student/task-scheduler", icon: "bx bx-calendar-check" },
  { label: "My Notes", path: "/student/mynotes", icon: "bx bx-notepad" },
];


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.includes(path);
  };

  const fullName = user?.user_metadata?.full_name || user?.fullName || user?.email || "Student";

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 hover:bg-gray-800 text-orange-400 p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-110"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <i className={`bx ${open ? 'bx-x' : 'bx-menu'} text-xl transition-transform duration-300`}></i>
      </button>

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white fixed top-0 left-0 h-full w-72 z-40 flex flex-col shadow-2xl transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:fixed lg:h-screen border-r border-gray-800`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <i className="bx bx-graduation text-2xl text-white"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">UniConnect</h2>
              <p className="text-orange-100 text-sm">Learning Hub</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors duration-300">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ff6600&color=fff&size=40`}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-orange-400"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{fullName}</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role || "student"}</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Main Navigation */}
          <div className="mb-8">
            <div className="text-xs uppercase text-gray-400 mb-3 pl-1 tracking-wider font-semibold">
              Navigation
            </div>
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={item.path} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 text-left group relative overflow-hidden ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                        : "hover:bg-gray-800 text-gray-300 hover:text-white hover:transform hover:scale-105"
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                  >
                    <i className={`${item.icon} text-xl mr-3 transition-transform duration-300 group-hover:scale-110`}></i>
                    <span className="font-medium">{item.label}</span>
                    {isActive(item.path) && (
                      <div className="absolute right-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Tools Section */}
          <div>
            <div className="text-xs uppercase text-gray-400 mb-3 pl-1 tracking-wider font-semibold flex items-center">
              <i className="bx bx-brain mr-1 text-orange-500"></i>
              AI Tools
            </div>
            <ul className="space-y-2">
              {aiTools.map((tool, index) => (
                <li key={tool.path} className="animate-fade-in-up" style={{ animationDelay: `${(index + 5) * 50}ms` }}>
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 text-left group relative overflow-hidden ${
                      isActive(tool.path)
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                        : "hover:bg-gray-800 text-gray-300 hover:text-white hover:transform hover:scale-105"
                    }`}
                    onClick={() => {
                      navigate(tool.path);
                      setOpen(false);
                    }}
                  >
                    <i className={`${tool.icon} text-xl mr-3 transition-transform duration-300 group-hover:scale-110`}></i>
                    <span className="font-medium">{tool.label}</span>
                    {isActive(tool.path) && (
                      <div className="absolute right-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <button
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center group shadow-lg"
            onClick={handleLogout}
          >
            <i className="bx bx-log-out mr-2 text-lg group-hover:animate-bounce"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
