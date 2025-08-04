import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";


const API_URL = process.env.VITE_API_URL || "http://localhost:3004/api";

type Course = {
  _id?: string;
  title: string;
  description: string;
};

const user = JSON.parse(localStorage.getItem("user") || "{}");

export default function StudentDashboard() {

  const fullName = user?.user_metadata?.full_name || 
                user?.fullName || 
                user?.email || 
                "Student";

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    fetch(API_URL + "/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || "Error");
        return res.json();
      })
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.full_name || "Student"
              )}&background=ff6600&color=fff`}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-orange-400"
            />
            <div>
              <div className="text-lg font-bold text-black">
                Welcome, {fullName}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {user.role || "student"}
              </div>
            </div>
          </div>
        </header>
        {/* Courses Section */}
        <main className="flex-1 px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Available Courses</h1>
          {loading ? (
            <div className="text-white text-lg">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-300">No courses available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-lg p-6 flex flex-col hover:shadow-2xl transition group border border-gray-200"
                >
                  <h2 className="text-xl font-bold mb-2 text-orange-500 group-hover:text-orange-600 transition">
                    {course.title}
                  </h2>
                  <p className="text-gray-700 mb-4">{course.description}</p>
                  <button
                    className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold"
                    onClick={() => window.location.href = `/student/courses/${course._id}`}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
