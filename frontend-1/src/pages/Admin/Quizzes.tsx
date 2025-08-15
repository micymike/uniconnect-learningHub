// QuizzesPage.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Define TypeScript interfaces to match backend structure
interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  id: string;
  title: string;
  lesson_id: string;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

const API_URL = process.env.REACT_APP_API_URL;

const QuizzesPage = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], answer: '' }
  ]);

  // Check authentication and get user on component mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (!accessToken || !userData) {
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setCurrentUser({
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || user.role || 'student',
        fullName: user.user_metadata?.fullName || user.fullName || 'User'
      });
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
    
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch quizzes');
      }
      
      const data = await response.json();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || 'Error loading quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizById = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch quiz details');
      }
      
      const data = await response.json();
      setCurrentQuiz(data);
    } catch (err: any) {
      setError(err.message || 'Error loading quiz details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setError('');
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      const newQuiz = {
        title,
        lesson_id: lessonId,
        questions
      };

      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(newQuiz)
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to create quiz');
      }

      const createdQuiz = await response.json();
      setQuizzes([...quizzes, createdQuiz]);
      resetForm();
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message || 'Error creating quiz');
    }
  };

  const handleUpdate = async () => {
    if (!editingQuiz) return;

    try {
      setError('');
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      const updatedQuiz = {
        title,
        lesson_id: lessonId,
        questions
      };

      const response = await fetch(`${API_URL}/quizzes/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedQuiz)
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to update quiz');
      }

      const updated = await response.json();
      setQuizzes(quizzes.map(q => q.id === updated.id ? updated : q));
      resetForm();
      setEditingQuiz(null);
    } catch (err: any) {
      setError(err.message || 'Error updating quiz');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError('');
      
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_URL}/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to delete quiz');
      }

      setQuizzes(quizzes.filter(q => q.id !== id));
      if (currentQuiz?.id === id) setCurrentQuiz(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting quiz');
    }
  };

  const resetForm = () => {
    setTitle('');
    setLessonId('');
    setQuestions([{ question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const startEditing = (quiz: Quiz) => {
    setTitle(quiz.title);
    setLessonId(quiz.lesson_id);
    setQuestions(quiz.questions);
    setEditingQuiz(quiz);
    setIsCreating(false);
    setCurrentQuiz(null);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field === 'answer') {
      newQuestions[index].answer = value;
    }
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
     {/* Navigation Bar */}
<nav className="bg-indigo-800 text-white shadow-lg">
  <div className="max-w-6xl mx-auto px-4 py-4 flex justify-center items-center">
    <div className="flex items-center space-x-3">
      <div className="bg-indigo-600 p-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold">Quizz Master</h1>
    </div>
  </div>
</nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">Quizzes Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage quizzes for your lessons
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quizzes List */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">All Quizzes</h2>
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsCreating(true);
                    setEditingQuiz(null);
                    setCurrentQuiz(null);
                    resetForm();
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Quiz
                </motion.button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4">No quizzes found</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
              >
                {quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      currentQuiz?.id === quiz.id 
                        ? 'bg-indigo-50 border-indigo-300 shadow-md' 
                        : 'bg-white border-gray-200 hover:border-indigo-200'
                    }`}
                    onClick={() => fetchQuizById(quiz.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Lesson: {quiz.lesson_id}</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(quiz.updated_at)}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(quiz);
                            }}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(quiz.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Quiz Form or Details */}
          <div className="lg:col-span-2">
            {isCreating || editingQuiz ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter quiz title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lesson ID</label>
                    <input
                      type="text"
                      value={lessonId}
                      onChange={(e) => setLessonId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter lesson ID"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">Questions</label>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addQuestion}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Question
                      </motion.button>
                    </div>
                    
                    <div className="space-y-4">
                      {questions.map((q, qIndex) => (
                        <motion.div
                          key={qIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-gray-700">Question {qIndex + 1}</h3>
                            {questions.length > 1 && (
                              <button
                                onClick={() => removeQuestion(qIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Question Text</label>
                            <textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your question"
                              rows={2}
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">Options</label>
                            <div className="space-y-2">
                              {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`answer-${qIndex}`}
                                    checked={q.answer === option}
                                    onChange={() => updateQuestion(qIndex, 'answer', option)}
                                    className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={editingQuiz ? handleUpdate : handleCreate}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingQuiz(null);
                        resetForm();
                      }}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : currentQuiz ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentQuiz.title}</h2>
                    <p className="text-gray-600 mt-1">Lesson ID: {currentQuiz.lesson_id}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated: {formatDate(currentQuiz.updated_at)}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {currentQuiz.questions.map((q, qIndex) => (
                    <motion.div
                      key={qIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: qIndex * 0.1 }}
                      className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm"
                    >
                      <h3 className="font-medium text-lg text-gray-800 mb-3">Question {qIndex + 1}</h3>
                      <p className="text-gray-700 mb-4">{q.question}</p>
                      
                      <div className="space-y-3">
                        {q.options.map((option, oIndex) => (
                          <div
                            key={oIndex}
                            className={`p-3 rounded-lg border ${
                              option === q.answer
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                                option === q.answer
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200'
                              }`}>
                                {String.fromCharCode(65 + oIndex)}
                              </div>
                              <span>{option}</span>
                              {option === q.answer && (
                                <span className="ml-auto text-green-600 font-medium">Correct Answer</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center text-center h-full"
              >
                <div className="bg-indigo-100 p-4 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Quiz</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Choose a quiz from the list to view its details, or create a new quiz to get started.
                </p>
                {isAdmin && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create New Quiz
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizzesPage;
