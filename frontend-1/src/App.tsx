import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Courses from './pages/Courses';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminCourses from './pages/AdminCourses';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CourseDetails from './pages/CourseDetails';
import './App.css';
import AIDemo from './pages/AIDemo';

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
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <RequireAuth>
              <AdminCourses />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RequireAuth>
              <AnalyticsDashboard />
            </RequireAuth>
          }
        />
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
        {/* Future routes for sections, lessons, quizzes, auth, etc. */}
        <Route path="/ai-demo" element={<AIDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
