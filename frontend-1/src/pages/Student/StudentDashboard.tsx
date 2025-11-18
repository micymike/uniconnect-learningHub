import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import "boxicons/css/boxicons.min.css";

type Course = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
};

type LearningPathItem = {
  id: string;
  title: string;
  description: string;
};

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-jqn0.onrender.com/api";

export default function StudentDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [learningPath, setLearningPath] = useState<LearningPathItem[]>([]);
  const [lpLoading, setLpLoading] = useState(false);
  const [lpError, setLpError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fullName = user?.user_metadata?.full_name || user?.fullName || user?.email || "Student";

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
      .then((data) => {
        console.log("Fetched courses:", data);
        setCourses(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Fetch learning path on mount
  useEffect(() => {
    const fetchLearningPath = async () => {
      setLpLoading(true);
      setLpError("");
      try {
        const token = localStorage.getItem("token") || "";
        // For demo, send empty performanceData; in production, send real quiz/note data
        const res = await fetch(`${API_URL}/ai/learning-path`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            performanceData: {
              quizResults: [],
              notes: [],
              completedLessons: [],
            },
          }),
        });
        if (!res.ok) throw new Error("Failed to fetch learning path");
        const data = await res.json();
        setLearningPath(data.learningPath || []);
      } catch (err: any) {
        setLpError(err.message || "Failed to load learning path");
      } finally {
        setLpLoading(false);
      }
    };
    fetchLearningPath();
  }, []);

  // Real stats: Only total courses is available, others are N/A or coming soon
  const stats = [
    { label: "Total Courses", value: courses.length, icon: "bx bx-book", color: "text-orange-500" },
    { label: "Completed", value: "N/A", icon: "bx bx-check-circle", color: "text-green-500" },
    { label: "In Progress", value: "N/A", icon: "bx bx-time", color: "text-blue-500" },
    { label: "Certificates", value: "Coming Soon", icon: "bx bx-award", color: "text-purple-500" }
  ];

return (
    <div className="min-h-screen h-screen w-full max-w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 px-2 py-2 sm:px-4 sm:py-6 overflow-x-hidden">
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in-up w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, <span className="text-orange-500">{fullName.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-gray-400 text-base sm:text-lg">Ready to continue your learning journey?</p>
      </div>

      {/* Learning Path Section */}
      <div className="bg-gray-800 rounded-xl p-2 sm:p-6 mb-6 border border-orange-500 animate-fade-in-up animation-delay-200 w-full max-w-full">
        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
          <i className="bx bx-map text-orange-400 mr-2"></i>
          Your AI Learning Path
        </h2>
        {lpLoading ? (
          <div className="text-gray-400">Loading learning path...</div>
        ) : lpError ? (
          <div className="bg-red-900 text-red-300 p-2 rounded">{lpError}</div>
        ) : learningPath.length === 0 ? (
          <div className="text-gray-400">No personalized path available yet.</div>
        ) : (
          <ol className="list-decimal ml-4 sm:ml-6 space-y-2 sm:space-y-3">
            {learningPath.map((item, idx) => (
              <li key={item.id || idx} className="bg-gray-900 rounded-lg p-2 sm:p-4 border border-gray-700">
                <div className="font-bold text-white">{item.title}</div>
                <div className="text-gray-400 text-sm">{item.description}</div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 w-full max-w-full">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <i className={`${stat.icon} text-2xl ${stat.color}`}></i>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-800 rounded-xl p-2 sm:p-6 mb-6 border border-gray-700 animate-fade-in-up animation-delay-300 w-full max-w-full">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="bx bx-trending-up text-orange-500 mr-2"></i>
          Learning Progress
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Overall Progress</span>
              <span className="text-orange-500 font-semibold">N/A</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full animate-pulse" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">N/A</div>
              <div className="text-gray-400 text-sm">Hours This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">N/A</div>
              <div className="text-gray-400 text-sm">Streak Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">Coming Soon</div>
              <div className="text-gray-400 text-sm">XP Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Courses */}
      <div className="animate-fade-in-up animation-delay-600 w-full max-w-full">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <i className="bx bx-library text-orange-500 mr-2"></i>
          Available Courses
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="text-white text-lg ml-4">Loading courses...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4">
            <i className="bx bx-error-circle mr-2"></i>
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-blue-900 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg mb-4">
            <i className="bx bx-info-circle mr-2"></i>
            No courses available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-6 w-full">
            {courses.map((course, index) => (
              <div
                key={course.id || course._id}
                className="bg-gray-800 rounded-xl p-3 sm:p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group animate-fade-in-up"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
                    <i className="bx bx-book-open text-2xl text-orange-500"></i>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Progress</div>
                    <div className="text-sm font-semibold text-orange-500">{Math.floor(Math.random() * 100)}%</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <i className="bx bx-time mr-1"></i>
                    <span>{Math.floor(Math.random() * 10) + 1}h {Math.floor(Math.random() * 60)}m</span>
                  </div>
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 flex items-center"
                    onClick={() => navigate(`/student/courses/${course._id || course.id}`)}
                  >
                    <span>Continue</span>
                    <i className="bx bx-right-arrow-alt ml-1"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 animate-fade-in-up animation-delay-900 w-full max-w-full">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="bx bx-zap text-orange-500 mr-2"></i>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-full">
          {[
            { label: "Study Buddy", icon: "bx bx-message-dots", path: "/student/chatbot" },
            { label: "Flashcards", icon: "bx bx-collection", path: "/student/flashcards" },
            { label: "My Notes", icon: "bx bx-notepad", path: "/student/mynotes" },
          
            { label: "Find Study Partner", icon: "bx bx-user-plus", path: "/student/find-partner" }
          ].map((action, index) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-orange-500 rounded-xl p-4 text-center transition-all duration-300 transform hover:scale-105 group"
            >
              <i className={`${action.icon} text-2xl text-orange-500 mb-2 block group-hover:animate-bounce`}></i>
              <span className="text-white text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
