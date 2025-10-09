import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import TestimonialCarousel from "../components/TestimonialCarousel";
import { supabase } from "../lib/supabaseClient";

const API_URL = "https://uniconnect-learninghub-backend-yspz.onrender.com/api";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register" | "forgotPassword">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectPath = useRef<string | null>(null);
  
  useEffect(() => {
    if (redirectPath.current === null) {
      redirectPath.current = location.state?.from?.pathname || null;
    }
  }, []); 

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  useEffect(() => {
    // Handle Google OAuth redirect with tokens in query params
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    
    if (accessToken) {
      // Decode the JWT token to get user info
      try {
        let userData = null;
        try {
          const tokenParts = accessToken.split('.');
          if (tokenParts.length !== 3) {
            throw new Error("Malformed JWT token");
          }
          const base64Url = tokenParts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          userData = JSON.parse(jsonPayload);
        } catch (decodeError) {
          throw new Error("Failed to decode JWT token");
        }
        
        // Store token and user data
        localStorage.setItem("token", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        
        // Store user information
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userRole", userData.role || "student");
        
        // Navigate to appropriate dashboard based on role
        const dashboardPath = userData.role === "admin" ? "/admin" : "/student";
        redirectPath.current = dashboardPath;
        navigate(dashboardPath, { replace: true });
      } catch (error) {
        console.error("Error processing login token:", error);
        setError("Failed to process login information. Please try again.");
      }
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        const targetPath = redirectPath.current || "/student";
        navigate(targetPath, { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login" || mode === "register") {
        const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
        const payload = mode === "register"
          ? { email, password, role: "student", fullName }
          : { email, password };

        const res = await fetch(API_URL + endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || data.error?.message || "An error occurred");
        }

        const accessToken = data.session?.access_token || data.access_token;
        const refreshToken = data.session?.refresh_token || data.refresh_token;
        const userRole = "student"; // Always set to student

        if (!accessToken || !refreshToken) {
          throw new Error("Authentication tokens missing");
        }

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("user", JSON.stringify({
          ...(data.user || {}),
          role: userRole
        }));
        
        const targetPath = redirectPath.current || "/student";
        navigate(targetPath, { replace: true });
        
      } else if (mode === "forgotPassword") {
        const res = await fetch(API_URL + "/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Failed to send reset email");
        }

        setSuccess("Password reset email sent. Please check your inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col sm:flex-row items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-2 sm:p-4">
        {/* Left side: Carousel */}
        <div className="w-full sm:w-1/2 flex items-center justify-center mb-8 sm:mb-0 sm:mr-8">
          <TestimonialCarousel />
        </div>
        {/* Right side: Login/Register/Forgot Password Form */}
        <div className="w-full sm:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md border border-gray-700"
          >
            <div className="text-center mb-8">
              {/* Google OAuth Button */}
              {mode === "login" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="w-full mb-4 flex items-center justify-center bg-white text-gray-800 font-semibold py-2 sm:py-3 rounded-xl shadow-lg border border-gray-300 hover:bg-gray-100 transition-all"
onClick={() => {
  // Use environment variable for backend URL, fallback to prod or dev as needed
  const backendUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://uniconnect-learninghub-backend-yspz.onrender.com/api";
  window.location.href = backendUrl + "/auth/google";
}}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    width="24"
                    height="24"
                    className="mr-2"
                  >
                    <g>
                      <path
                        fill="#4285F4"
                        d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.45 2.34 30.6 0 24 0 14.61 0 6.27 5.7 2.44 14.02l7.98 6.21C12.36 13.13 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#34A853"
                        d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9.02h12.44c-.54 2.9-2.18 5.36-4.64 7.02l7.2 5.6C43.73 37.13 46.1 31.3 46.1 24.5z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.42 28.23c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.21C.8 15.7 0 19.74 0 24c0 4.26.8 8.3 2.44 12.31l7.98-6.21z"
                      />
                      <path
                        fill="#EA4335"
                        d="M24 48c6.6 0 12.45-2.17 16.85-5.93l-7.2-5.6c-2.01 1.35-4.6 2.13-7.65 2.13-6.26 0-11.64-3.63-13.58-8.73l-7.98 6.21C6.27 42.3 14.61 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </g>
                  </svg>
                  {loading ? "Signing in..." : "Sign in with Google"}
                </motion.button>
              )}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
              >
                {mode === "login" 
                  ? "Welcome Back" 
                  : mode === "register" 
                    ? "Create Account" 
                    : "Reset Password"}
              </motion.h2>
              <p className="text-gray-400 mt-2 text-xs sm:text-base">
                {mode === "login" 
                  ? "Sign in to continue your learning journey" 
                  : mode === "register" 
                    ? "Join us to unlock new possibilities" 
                    : "Enter your email to reset your password"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <input
                type="hidden"
                name="redirectTo"
                value={window.location.origin + "/confirm"}
              />
              
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-gray-300 mb-2 text-xs sm:text-sm">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition text-xs sm:text-base"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </motion.div>
              )}
              
              {(mode === "login" || mode === "register" || mode === "forgotPassword") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mode === "register" ? 0.3 : 0.2 }}
                >
                  <label className="block text-gray-300 mb-2 text-xs sm:text-sm">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition text-xs sm:text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </motion.div>
              )}
              
              {(mode === "login" || mode === "register") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: mode === "register" ? 0.4 : 0.3 }}
                  className="relative"
                >
                  <label className="block text-gray-300 mb-2 text-xs sm:text-sm">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition pr-12 sm:pr-16 text-xs sm:text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 sm:bottom-4 text-xs sm:text-sm text-orange-400 hover:text-orange-300 font-medium"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 sm:p-4 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-xs sm:text-base"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 sm:p-4 rounded-xl bg-green-900/30 border border-green-700 text-green-300 text-xs sm:text-base"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {success}
                  </div>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-3 sm:py-4 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 text-xs sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === "forgotPassword" 
                      ? "Sending..." 
                      : mode === "register"
                        ? "Creating Account..."
                        : "Signing In..."}
                  </div>
                ) : mode === "login" 
                    ? "Sign In" 
                    : mode === "register" 
                      ? "Create Account" 
                      : "Send Reset Email"}
              </motion.button>
            </form>
            
            <div className="mt-6 text-center text-gray-400 text-xs sm:text-sm">
              {mode === "register" ? (
                <div>
                  Already have an account?{" "}
                  <button
                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    onClick={() => setMode("login")}
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </div>
              ) : mode === "login" ? (
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div>
                    Don't have an account?{" "}
                    <button
                      className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                      onClick={() => setMode("register")}
                      disabled={loading}
                    >
                      Register
                    </button>
                  </div>
                  <button
                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    onClick={() => setMode("forgotPassword")}
                    disabled={loading}
                  >
                    Forgot your password?
                  </button>
                </div>
              ) : mode === "forgotPassword" ? (
                <div>
                  Remember your password?{" "}
                  <button
                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                    onClick={() => setMode("login")}
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-6 mb-4 text-xs sm:text-sm text-gray-400">
        <Link
          to="/privacy-policy"
          className="mx-2 underline hover:text-orange-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>
        <span className="mx-1">|</span>
        <Link
          to="/terms-of-service"
          className="mx-2 underline hover:text-orange-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </Link>
      </div>
    </>
  );
}
