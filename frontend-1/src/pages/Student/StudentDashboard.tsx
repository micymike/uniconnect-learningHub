import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Course = {
  _id?: string;
  title: string;
  description: string;
};

const API_URL = process.env.REACT_APP_API_URL;

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
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
        Available Courses
      </h1>
      {loading ? (
        <div className="text-white text-base sm:text-lg">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 px-3 py-2 sm:px-4 sm:py-2 rounded mb-4 text-xs sm:text-base">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-blue-100 text-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded mb-4 text-xs sm:text-base">
          No courses available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 w-full max-w-6xl">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col hover:shadow-2xl transition group border border-gray-200"
            >
              <h2 className="text-base sm:text-xl font-bold mb-2 text-orange-500 group-hover:text-orange-600 transition">
                {course.title}
              </h2>
              <p className="text-gray-700 text-xs sm:text-base mb-4">{course.description}</p>
              <button
                className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold text-xs sm:text-base"
                onClick={() => navigate(`/student/courses/${course._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
