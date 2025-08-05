import React from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css"; // Make sure this is loaded once globally

const navItems = [
  { label: "Dashboard", path: "dashboard", icon: "bx bx-home" },
  { label: "Courses", path: "courses", icon: "bx bx-book" },
  { label: "Profile", path: "profile", icon: "bx bx-user" },
  { label: "AI Assistant", path: "ai-demo", icon: "bx bx-bot" },
  { label: "Settings", path: "settings", icon: "bx bx-cog" },
  { label: "Help", path: "help", icon: "bx bx-help-circle" },
  { label: "Feedback", path: "feedback", icon: "bx bx-message-detail" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold text-orange-400 border-b border-gray-800">
        Student Panel
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                className="flex items-center w-full px-3 py-2 rounded hover:bg-gray-800 transition text-left"
                onClick={() => navigate(item.path)}
              >
                <i className={`${item.icon} text-xl mr-3`}></i>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
