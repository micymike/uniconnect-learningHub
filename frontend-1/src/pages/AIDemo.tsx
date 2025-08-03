import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AIFeatureCard from "../components/AIFeatures/AIFeatureCard";
import AIFeatureForm from "../components/AIFeatures/AIFeatureForm";
import AIResultDisplay from "../components/AIFeatures/AIResultDisplay";
import { aiFeatures, categoryInfo, AIFeature } from "../components/AIFeatures/aiFeatureConfig";

const API_BASE = process.env.VITE_API_URL || "http://localhost:3000/api";

function AIDemo() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get studentId from localStorage on mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setStudentId(user.id || null);
      } else {
        setStudentId(null);
      }
    } catch (err) {
      setStudentId(null);
    }
  }, []);

  // Get JWT token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
    
  };

  const handleFeatureSelect = (feature: AIFeature) => {
    setActiveFeature(feature);
    setResult(null);
    setError("");
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (!activeFeature || !studentId) {
      setError("Student ID not available. Please log in.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        navigate("/login");
        return;
      }

      let url = API_BASE + activeFeature.path;
      let options: RequestInit = { 
        method: activeFeature.method, 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: "include"
      };

      // Debug: Log token and headers object
      console.log("Token from localStorage:", token);
      console.log("Headers object:", options.headers);

      if (activeFeature.method === "GET") {
        const params = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
        url += "?" + params.toString();
      } else {
        const body: any = { ...formData };
        
        // Handle special field transformations
        if (formData.preferences && typeof formData.preferences === 'string') {
          body.preferences = formData.preferences.split(",").map((s: string) => s.trim());
        }
        
        options.body = JSON.stringify(body);
      }

      const res = await fetch(url, options);

      const data = await res.json();
      
      if (!res.ok) {
        // If unauthorized, redirect to login
        if (res.status === 401 || data.message === "Unauthorized") {
          navigate("/login");
          return;
        }
        throw new Error(data.message || `HTTP error! status: ${res.status}`);
      }
      
      setResult(data);
    } catch (err) {
      // If unauthorized, redirect to login
      if (
        (err instanceof Error && err.message === "Unauthorized") ||
        (typeof err === "string" && err === "Unauthorized")
      ) {
        navigate("/login");
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClearResult = () => {
    setResult(null);
    setError("");
  };

  const filteredFeatures = selectedCategory === 'all' 
    ? aiFeatures 
    : aiFeatures.filter(feature => feature.category === selectedCategory);

  const categories = Object.keys(categoryInfo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Learning Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your learning experience with cutting-edge AI tools designed specifically for students.
            Get personalized help, create study materials, and boost your academic performance.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Features
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {categoryInfo[category as keyof typeof categoryInfo].name}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feature Selection */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Choose an AI Tool
              </h2>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <AnimatePresence>
                  {filteredFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AIFeatureCard
                        title={feature.name}
                        description={feature.description}
                        icon={feature.icon}
                        isActive={activeFeature?.id === feature.id}
                        onClick={() => handleFeatureSelect(feature)}
                        category={feature.category}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeFeature ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AIFeatureForm
                    fields={activeFeature.fields}
                    onSubmit={handleFormSubmit}
                    loading={loading}
                    title={activeFeature.formTitle}
                    description={activeFeature.formDescription}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl shadow-lg p-12 text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to AI Learning Hub
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    Select an AI tool from the left panel to get started with personalized learning assistance.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{aiFeatures.filter(f => f.category === 'study').length} Study Tools</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{aiFeatures.filter(f => f.category === 'productivity').length} Productivity Tools</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>{aiFeatures.filter(f => f.category === 'collaboration').length} Collaboration Tools</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      <span>{aiFeatures.filter(f => f.category === 'wellbeing').length} Wellbeing Tools</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Display */}
            <AIResultDisplay
              result={result}
              loading={loading}
              error={error}
              onClear={handleClearResult}
            />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 py-8 border-t border-gray-200"
        >
          <p className="text-gray-500">
            Powered by advanced AI technology to enhance your learning journey
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default AIDemo;
