import React, { useEffect, useState } from 'react';
import "boxicons/css/boxicons.min.css";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-jqn0.onrender.com/api";

type Course = {
  _id: string;
  title: string;
  description?: string;
  published: boolean;
  modules: string[];
};

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

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
        setFilteredCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unknown error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filter !== 'all') {
      filtered = filtered.filter(course => 
        filter === 'published' ? course.published : !course.published
      );
    }

    setFilteredCourses(filtered);
  }, [searchTerm, filter, courses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-6">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
          <i className="bx bx-library text-orange-500 mr-3"></i>
          Course Library
        </h1>
        <p className="text-gray-400 text-lg">Explore and manage your learning content</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 animate-fade-in-up animation-delay-300">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[{ key: 'all', label: 'All' }, { key: 'published', label: 'Published' }, { key: 'draft', label: 'Draft' }].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  filter === filterOption.key
                    ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Courses', value: courses.length, icon: 'bx bx-book', color: 'text-blue-500' },
            { label: 'Published', value: courses.filter(c => c.published).length, icon: 'bx bx-check-circle', color: 'text-green-500' },
            { label: 'Draft', value: courses.filter(c => !c.published).length, icon: 'bx bx-edit', color: 'text-yellow-500' },
            { label: 'Total Modules', value: courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0), icon: 'bx bx-collection', color: 'text-purple-500' }
          ].map((stat, index) => (
            <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-fade-in-up" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <i className={`${stat.icon} text-2xl ${stat.color}`}></i>
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-white text-lg">Loading courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-6 py-4 rounded-xl mb-6 flex items-center animate-fade-in-up">
          <i className="bx bx-error-circle text-2xl mr-3"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCourses.length === 0 && (
        <div className="text-center py-20 animate-fade-in-up">
          <i className="bx bx-book-open text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filter !== 'all' ? 'No courses match your criteria' : 'No courses available'}
          </h3>
          <p className="text-gray-400">
            {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter' : 'Start by creating your first course'}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && !error && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up animation-delay-600">
          {filteredCourses.map((course, index) => (
            <div
              key={course._id}
              className="bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group animate-fade-in-up"
              style={{ animationDelay: `${(index + 6) * 100}ms` }}
            >
              {/* Course Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
                    <i className="bx bx-book-open text-2xl text-orange-500"></i>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      course.published
                        ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500'
                        : 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500'
                    }`}
                  >
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors">
                  {course.title}
                </h2>

                {course.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <i className="bx bx-collection mr-1"></i>
                    <span>{course.modules?.length || 0} modules</span>
                  </div>
                  <div className="flex items-center">
                    <i className="bx bx-time mr-1"></i>
                    <span>{Math.floor(Math.random() * 10) + 1}h {Math.floor(Math.random() * 60)}m</span>
                  </div>
                </div>
              </div>

              {/* Course Footer */}
              <div className="px-6 pb-6">
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center group">
                  <span>View Course</span>
                  <i className="bx bx-right-arrow-alt ml-2 text-lg group-hover:translate-x-1 transition-transform"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
