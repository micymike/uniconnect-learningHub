import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Courses from './pages/Courses';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminCourses from './pages/Admin/AdminCourses';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CourseDetails from './pages/CourseDetails';
import StudentDashboard from './pages/Student/StudentDashboard';
import './App.css';
import LessonsPage from './pages/Admin/Lessons';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import QuizzesPage from './pages/Admin/Quizzes';
import StudentDashboardLayout from './pages/Student/StudentDashboardLayout';
import StudyBuddy from './pages/Student/StudyBuddy';
import FlashcardGenerator from './pages/Student/FlashcardGenerator';
import StudyAssistant from './pages/Student/StudyAssistant';

interface RequireAuthProps {
  children: JSX.Element;
  requiredRole?: string;
}

function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const [authState, setAuthState] = useState<{
    isChecking: boolean;
    isAuthenticated: boolean;
    userRole: string | null;
  }>({
    isChecking: true,
    isAuthenticated: false,
    userRole: null
  });

  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = () => {
      try {
        // Check for the correct token key that Login component uses
        const token = localStorage.getItem("token"); 
        const storedRole = localStorage.getItem("userRole");
        
        if (isMounted) {
          setAuthState({
            isChecking: false,
            isAuthenticated: !!token,
            userRole: storedRole
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setAuthState({
            isChecking: false,
            isAuthenticated: false,
            userRole: null
          });
        }
      }
    };

    // Small delay to prevent immediate redirects
    const timeoutId = setTimeout(checkAuth, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); 

  // Show loading while checking authentication
  if (authState.isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with current location
  if (!authState.isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authenticated but wrong role, redirect to appropriate dashboard
  if (requiredRole && authState.userRole !== requiredRole) {
    const redirectPath = authState.userRole === 'admin' ? '/admin' : '/student';
    return <Navigate to={redirectPath} replace />;
  }

  // If all checks pass, render the protected content
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes with layout */}
        <Route 
          path="/admin" 
          element={
            <RequireAuth requiredRole="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          {/* Add other admin routes here */}
        </Route>
        
        {/* Student routes */}
        <Route
          path="/student"
          element={
            <RequireAuth requiredRole="student">
              <StudentDashboardLayout />
            </RequireAuth>
          }
        >
          {/* Student nested routes */}
          <Route index element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetails />} />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="help" element={<div>Help Page</div>} />
          <Route path="feedback" element={<div>Feedback Page</div>} />
          <Route path="chatbot" element={<StudyBuddy />} />
          <Route path="flashcards" element={<FlashcardGenerator />} />
          <Route path="study-assistant" element={<StudyAssistant />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
