import React from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";

const adminNavItems = [
  { label: "Dashboard", path: "", icon: "bx bx-home" },
  { label: "Analytics", path: "analytics", icon: "bx bx-line-chart" },
  { label: "Manage Courses", path: "courses", icon: "bx bx-book" },
  { label: "Manage Quizzes", path: "quizzes", icon: "bx bx-edit" },
  { label: "Manage Lessons", path: "lessons", icon: "bx bx-video" },
  { label: "Manage Users", path: "users", icon: "bx bx-user" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user?.user_metadata?.full_name || 
                  user?.fullName || 
                  user?.email || 
                  "Admin";
  const userRole = user?.user_metadata?.role || 
                  user?.role || 
                  "admin";

  const handleLogout = () => {
  localStorage.removeItem("token");       
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold text-orange-400 border-b border-gray-800">
          Admin Portal
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            {adminNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) => 
                    `flex items-center w-full px-3 py-2 rounded hover:bg-gray-800 transition text-left ${
                      isActive ? "bg-gray-800" : ""
                    }`
                  }
                >
                  <i className={`${item.icon} text-xl mr-3`}></i>
                  <span>{item.label}</span>
                </NavLink>
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
        <div className="p-4 text-xs text-gray-400 border-t border-gray-800">
          &copy; {new Date().getFullYear()} UniConnect
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow flex items-center px-8 py-4">
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
        </header>

        {/* Dynamic Content Section */}
        <main className="flex-1 px-8 py-6 bg-gradient-to-b from-gray-50 to-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}