import React, { useEffect, useState } from 'react';
const API_URL = "http://localhost:3004/api"
type Course = {
  _id: string;
  title: string;
  description?: string;
  published: boolean;
  modules: string[];
};

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2">Courses</h1>
      <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">This is the main dashboard for all courses.</p>
      {loading && (
        <div className="flex justify-center items-center min-h-[120px] sm:min-h-[200px]">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 sm:px-4 sm:py-2 rounded mb-4 text-xs sm:text-base">
          {error}
        </div>
      )}
      {!loading && !error && courses.length === 0 && (
        <div className="bg-blue-100 text-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded mb-4 text-xs sm:text-base">
          No courses available.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6 mt-2 sm:mt-4">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 flex flex-col h-full"
          >
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base sm:text-xl font-semibold">{course.title}</h2>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    course.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              {course.description && (
                <p className="text-gray-700 text-xs sm:text-sm mb-2">{course.description}</p>
              )}
              <span className="text-xs text-gray-500 mt-auto">
                Modules: {course.modules?.length ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
