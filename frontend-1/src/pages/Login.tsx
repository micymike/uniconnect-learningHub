import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3004/api";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register" | "forgotPassword">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Reset messages when mode changes
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login" || mode === "register") {
        // Login/Register logic
        const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
        const payload = mode === "register"
          ? { email, password, role, fullName }
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

        // Handle authentication tokens
        const accessToken = data.session?.access_token || data.access_token;
        const refreshToken = data.session?.refresh_token || data.refresh_token;
        
        if (!accessToken || !refreshToken) {
          throw new Error("Authentication tokens missing");
        }

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Navigate based on role
        const userRole = data.user?.user_metadata?.role || 
                        data.profile?.role || 
                        "student";
        navigate(userRole === "admin" ? "/admin" : "/student");
        
      } else if (mode === "forgotPassword") {
        // Forgot password logic
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
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" 
            ? "Login" 
            : mode === "register" 
              ? "Register" 
              : "Reset Password"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded bg-gray-800 text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          
          {(mode === "login" || mode === "register" || mode === "forgotPassword") && (
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded bg-gray-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          
          {(mode === "login" || mode === "register") && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 rounded bg-gray-800 text-white pr-20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-orange-400 hover:text-orange-300 font-medium"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          )}
          
          {mode === "register" && (
            <select
              className="w-full p-3 rounded bg-gray-800 text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          )}
          
          {error && (
            <div className="text-red-400 p-3 rounded bg-red-900/30">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-green-400 p-3 rounded bg-green-900/30">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded font-semibold transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading 
              ? mode === "forgotPassword" 
                ? "Sending..." 
                : "Processing..." 
              : mode === "login" 
                ? "Login" 
                : mode === "register" 
                  ? "Register" 
                  : "Send Reset Email"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          {mode === "register" ? (
            <span>
              Already have an account?{" "}
              <button
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
                onClick={() => setMode("login")}
                disabled={loading}
              >
                Login
              </button>
            </span>
          ) : mode === "login" ? (
            <div className="flex flex-col gap-2">
              <span>
                Don't have an account?{" "}
                <button
                  className="text-orange-400 hover:text-orange-300 underline transition-colors"
                  onClick={() => setMode("register")}
                  disabled={loading}
                >
                  Register
                </button>
              </span>
              <button
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
                onClick={() => setMode("forgotPassword")}
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>
          ) : mode === "forgotPassword" ? (
            <span>
              Remember your password?{" "}
              <button
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
                onClick={() => setMode("login")}
                disabled={loading}
              >
                Login
              </button>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}