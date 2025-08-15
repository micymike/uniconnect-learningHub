import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL;
type Course = {
  id?: string;  // Changed from _id to id to match backend
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
};

// Toast Component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-orange-500",
  }[type];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-4 rounded-xl shadow-xl flex items-center space-x-4 z-50`}
    >
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-xl"
      >
        &times;
      </button>
    </motion.div>
  );
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check for token and redirect if not found
  const token = localStorage.getItem("token");
  
  // Add token debugging
  useEffect(() => {
    console.log("Current token:", token ? `${token.substring(0, 20)}...` : "No token");
    if (token) {
      try {
        // Try to decode JWT payload (without verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token payload:", payload);
        console.log("Token expires:", new Date(payload.exp * 1000));
        console.log("Current time:", new Date());
      } catch (e) {
        console.error("Invalid token format:", e);
      }
    }
  }, [token]);
  
  useEffect(() => {
    if (!token) {
      setToast({ message: "Please log in to access this page", type: "error" });
      navigate("/login"); // Adjust the login route as needed
      return;
    }
  }, [token, navigate]);

  const fetchCourses = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    try {
      console.log("Fetching courses with token:", token ? "Token present" : "No token"); // Debug log
      
      const res = await fetch(API_URL + "/courses", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      console.log("Fetch courses response status:", res.status); // Debug log
      
      if (res.status === 401) {
        console.error("401 Unauthorized when fetching courses");
        setToast({ message: "Session expired. Please log in again.", type: "error" });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      if (res.status === 403) {
        console.error("403 Forbidden when fetching courses");
        setToast({ message: "You don't have permission to view courses.", type: "error" });
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Network error" }));
        throw new Error(errorData.message || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Fetched courses:", data); // Debug log
      setCourses(data);
      setFiltered(data);
    } catch (err: any) {
      console.error("Fetch courses error:", err);
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFiltered(
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, courses]);

  const openModal = (mode: "create" | "edit", course?: Course) => {
    setModalMode(mode);
    setShowModal(true);
    if (mode === "edit" && course) {
      console.log("Editing course:", course); // Debug log
      setForm({ title: course.title, description: course.description });
      setEditingId(course.id || null);  // Changed from course._id to course.id
    } else {
      setForm({ title: "", description: "" });
      setEditingId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ title: "", description: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setToast({ message: "Please log in to perform this action", type: "error" });
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const endpoint = modalMode === "edit"
        ? `/courses/${editingId}`
        : "/courses";
        
      console.log(`${method} request to:`, API_URL + endpoint);
      console.log("Form data:", form); // Debug log
      console.log("Token being sent:", token ? "Token present" : "No token"); // Debug log
      
      const res = await fetch(API_URL + endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      
      console.log("Response status:", res.status); // Debug log
      console.log("Response headers:", Object.fromEntries(res.headers.entries())); // Debug log
      
      
      if (res.ok) {
        // Success case
        setToast({
          message: modalMode === "edit" ? "Course updated!" : "Course created!",
          type: "success",
        });
        closeModal();
        fetchCourses();
        return;
      }
      
      // Only handle auth errors if the request actually failed
      if (res.status === 401) {
        const errorData = await res.json().catch(() => ({ message: "Unauthorized" }));
        console.error("Authentication error:", errorData);
        setToast({ message: "Session expired. Please log in again.", type: "error" });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      if (res.status === 403) {
        const errorData = await res.json().catch(() => ({ message: "Forbidden" }));
        console.error("Authorization error:", errorData);
        setToast({ message: "You don't have permission to perform this action.", type: "error" });
        return;
      }
      
      // Handle other errors
      const errorData = await res.json().catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || `Error: ${res.status}`);
      
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Validate ID before proceeding
    if (!id || id === 'undefined') {
      setToast({ message: "Invalid course ID", type: "error" });
      console.error("Invalid course ID:", id);
      return;
    }
    
    if (!token) {
      setToast({ message: "Please log in to perform this action", type: "error" });
      return;
    }
    
    if (!window.confirm("Delete this course?")) return;
    
    setLoading(true);
    setError("");
    try {
      console.log("Deleting course with ID:", id); // Debug log
      
      const res = await fetch(API_URL + `/courses/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.ok) {
        setToast({ message: "Course deleted!", type: "success" });
        fetchCourses();
        return;
      }
      
      // Only handle auth errors if request failed
      if (res.status === 401 || res.status === 403) {
        setToast({ message: "Session expired. Please log in again.", type: "error" });
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      const errorData = await res.json().catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || `Error: ${res.status}`);
      
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no token
  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-lg flex items-center justify-between px-8 py-6"
        >
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"
          >
            Manage Courses
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center space-x-2"
            onClick={() => openModal("create")}
          >
            <span>+ New Course</span>
          </motion.button>
        </motion.header>
        
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-8 py-6 bg-gradient-to-r from-white to-gray-50 flex items-center"
        >
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full p-4 pl-12 rounded-2xl bg-white border border-gray-200 text-black shadow-lg focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </motion.div>
        
        {/* Course Cards */}
        <main className="flex-1 px-8 py-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-t-4 border-orange-500 border-solid rounded-full"
              ></motion.div>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <div className="text-gray-500 text-xl mb-4">
                No courses found
              </div>
              <button
                onClick={() => openModal("create")}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Create your first course
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {filtered.map((course, index) => (
                <motion.div
                  key={course.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform transition-all duration-300"
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <motion.h2 
                          whileHover={{ color: "#f97316" }}
                          className="text-xl font-bold text-gray-800 mb-2"
                        >
                          {course.title}
                        </motion.h2>
                        <div className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                          ID: {course.id ? course.id.substring(0, 8) : 'N/A'}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6">{course.description}</p>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2.5 rounded-xl font-semibold transition-colors"
                        onClick={() => openModal("edit", course)}
                        disabled={!course.id}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => course.id && handleDelete(course.id)}
                        disabled={!course.id}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
      
      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative mx-4"
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {modalMode === "edit" ? "Edit Course" : "Create Course"}
                <div className="mt-2 w-16 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Course Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter course title"
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-black focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter course description"
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-black focus:ring-2 focus:ring-orange-300 focus:border-transparent min-h-[120px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-4 px-6 rounded-xl font-semibold text-white w-full shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                      Processing...
                    </span>
                  ) : modalMode === "edit" ? (
                    "Update Course"
                  ) : (
                    "Create Course"
                  )}
                </motion.button>
              </form>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
