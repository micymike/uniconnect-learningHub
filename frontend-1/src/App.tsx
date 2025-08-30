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
import StudyChat from './pages/Student/StudyChat';
import FlashcardGenerator from './pages/Student/FlashcardGenerator';
import TaskScheduler from './pages/Student/TaskScheduler';
import MatchingGame from './pages/Student/MatchingGame';
import MyNotes from './pages/Student/MyNotes';
import MyNotesWithBuddy from './pages/Student/MyNotesWithBuddy';
import Feedback from './pages/Feedback';

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
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("userRole");
        let isTokenValid = false;

        if (token) {
          // Decode JWT and check expiry
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp;
          const now = Math.floor(Date.now() / 1000);
          if (exp && exp > now) {
            isTokenValid = true;
          } else {
            // Token expired, remove from storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");
          }
        }

        if (isMounted) {
          setAuthState({
            isChecking: false,
            isAuthenticated: isTokenValid,
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
          <Route path="help" element={<div>Help Page</div>} />
          <Route path="matching-game" element={<MatchingGame />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="chatbot" element={<StudyBuddy />} />
          <Route path="study-chat" element={<StudyChat />} />
          <Route path="flashcards" element={<FlashcardGenerator />} />
          <Route path="task-scheduler" element={<TaskScheduler />} />

<Route path="mynotes" element={<MyNotesWithBuddy />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
