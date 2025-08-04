import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";


const API_URL = "http://localhost:3004";
type Course = {
  _id?: string;
  title: string;
  description: string;
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

  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL + "/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || "Error");
      const data = await res.json();
      setCourses(data);
      setFiltered(data);
    } catch (err: any) {
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
      setForm({ title: course.title, description: course.description });
      setEditingId(course._id || null);
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
    setLoading(true);
    setError("");
    try {
      const method = modalMode === "edit" ? "PUT" : "POST";
      const endpoint = modalMode === "edit"
        ? `/courses/${editingId}`
        : "/courses";
      const res = await fetch(API_URL + endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Error");
      setToast({
        message: modalMode === "edit" ? "Course updated!" : "Course created!",
        type: "success",
      });
      closeModal();
      fetchCourses();
    } catch (err: any) {
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this course?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL + `/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).message || "Error");
      setToast({ message: "Course deleted!", type: "success" });
      fetchCourses();
    } catch (err: any) {
      setError(err.message);
      setToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col py-8 px-6 shadow-lg">
        <div className="text-2xl font-bold mb-8 tracking-tight text-orange-400">
          Admin Portal
        </div>
        <nav className="flex flex-col gap-4">
          <button
            className="text-left py-2 px-4 rounded hover:bg-gray-800 transition"
            onClick={() => navigate("/admin")}
          >
            Dashboard
          </button>
          <button
            className="text-left py-2 px-4 rounded bg-orange-500 hover:bg-orange-600 transition font-semibold"
            disabled
          >
            Manage Courses
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
          <h1 className="text-3xl font-bold text-black">Manage Courses</h1>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow"
            onClick={() => openModal("create")}
          >
            + New Course
          </button>
        </header>
        {/* Search Bar */}
        <div className="px-8 py-4 bg-gray-50 flex items-center">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full max-w-md p-3 rounded bg-white border border-gray-300 text-black shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Course Cards */}
        <main className="flex-1 px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 bg-gray-100">
          {loading ? (
            <div className="col-span-full text-center text-lg">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No courses found.
            </div>
          ) : (
            filtered.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-2xl transition group border border-gray-200"
              >
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2 text-orange-500 group-hover:text-orange-600 transition">
                    {course.title}
                  </h2>
                  <p className="text-gray-700 mb-4">{course.description}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                    onClick={() => openModal("edit", course)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                    onClick={() => handleDelete(course._id!)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-black text-2xl"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-black">
              {modalMode === "edit" ? "Edit Course" : "Create Course"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Course Title"
                className="w-full p-3 rounded bg-gray-100 border border-gray-300 text-black"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
              <textarea
                placeholder="Course Description"
                className="w-full p-3 rounded bg-gray-100 border border-gray-300 text-black"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 py-3 px-6 rounded font-semibold text-white w-full"
                disabled={loading}
              >
                {modalMode === "edit" ? "Update Course" : "Create Course"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
