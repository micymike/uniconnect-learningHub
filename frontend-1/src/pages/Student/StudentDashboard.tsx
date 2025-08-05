// src/pages/student/DashboardHome.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Course = {
  _id?: string;
  title: string;
  description: string;
};

const API_URL = "http://localhost:3004/api";

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    <>
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
                onClick={() => navigate(`/student/courses/${course._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}