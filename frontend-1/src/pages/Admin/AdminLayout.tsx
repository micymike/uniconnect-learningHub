import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

interface User {
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
  fullName?: string;
  email?: string;
  role?: string;
}

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
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

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

  const isActive = (path: string) => {
    if (path === "") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.includes(`/admin/${path}`);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-gray-800">
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
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative lg:h-screen border-r border-gray-800`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <i className="bx bx-shield-check text-2xl text-white"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">UniConnect</h2>
              <p className="text-orange-100 text-sm">Admin Portal</p>
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
              <p className="text-gray-400 text-xs capitalize">{userRole}</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-8">
            <div className="text-xs uppercase text-gray-400 mb-3 pl-1 tracking-wider font-semibold flex items-center">
              <i className="bx bx-cog mr-1 text-orange-500"></i>
              Admin Controls
            </div>
            <ul className="space-y-2">
              {adminNavItems.map((item, index) => (
                <li key={item.path} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <NavLink
                    to={item.path}
                    end={item.path === ""}
                    className={({ isActive }) => 
                      `flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 text-left group relative overflow-hidden ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                          : "hover:bg-gray-800 text-gray-300 hover:text-white hover:transform hover:scale-105"
                      }`
                    }
                    onClick={() => setOpen(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <i className={`${item.icon} text-xl mr-3 transition-transform duration-300 group-hover:scale-110`}></i>
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <div className="absolute right-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-black">
          <button
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center group shadow-lg mb-4"
            onClick={handleLogout}
          >
            <i className="bx bx-log-out mr-2 text-lg group-hover:animate-bounce"></i>
            Logout
          </button>
          <div className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} UniConnect
          </div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Dynamic Content Section */}
        <main className="flex-1 px-8 py-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}