import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "🎓",
      title: "AI-Powered Learning",
      description: "Advanced AI study assistant with multimodal support, voice interaction, and personalized learning paths",
      delay: "0ms"
    },
    {
      icon: "📚",
      title: "Smart Study Tools",
      description: "Flashcard generation, note enhancement, PDF analysis, and intelligent study scheduling",
      delay: "200ms"
    },
    {
      icon: "🧠",
      title: "Intelligent Analytics",
      description: "Grade prediction, progress tracking, learning analytics, and performance insights",
      delay: "400ms"
    },
    {
      icon: "🤝",
      title: "Collaborative Learning",
      description: "Study group matching, peer collaboration, and social learning features",
      delay: "600ms"
    },
    {
      icon: "📊",
      title: "Comprehensive Management",
      description: "Course creation, student enrollment, quiz building, and content management",
      delay: "800ms"
    },
    {
      icon: "🎯",
      title: "Personalized Experience",
      description: "Adaptive learning, custom study plans, expense tracking, and mental health support",
      delay: "1000ms"
    }
  ];

  const aiFeatures = [
    "Multimodal AI (Text, Voice, Image)",
    "PDF Document Analysis & Chat",
    "Smart Study Scheduling",
    "Expense Tracking & Budgeting",
    "Grade Prediction & Analytics",
    "Research Assistant",
    "Note Enhancement",
    "Study Group Matching",
    "Adaptive Quiz Generation",
    "Essay Feedback & Grading",
    "Content Summarization",
    "Time Management Coaching",
    "Mental Health Support"
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background - Orange/Black Theme */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-orange-500/30 to-orange-600/30 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.3s ease-out'
          }}
        ></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-400/20 to-orange-500/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-600/20 to-orange-700/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-white/5 to-orange-300/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Floating Particles - Orange/White */}
      <div className="fixed inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-ping ${
              i % 3 === 0 ? 'bg-orange-400/40' : i % 3 === 1 ? 'bg-white/20' : 'bg-orange-300/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-6 px-4 flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-between backdrop-blur-sm bg-black/20 border-b border-orange-500/20">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-orange-500 to-white bg-clip-text text-transparent animate-shimmer">
            UniConnect Learning Hub
          </h1>
          <p className="mt-2 text-base sm:text-lg md:text-2xl text-gray-300 animate-fade-in-up">
            Next-Generation AI-Powered Learning Platform
          </p>
        </div>
        <Link
          to="/login"
          className="group relative w-full sm:w-auto mt-4 sm:mt-0 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-orange-500/50 text-center overflow-hidden animate-glow"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("user");
          }}
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
      >
        <div className="max-w-6xl mx-auto">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent animate-pulse neon-glow">
                UniConnect Learning Hub
              </span>
              <br />
              <span className="block mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold bg-gradient-to-r from-white via-orange-300 to-orange-500 bg-clip-text text-transparent animate-shimmer">
                Learning is Here
              </span>
            </h2>
          </div>
          
          <div className="animate-fade-in-up animation-delay-300">
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience revolutionary AI-powered education with multimodal learning, 
              intelligent analytics, and personalized study assistance
            </p>
          </div>

          {/* Floating Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-up animation-delay-600">
            <div className="group relative bg-gradient-to-br from-orange-500/10 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-orange-500/30 hover:border-orange-400/70 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 animate-float">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">🤖</div>
              <h3 className="text-2xl font-bold mb-4 text-orange-300 group-hover:text-white transition-colors duration-300">AI Assistant</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Voice, text, and image-powered learning companion</p>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-white/5 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-orange-400/70 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 animate-float animation-delay-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">📊</div>
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-300 transition-colors duration-300">Smart Analytics</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Predictive insights and performance tracking</p>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-orange-600/10 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-orange-600/30 hover:border-orange-400/70 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:rotate-1 animate-float animation-delay-600">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-orange-400 group-hover:text-white transition-colors duration-300">Personalized</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Adaptive learning paths tailored to you</p>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-orange-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-orange-500 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="relative z-10 py-20 px-4"
        id="features"
        data-animate
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-white to-orange-500 bg-clip-text text-transparent neon-glow">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the comprehensive suite of tools designed to revolutionize your learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-orange-500/10 to-black/50 backdrop-blur-lg rounded-3xl p-8 border border-orange-500/20 hover:border-orange-400/60 transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 hover:rotate-1 hover-lift"
                style={{ animationDelay: feature.delay }}
                data-animate
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-6xl mb-6 group-hover:animate-spin filter drop-shadow-lg">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-orange-300 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer bg-gradient-to-r from-transparent via-orange-400/20 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Showcase */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-orange-900/10 to-black/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-bold mb-12 bg-gradient-to-r from-white via-orange-400 to-orange-600 bg-clip-text text-transparent neon-glow">
            Advanced AI Capabilities
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-orange-500/20 hover:border-orange-400/60 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full group-hover:animate-pulse animate-scale-pulse"></div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    {feature}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Removed AI Features Showcase image */}
        </div>
      </section>

      {/* Student & Admin Sections */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Students Section */}
            <div className="group relative bg-gradient-to-br from-orange-500/10 to-black/50 backdrop-blur-lg rounded-3xl p-12 border border-orange-500/30 hover:border-orange-400/70 transition-all duration-700 transform hover:scale-105 hover-lift">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full blur-2xl group-hover:animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="text-6xl mr-4 group-hover:animate-bounce filter drop-shadow-lg">🎓</div>
                  <h3 className="text-3xl font-bold text-orange-300 group-hover:text-white transition-colors duration-300">For Students</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">AI Study Companion</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Voice, text, and image-powered learning assistant</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Smart Study Tools</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Flashcards, notes enhancement, PDF analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Progress Tracking</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Grade prediction and learning analytics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-orange-400 rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Personalized Learning</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Adaptive schedules and study recommendations</p>
                    </div>
                  </div>
                </div>
                
                {/* Removed Students section image */}
              </div>
            </div>

            {/* Admins Section */}
            <div className="group relative bg-gradient-to-br from-white/5 to-black/50 backdrop-blur-lg rounded-3xl p-12 border border-white/20 hover:border-orange-400/70 transition-all duration-700 transform hover:scale-105 hover-lift">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-orange-400/20 rounded-full blur-2xl group-hover:animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="text-6xl mr-4 group-hover:animate-bounce filter drop-shadow-lg">👨‍💼</div>
                  <h3 className="text-3xl font-bold text-white group-hover:text-orange-300 transition-colors duration-300">For Admins</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-white rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Course Management</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Create and organize courses with ease</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-white rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Content Creation</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Upload videos, PDFs, and interactive content</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-white rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Assessment Tools</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Build quizzes and track student performance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 group/item">
                    <div className="w-3 h-3 bg-white rounded-full mt-2 group-hover/item:animate-ping"></div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Analytics Dashboard</h4>
                      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Comprehensive insights and reporting</p>
                    </div>
                  </div>
                </div>
                
                {/* Removed Admins section image */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-r from-orange-900/10 to-black/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-bold mb-12 bg-gradient-to-r from-orange-400 via-white to-orange-500 bg-clip-text text-transparent neon-glow">
            Why Choose UniConnect?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="group text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">🚀</div>
              <h3 className="text-xl font-bold mb-2 text-orange-300 group-hover:text-white transition-colors duration-300">Cutting-Edge</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Latest AI and ML technologies</p>
            </div>
            
            <div className="group text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">🔒</div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-300 transition-colors duration-300">Secure</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Enterprise-grade security</p>
            </div>
            
            <div className="group text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">📱</div>
              <h3 className="text-xl font-bold mb-2 text-orange-400 group-hover:text-white transition-colors duration-300">Responsive</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Works on any device</p>
            </div>
            
            <div className="group text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:animate-bounce filter drop-shadow-lg">⚡</div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-300 transition-colors duration-300">Fast</h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Lightning-fast performance</p>
            </div>
          </div>

          {/* Removed Why Choose Us section image */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-bold mb-8 bg-gradient-to-r from-orange-400 via-white to-orange-500 bg-clip-text text-transparent neon-glow animate-shimmer">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of students and educators already experiencing the future of education
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/login"
              className="group relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-12 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-orange-500/50 text-xl overflow-hidden animate-glow"
            >
              <span className="relative z-10">Start Learning Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </Link>
            
            <div className="text-gray-400">
              <p className="text-sm flex items-center"><span className="text-orange-400 mr-2">✨</span> No credit card required</p>
              <p className="text-sm flex items-center"><span className="text-orange-400 mr-2">🚀</span> Get started in seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-500 text-sm border-t border-orange-500/20 backdrop-blur-sm bg-black/20">
        <div className="max-w-6xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} UniConnect Learning Hub. All rights reserved.</p>
          <p className="mt-2">
            <span className="text-orange-400">Powered by Advanced AI</span> • <span className="text-white">Built for the Future of Education</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
