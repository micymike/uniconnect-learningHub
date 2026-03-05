import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import TestimonialCarousel from "../components/TestimonialCarousel";

const API_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:3004/api"
  : "https://uniconnect-learninghub-1-backend.onrender.com/api";

export default function ResetPassword() {
  const [accessToken, setAccessToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      const res = await fetch(API_URL + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Password reset failed");
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
        {/* Right side: Reset Password Form */}
        <div className="w-full sm:w-1/2 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-xs sm:max-w-md border border-gray-700"
          >
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
                <path d="M12 11v2m0 4h.01M6.93 6.93a8 8 0 0110.14 0M4.22 4.22a12 12 0 0115.56 0" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
            >
              Reset Password
            </motion.h2>
            <p className="text-gray-400 mt-2 text-xs sm:text-base">
              Enter your reset token and new password below.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-gray-300 mb-2 text-xs sm:text-sm">Reset Token</label>
                <input
                  type="text"
                  placeholder="Paste your reset token"
                  className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition text-xs sm:text-base"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  required
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <label className="block text-gray-300 mb-2 text-xs sm:text-sm">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-3 sm:p-4 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition pr-12 sm:pr-16 text-xs sm:text-base"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
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
                    Resetting...
                  </div>
                ) : "Reset Password"}
              </motion.button>
            </form>
            <div className="mt-6 text-center text-gray-400 text-xs sm:text-sm">
              <button
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-6 mb-4 text-xs sm:text-sm text-gray-400">
        <a
          href="/privacy-policy"
          className="mx-2 underline hover:text-orange-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>
        <span className="mx-1">|</span>
        <a
          href="/terms-of-service"
          className="mx-2 underline hover:text-orange-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
      </div>
    </>
  );
}