import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Courses from './pages/Courses';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminCourses from './pages/Admin/AdminCourses';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CourseDetails from './pages/CourseDetails';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';
import AIDemo from './pages/AIDemo';
import LessonsPage from './pages/Admin/Lessons';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
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
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          {/* Add other admin routes here */}
        </Route>
        
        {/* Student routes */}
        <Route
          path="/student"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/student/courses/:id"
          element={
            <RequireAuth>
              <CourseDetails />
            </RequireAuth>
          }
        />
        
        <Route path="/ai-demo" element={<AIDemo />} />
      </Routes>
    </Router>
  );
}

export default App;