import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000/api";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const payload = isRegister
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

      const accessToken = data.session?.access_token || data.access_token;
      const refreshToken = data.session?.refresh_token || data.refresh_token;
      
      if (!accessToken || !refreshToken) {
        throw new Error("Authentication tokens missing");
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      const userRole = data.user?.user_metadata?.role || 
                      data.profile?.role || 
                      "student";
      
      navigate(userRole === "admin" ? "/admin" : "/student");
      
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
          {isRegister ? "Register" : "Login"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 rounded bg-gray-800 text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-gray-800 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
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
          
          {isRegister && (
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
          
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded font-semibold transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          {isRegister ? (
            <span>
              Already have an account?{" "}
              <button
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
                onClick={() => setIsRegister(false)}
                disabled={loading}
              >
                Login
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button
                className="text-orange-400 hover:text-orange-300 underline transition-colors"
                onClick={() => setIsRegister(true)}
                disabled={loading}
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}