// src/pages/admin/lessons/LessonsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {ToastContainer , toast } from 'react-toastify';

const API_URL = "http://localhost:3004/api";

interface Lesson {
  id: string;
  section_id: string;
  title: string;
  content: string;
  order: number;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

interface LessonFormData {
  section_id: string;
  title: string;
  content: string;
  order: number | '';
  video_url: string;
}

const LessonsPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState<LessonFormData>({
    section_id: '',
    title: '',
    content: '',
    order: '',
    video_url: ''
  });

  // Fetch all lessons
  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/lessons`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch lessons');
      }
      
      const data: Lesson[] = await response.json();
      setLessons(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = currentLesson 
        ? `${API_URL}/lessons/${currentLesson.id}` 
        : `${API_URL}/lessons`;
      
      const method = currentLesson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          ...formData,
          order: Number(formData.order)
        })
      });
      
      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
      
      const result: Lesson = await response.json();
      toast.success(currentLesson ? 'Lesson updated!' : 'Lesson created!');
      
      // Reset form and close modal
      setFormData({
        section_id: '',
        title: '',
        content: '',
        order: '',
        video_url: ''
      });
      setIsModalOpen(false);
      setCurrentLesson(null);
      fetchLessons();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Edit lesson handler
  const handleEdit = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setFormData({
      section_id: lesson.section_id,
      title: lesson.title,
      content: lesson.content,
      order: lesson.order,
      video_url: lesson.video_url || ''
    });
    setIsModalOpen(true);
  };

  
  // Updated handleDelete function
const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      const response = await fetch(`${API_URL}/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      // Handle empty response (204 No Content)
      if (response.status === 204) {
        toast.success('Lesson deleted successfully!');
        fetchLessons();
        return;
      }
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete lesson');
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Modal component
  const LessonModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-400">
            {currentLesson ? 'Edit Lesson' : 'Create New Lesson'}
          </h2>
          <button 
            onClick={() => {
              setIsModalOpen(false);
              setCurrentLesson(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            <i className="bx bx-x text-3xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Section ID</label>
              <input
                type="text"
                name="section_id"
                value={formData.section_id}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="0"
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
            ></textarea>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Video URL (Optional)</label>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="https://example.com/video.mp4"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-white transition"
            >
              {currentLesson ? 'Update Lesson' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Get user data safely
  const getUserData = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  };

  const user = getUserData();
  const fullName = user?.user_metadata?.full_name || "Admin";

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow flex items-center px-8 py-4">
        <div className="flex items-center gap-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              fullName
            )}&background=ff6600&color=fff`}
            alt="Admin Avatar"
            className="w-12 h-12 rounded-full border-2 border-orange-400"
          />
          <div>
            <div className="text-lg font-bold text-black">
              Manage Lessons
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">All Lessons</h1>
            <button
              onClick={() => {
                setCurrentLesson(null);
                setFormData({
                  section_id: '',
                  title: '',
                  content: '',
                  order: '',
                  video_url: ''
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              <i className="bx bx-plus text-xl"></i>
              Create Lesson
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            /* Lessons Table */
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <tr key={lesson.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{lesson.section_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lesson.order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(lesson)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                              aria-label="Edit lesson"
                            >
                              <i className="bx bx-edit text-xl"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(lesson.id)}
                              className="text-red-600 hover:text-red-900"
                              aria-label="Delete lesson"
                            >
                              <i className="bx bx-trash text-xl"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No lessons found. Create your first lesson!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Lesson Modal */}
      {isModalOpen && <LessonModal />}
      
      {/* Toast Container */}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default LessonsPage;