import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend.onrender.com";

type Course = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category?: string;
  created_at?: string;
  created_by?: string;
  difficulty_level?: string;
  duration_hours?: number;
  intro_video_url?: string | null;
  is_featured?: boolean;
  is_free?: boolean;
  learning_objectives?: string[];
  prerequisites?: string[];
  price?: number;
  status?: string;
  tags?: string[];
  thumbnail_url?: string | null;
  updated_at?: string;
  video_content_url?: string | null;
};

type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  // Add more fields as needed
};

function getYouTubeEmbedUrl(url: string) {
  // Supports both youtu.be and youtube.com links
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
}

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creator, setCreator] = useState<User | null>(null);
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
        const found = data.find((c) => c._id === id || c.id === id);
        setCourse(found || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch creator info if available
  useEffect(() => {
    if (course?.created_by) {
      const token = localStorage.getItem("token");
      // Try both /users/:id and /users?id= for flexibility
      fetch(`${API_URL}/users/${course.created_by}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((user: User) => setCreator(user))
        .catch(() => {
          // fallback: try /users?id=
          fetch(`${API_URL}/users?id=${course.created_by}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(async (res) => {
              if (!res.ok) throw new Error();
              return res.json();
            })
            .then((users: User[]) => {
              if (users && users.length > 0) setCreator(users[0]);
            })
            .catch(() => setCreator(null));
        });
    } else {
      setCreator(null);
    }
  }, [course?.created_by]);

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to render video as iframe if possible
  function renderVideo(url: string | null | undefined, label: string) {
    if (!url) return null;
    const yt = getYouTubeEmbedUrl(url);
    const vimeo = getVimeoEmbedUrl(url);
    if (yt) {
      return (
        <div className="mb-6">
          <div className="font-semibold mb-2">{label}</div>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={yt}
              title={label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-64 rounded-lg border"
            />
          </div>
        </div>
      );
    }
    if (vimeo) {
      return (
        <div className="mb-6">
          <div className="font-semibold mb-2">{label}</div>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={vimeo}
              title={label}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-64 rounded-lg border"
            />
          </div>
        </div>
      );
    }
    // Fallback: just a link
    return (
      <div className="mb-6">
        <div className="font-semibold mb-2">{label}</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Watch Video
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            className="flex items-center text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            onClick={() => navigate(-1)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading course details...</div>
          </div>
        ) : error ? (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : !course ? (
          <div className="bg-gray-800 text-gray-300 px-6 py-8 rounded-lg text-center">
            Course not found.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {course.thumbnail_url && (
                  <div className="w-full h-64 bg-gray-900">
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-4xl font-bold text-gray-900 flex-1">
                      {course.title}
                    </h1>
                    {course.is_featured && (
                      <span className="ml-4 px-3 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.category && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {course.category}
                      </span>
                    )}
                    {course.difficulty_level && (
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                        {course.difficulty_level}
                      </span>
                    )}
                    {course.status && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {course.status}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Learning Objectives Card */}
              {Array.isArray(course.learning_objectives) && course.learning_objectives.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What You'll Learn
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {course.learning_objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center mr-3 mt-1">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-gray-700 flex-1">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites Card */}
              {Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Prerequisites
                  </h2>
                  <div className="space-y-3">
                    {course.prerequisites.map((pre, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-500 mr-3 mt-2"></div>
                        <p className="text-gray-700">{pre}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Content */}
              {(course.intro_video_url || course.video_content_url) && (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Course Videos
                  </h2>
                  {renderVideo(course.intro_video_url, "Introduction Video")}
                  {renderVideo(course.video_content_url, "Course Content")}
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Info Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {course.is_free ? "Free" : `${course.price}`}
                  </div>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                    Enroll Now
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="font-semibold">{course.duration_hours} hours</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="text-sm text-gray-500">Level</div>
                      <div className="font-semibold">{course.difficulty_level}</div>
                    </div>
                  </div>

                  {course.category && (
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <div>
                        <div className="text-sm text-gray-500">Category</div>
                        <div className="font-semibold">{course.category}</div>
                      </div>
                    </div>
                  )}
                </div>

                {course.tags && course.tags.length > 0 && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="text-sm text-gray-500 mb-3">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 mt-6 text-xs text-gray-500">
                  <div>Created: {course.created_at}</div>
                  <div>Updated: {course.updated_at}</div>
                  <div>
                    Created By:{" "}
                    {creator
                      ? creator.name || creator.email || creator.id || creator._id
                      : course.created_by || "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
