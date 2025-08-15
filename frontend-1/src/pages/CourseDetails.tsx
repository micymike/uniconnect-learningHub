import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


const API_URL = import.meta.env.VITE_API_URL;

type Course = {
  _id?: string;
  title: string;
  description: string;
};

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    fetch(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || "Error");
        return res.json();
      })
      .then((data: Course[]) => {
        const found = data.find((c) => c._id === id);
        setCourse(found || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      <header className="bg-white shadow flex items-center px-8 py-4">
        <button
          className="text-orange-500 font-bold mr-4"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-black">Course Details</h1>
      </header>
      <main className="flex-1 px-8 py-8 flex flex-col items-center">
        {loading ? (
          <div className="text-white text-lg">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : !course ? (
          <div className="text-gray-300">Course not found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
            <h2 className="text-3xl font-bold mb-4 text-orange-500">
              {course.title}
            </h2>
            <p className="text-gray-700 mb-6">{course.description}</p>
            {/* Future: Add sections, lessons, quizzes, etc. */}
          </div>
        )}
      </main>
    </div>
  );
}
