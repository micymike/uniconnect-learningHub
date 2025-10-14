import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
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
import NotesApp from './pages/Student/Notes';
import MyNotesWithBuddy from './pages/Student/MyNotesWithBuddy';
import Feedback from './pages/Feedback';
import FindStudyPartner from './pages/Student/FindStudyPartner';
import StudySpace from './pages/Student/StudySpace';
import NotificationPage from './pages/Student/NotificationPage';
import AINoteTaker from './pages/Student/AINoteTaker';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import { useSocket } from './hooks/useSocket';
import { useStudentNotifications, requestNotificationPermission } from './components/ChatNotification';
import { initializeMobile } from './mobile';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import Toast from './components/Toast';

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
    // Allow admin access for both 'admin' and 'supaadmin' roles
    if (requiredRole === 'admin' && (authState.userRole === 'admin' || authState.userRole === 'supaadmin')) {
      // Allow access
    } else {
      const redirectPath = (authState.userRole === 'admin' || authState.userRole === 'supaadmin') ? '/admin' : '/student';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If all checks pass, render the protected content
  return children;
}

function App() {
  // Get userId from localStorage (same as RequireAuth)
  const [userId, setUserId] = useState<string | null>(null);
  const { socket } = useSocket(userId);

  // Toast state for push notifications
  const [toast, setToast] = useState<string | null>(null);

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "push-received") {
          const { title, options } = event.data;
          // Prefer body, fallback to title
          setToast((options && options.body) || title || "Notification");
          playNotificationSound();
        }
      });
    }

    // Real-time socket notifications
    if (socket && userId) {
      socket.on('assignment-due-soon', (data: any) => {
        setToast(`📚 Assignment: ${data.title} - Due in ${data.hours_remaining} hours`);
        playNotificationSound();
      });
      socket.on('study-session-starting', (data: any) => {
        setToast(`👥 Study Session with ${data.partner_name} - Starting ${new Date(data.start_time).toLocaleTimeString()}`);
        playNotificationSound();
      });
      socket.on('achievement-unlocked', (data: any) => {
        setToast(`🏆 Achievement Unlocked! ${data.message}`);
        playNotificationSound();
      });
      socket.on('new-message', (data: any) => {
        setToast(`💬 New message from ${data.sender_name}: ${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}`);
        playNotificationSound();
      });
      // Clean up listeners on unmount
      return () => {
        socket.off('assignment-due-soon');
        socket.off('study-session-starting');
        socket.off('achievement-unlocked');
        socket.off('new-message');
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      try {
        const parsed = JSON.parse(user);
        setUserId(parsed.id || parsed._id || null);
      } catch {
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  }, []);

  // Initialize mobile features and request notification permission
  useEffect(() => {
    initializeMobile();
    requestNotificationPermission();

    // Push subscription logic
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Subscribe to push
        const vapidPublicKey = 'BMne0peY92kuT7WtDEjCOMXMFoNk9OBKYuOJhHOblH5wfIrDJGw1G7ry693KgTgApZylrFYuME_2hoBUP-TpwYA';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });

          // Send subscription to backend
          await fetch('/api/notifications/push-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ subscription })
          });
        } catch (err) {
          console.error('Push subscription error:', err);
        }
      });
    }

    // Helper to convert VAPID key
    function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  }, []);

  // Global notifications for students
  useStudentNotifications(socket, userId || "");

  return (
    <>
      <PWAInstallPrompt />
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        
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
          <Route path="notes" element={<NotesApp />} />
          <Route path="mynotes" element={<MyNotesWithBuddy />} />
          <Route path="find-partner" element={<FindStudyPartner />} />
          <Route path="study-space" element={<StudySpace />} />
          <Route path="ai-note-taker" element={<AINoteTaker />} />
          <Route path="notifications" element={<NotificationPage />} />
        </Route>
      </Routes>
      </Router>
    </>
  );
}

export default App;
