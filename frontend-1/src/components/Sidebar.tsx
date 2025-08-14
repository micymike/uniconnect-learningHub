import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const navItems = [
  { label: "Dashboard", path: "dashboard", icon: "bx bx-home" },
  { label: "Courses", path: "courses", icon: "bx bx-book" },
  { label: "Settings", path: "settings", icon: "bx bx-cog" },
  { label: "Help", path: "help", icon: "bx bx-help-circle" },
  { label: "Feedback", path: "feedback", icon: "bx bx-message-detail" },
];


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-orange-400 p-2 rounded shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="Open sidebar"
      >
        <i className="bx bx-menu text-2xl"></i>
      </button>
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white fixed top-0 left-0 h-full w-64 z-40 flex flex-col shadow-lg transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:h-screen`}
      >
        <div className="p-6 text-2xl font-bold text-orange-400 border-b border-gray-800">
          Student Panel
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  className="flex items-center w-full px-3 py-2 rounded hover:bg-gray-800 transition text-left"
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                >
                  <i className={`${item.icon} text-xl mr-3`}></i>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <div className="text-xs uppercase text-gray-400 mb-2 pl-1 tracking-wider">
              AI Tools
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded transition text-left ${
                    location.pathname === "/student/study-assistant"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-800 text-gray-800"
                  }`}
                  onClick={() => {
                    navigate("/student/study-assistant");
                    setOpen(false);
                  }}
                >
                  <i className="bx bx-brain text-xl mr-3"></i>
                  <span>Study Assistant</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded transition text-left ${
                    location.pathname === "/student/chatbot"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-800 text-gray-800"
                  }`}
                  onClick={() => {
                    navigate("/student/chatbot");
                    setOpen(false);
                  }}
                >
                  <i className="bx bx-message-dots text-xl mr-3"></i>
                  <span>Study Buddy</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded transition text-left ${
                    location.pathname === "/student/flashcards"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-800 text-gray-800"
                  }`}
                  onClick={() => {
                    navigate("/student/flashcards");
                    setOpen(false);
                  }}
                >
                  <i className="bx bx-collection text-xl mr-3"></i>
                  <span>Flashcard Generator</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded transition text-left ${
                    location.pathname === "/student/mynotes"
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-800 text-gray-800"
                  }`}
                  onClick={() => {
                    navigate("/student/mynotes");
                    setOpen(false);
                  }}
                >
                  <i className="bx bx-notepad text-xl mr-3"></i>
                  <span>My Notes</span>
                </button>
              </li>
            </ul>
          </div>
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
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}
