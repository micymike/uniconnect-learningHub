import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, MicOff, Send, BookOpen, MessageCircle, Square, Play, Pause } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * AriaAvatar - Advanced SVG AI Tutor Avatar for React
 * Props:
 *   avatarState: 'idle' | 'speaking' | 'listening'
 *   status: 'idle' | 'speaking' | 'processing'
 */

const AriaAvatar: React.FC<{ avatarState: 'idle' | 'speaking' | 'listening' }> = ({ avatarState }) => {
  // Mouth animation for 'speaking'
  const [mouthOpen, setMouthOpen] = React.useState(5);

  useEffect(() => {
    let raf: number;
    if (avatarState === "speaking") {
      const animate = () => {
        // Simulate mouth movement
        setMouthOpen(10 + Math.abs(Math.sin(Date.now() / 120) * 15));
        raf = requestAnimationFrame(animate);
      };
      animate();
      return () => cancelAnimationFrame(raf);
    } else {
      setMouthOpen(5);
    }
  }, [avatarState]);

  // Status dot color
  let statusColor = "#ef4444"; // idle
  if (avatarState === "speaking") statusColor = "#22c55e";
  else if (avatarState === "listening") statusColor = "#3b82f6";

  // Eyebrow raise for speaking
  const eyebrowY = avatarState === "speaking" ? -5 : 0;

  // Mouth path
  const mouthPath =
    avatarState === "speaking"
      ? `M-25,0 Q0,-${mouthOpen / 2 + 5} 25,0 M-25,0 Q0,${mouthOpen / 2 + 5} 25,0`
      : avatarState === "listening"
      ? `M-25,0 Q0,-2 25,0 M-25,0 Q0,8 25,0`
      : `M-25,0 Q0,-6 25,0 M-25,0 Q0,5 25,0`;

// Ensure mouthPath always starts with "M" for both segments
const mouthPathSegments = mouthPath.split(" ");
const mouthPath1 = mouthPathSegments[0].startsWith("M") ? mouthPathSegments[0] + " " + mouthPathSegments[1] : "M" + mouthPathSegments[0] + " " + mouthPathSegments[1];
const mouthPath2 = mouthPathSegments[2] && mouthPathSegments[2].startsWith("M") ? mouthPathSegments[2] + " " + mouthPathSegments[3] : "M" + mouthPathSegments[2] + " " + mouthPathSegments[3];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Status Indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: statusColor,
            boxShadow: `0 0 10px ${statusColor}`,
            marginRight: 8,
            transition: "background 0.3s"
          }}
        />
        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
          {avatarState === "speaking"
            ? "Speaking..."
            : avatarState === "listening"
            ? "Listening..."
            : "System Idle"}
        </span>
      </div>
      {/* SVG Avatar */}
      <svg
        viewBox="0 0 400 600"
        width={200}
        height={300}
        style={{ filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))", background: "radial-gradient(circle at 50% 50%, #2c3e50 0%, #0f172a 100%)", borderRadius: "20px" }}
      >
        <defs>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffdbac" />
            <stop offset="100%" stopColor="#e0c098" />
          </linearGradient>
        </defs>
        {/* Hair Back */}
        <path d="M120,150 Q200,100 280,150 L300,400 Q200,420 100,400 Z" fill="#2d3748" />
        {/* Neck */}
        <rect x="160" y="300" width="80" height="100" fill="#dcbfa3" />
        {/* Torso */}
        <path d="M50,600 L50,400 Q100,380 200,420 Q300,380 350,400 L350,600 Z" fill="#3b82f6" />
        <path d="M50,600 L50,400 Q100,380 200,420 L200,600 Z" fill="#2563eb" />
        {/* Head Group */}
        <g transform={`translate(0,${eyebrowY})`}>
          <path d="M120,150 Q110,250 130,320 Q200,380 270,320 Q290,250 280,150 Q200,80 120,150" fill="url(#skinGradient)" stroke="#dcbfa3" strokeWidth="2" />
          {/* Cheeks */}
          <ellipse cx="115" cy="220" rx="10" ry="20" fill="#dcbfa3" />
          <ellipse cx="285" cy="220" rx="10" ry="20" fill="#dcbfa3" />
          {/* Hair Front */}
          <path d="M110,160 Q150,80 200,100 Q250,80 290,160 Q290,100 200,60 Q110,100 110,160" fill="#2d3748" />
          {/* Eyebrows */}
          <g>
            <path d="M130,170 Q155,160 180,170" stroke="#5c4033" strokeWidth="4" fill="none" />
            <path d="M220,170 Q245,160 270,170" stroke="#5c4033" strokeWidth="4" fill="none" />
          </g>
          {/* Eyes */}
          <g>
            {/* Left Eye */}
            <ellipse cx="155" cy="200" rx="25" ry="15" fill="white" />
            <circle cx="155" cy="200" r="10" fill="#3b82f6" />
            <circle cx="155" cy="200" r="4" fill="black" />
            <circle cx="158" cy="197" r="3" fill="white" opacity="0.8" />
            {/* Right Eye */}
            <ellipse cx="245" cy="200" rx="25" ry="15" fill="white" />
            <circle cx="245" cy="200" r="10" fill="#3b82f6" />
            <circle cx="245" cy="200" r="4" fill="black" />
            <circle cx="248" cy="197" r="3" fill="white" opacity="0.8" />
          </g>
          {/* Mouth Group */}
          <g transform="translate(200, 300)">
            {/* Inner mouth */}
            <path
              d={`M-20,0 Q0,${mouthOpen} 20,0 Q0,-${mouthOpen} -20,0`}
              fill="#5c2b2b"
            />
            {/* Lips */}
            <path
              d={mouthPath1}
              stroke="#dfa688"
              strokeWidth="3"
              fill="none"
            />
            <path
              d={mouthPath2}
              stroke="#dfa688"
              strokeWidth="3"
              fill="none"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

interface AITeacherProps {}
const API_BASE = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-jqn0.onrender.com/api";
const AITeacher: React.FC<AITeacherProps> = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [conversation, setConversation] = useState<string[]>([]);
  const [blackboardContent, setBlackboardContent] = useState<string[]>([]);
  const [lastReadBlackboardIndex, setLastReadBlackboardIndex] = useState(-1); // Track which blackboard entry was last read
  const [notes, setNotes] = useState('');
  const [suggestedNotes, setSuggestedNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [isTeaching, setIsTeaching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [adaptiveHints, setAdaptiveHints] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionRating, setSessionRating] = useState(0);
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening'>('idle');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [isContinuousTeaching, setIsContinuousTeaching] = useState(false); // UI indicator for continuous mode
  const teachingPausedRef = useRef(false); // Used to pause/resume teaching loop

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setCurrentMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setAvatarState('idle');
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const startTeachingSession = async () => {
    try {
      const formData = new FormData();
      if (topic) formData.append('topic', topic);
      if (pdfFile) formData.append('pdf', pdfFile);

      const response = await fetch(`${API_BASE}/ai/teacher/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      setSessionId(data.sessionId);
      setConversation([`Teacher: ${data.introduction}`]);
      // Always push introduction as first blackboard entry
      setBlackboardContent([data.introduction, data.blackboardContent].filter(Boolean));
      setLastReadBlackboardIndex(-1);
      setIsTeaching(true);
      setIsContinuousTeaching(true);
      teachingPausedRef.current = false;
      // Start continuous teaching loop (do not speak introduction directly)
      setTimeout(() => {
        if (!teachingPausedRef.current) {
          continueTeaching();
        }
      }, 500);
    } catch (error) {
      console.error('Error starting teaching session:', error);
    }
  };

  const sendMessage = async (message: string, isInterruption = false) => {
    if (!sessionId || !message.trim()) return;

    try {
      setAvatarState('listening');
      teachingPausedRef.current = true; // Pause continuous teaching on user input
      
      const response = await fetch(`${API_BASE}/ai/teacher/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          message: message.trim(),
          isInterruption
        })
      });

      const data = await response.json();
      
      setConversation(prev => [...prev, `Student: ${message}`, `Teacher: ${data.response}`]);
      
      // Only add teacher response to blackboard if it is meant to be read aloud
      if (data.blackboardUpdate) {
        setBlackboardContent(prev => [...prev, data.blackboardUpdate]);
      }
      
      if (data.suggestedNotes) {
        setSuggestedNotes(data.suggestedNotes);
      }
      
      if (data.adaptiveHints) {
        setAdaptiveHints(data.adaptiveHints);
      }

      setCurrentMessage('');
      
      // Do NOT speak the teacher response directly; only resume continuous teaching loop
      setTimeout(() => {
        teachingPausedRef.current = false;
        if (isContinuousTeaching) {
          continueTeaching();
        }
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // speakText now accepts an optional callback to run after speech ends
  const speakText = (text: string, onEnd?: () => void) => {
    if (synthRef.current && typeof text === "string") {
      synthRef.current.cancel();
      // Filter out emojis and special characters
      const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      // Add natural pauses
      const sentences = cleanText.split(/[.!?]+/);
      if (sentences.length > 1) {
        utterance.rate = 0.75; // Slower for longer content
      }
      
      utterance.onstart = () => {
        setAvatarState('speaking');
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setAvatarState('idle');
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      synthRef.current.speak(utterance);
    } else if (onEnd) {
      onEnd();
    }
  };

  // Core: Continuous teaching loop
  const continueTeaching = () => {
    if (teachingPausedRef.current) return;
    // Find next unread blackboard entry
    if (blackboardContent.length > 0 && lastReadBlackboardIndex < blackboardContent.length - 1) {
      const nextIndex = lastReadBlackboardIndex + 1;
      setLastReadBlackboardIndex(nextIndex);
      speakText(blackboardContent[nextIndex], () => {
        setTimeout(() => {
          if (!teachingPausedRef.current) {
            continueTeaching();
          }
        }, 500);
      });
    } else {
      // All blackboard entries read, optionally summarize or wait for student input
      // For now, just pause and wait for user
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setAvatarState('listening');
    }
  };

  const saveNotes = async () => {
    if (!sessionId || !notes.trim()) return;

    try {
      await fetch(`${API_BASE}/ai/teacher/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          notes: notes.trim()
        })
      });
      
      setNotes('');
      setSuggestedNotes('');
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addSuggestedNotes = () => {
    setNotes(prev => prev + (prev ? '\n' : '') + suggestedNotes);
    setSuggestedNotes('');
  };

  const interruptSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setAvatarState('idle');
      setIsSpeaking(false);
      teachingPausedRef.current = true;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const submitFeedback = async (rating: number, feedback?: string) => {
    if (!sessionId) return;
    
    try {
      await fetch(`${API_BASE}/ai/teacher/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId,
          rating,
          feedback
        })
      });
      setShowFeedback(false);
      setSessionRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            🤖 Luna AI Teacher Assistant
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } shadow-md`}
          >
            {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        <>
          {!isTeaching ? (
            // Setup Screen
            <div className={`rounded-lg shadow-lg p-8 max-w-2xl mx-auto transition-colors ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white'
            }`}>
              <h2 className="text-2xl font-semibold mb-6 text-center">Start Your Learning Session</h2>
              
              <div className="space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    What would you like to learn about?
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Mathematics, History, Science..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                      darkMode 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upload PDF (Optional)
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    darkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <Upload className={`mx-auto h-12 w-12 mb-4 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <span className="text-indigo-600 hover:text-indigo-500">
                        {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={startTeachingSession}
                  disabled={!topic.trim()}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Start Learning Session
                </button>
              </div>
            </div>
          ) : (
            // Teaching Interface
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-160px)]">
              {/* Left Side - AI Avatar */}
              <div className={`rounded-lg shadow-lg p-6 flex flex-col transition-colors ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-xl font-semibold mb-4 text-center ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>🤖 AI Teacher</h3>
                
                {/* Avatar */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative">
                    <AriaAvatar avatarState={avatarState} />
                    {avatarState === 'speaking' && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full animate-pulse">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                    )}
                    {avatarState === 'listening' && (
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full animate-pulse">
                        <Mic className="h-4 w-4" />
                      </div>
                    )}
                    {isContinuousTeaching && (
                      <div className="absolute -top-2 -left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow animate-pulse">
                        Teaching...
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Interrupt Button */}
                  {isSpeaking && (
                    <button
                      onClick={interruptSpeech}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 animate-pulse"
                    >
                      <Square className="h-4 w-4" />
                      Interrupt AI
                    </button>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your message or use voice..."
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
                    />
                    <button
                      onClick={() => sendMessage(currentMessage)}
                      disabled={!currentMessage.trim()}
                      className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={toggleListening}
                    className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
                      isListening 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? 'Stop Listening' : 'Start Voice Input'}
                  </button>
                </div>
              </div>

              {/* Middle - Blackboard */}
              <div className={`rounded-lg shadow-lg p-6 transition-colors ${
                darkMode ? 'bg-gray-900' : 'bg-gray-900'
              }`}>
                <h3 className="text-xl font-semibold mb-4 text-center text-green-400 font-mono">📋 Digital Blackboard</h3>
                <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto" style={{
                  fontFamily: 'Chalkduster, "Permanent Marker", cursive',
                  backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}>
                  {blackboardContent.map((content, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-700/50 rounded border-l-4 border-green-400">
                      <Markdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({children, ...props}) => <p className="mb-2 text-green-300" {...props}>{children}</p>,
                          ul: ({children, ...props}) => <ul className="list-disc list-inside text-green-300" {...props}>{children}</ul>,
                          li: ({children, ...props}) => <li className="mb-1 text-green-300" {...props}>{children}</li>,
                          strong: ({children, ...props}) => <strong className="text-green-200 font-bold" {...props}>{children}</strong>
                        }}
                      >
                        {content}
                      </Markdown>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Notes and Conversation */}
              <div className="space-y-4">
                {/* Notes Section */}
                <div className={`rounded-lg shadow-lg p-4 transition-colors ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>📝 Your Notes</h3>
                
                {suggestedNotes && (
                  <div className={`mb-3 p-3 border rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-yellow-900/30 border-yellow-600 text-yellow-200' 
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                    <p className="text-sm mb-2 font-medium">💡 Suggested notes:</p>
                    <Markdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children, ...props}) => <p className="text-sm" {...props}>{children}</p>,
                        ul: ({children, ...props}) => <ul className="list-disc list-inside text-sm" {...props}>{children}</ul>,
                        li: ({children, ...props}) => <li className="mb-1 text-sm" {...props}>{children}</li>,
                        strong: ({children, ...props}) => <strong className="font-bold" {...props}>{children}</strong>
                      }}
                    >
                      {suggestedNotes}
                    </Markdown>
                    <button
                      onClick={addSuggestedNotes}
                      className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                    >
                      Add to Notes
                    </button>
                  </div>
                )}

                {adaptiveHints && (
                  <div className={`mb-3 p-3 border rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-purple-900/30 border-purple-600 text-purple-200' 
                      : 'bg-purple-50 border-purple-200 text-purple-800'
                  }`}>
                    <p className="text-sm mb-2 font-medium">🎯 Study Tips:</p>
                    <Markdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({children, ...props}) => <p className="text-sm" {...props}>{children}</p>,
                        ul: ({children, ...props}) => <ul className="list-disc list-inside text-sm" {...props}>{children}</ul>,
                        li: ({children, ...props}) => <li className="mb-1 text-sm" {...props}>{children}</li>,
                        strong: ({children, ...props}) => <strong className="font-bold" {...props}>{children}</strong>
                      }}
                    >
                      {adaptiveHints}
                    </Markdown>
                    <button
                      onClick={() => setAdaptiveHints('')}
                      className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                )}

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes during the lesson..."
                  className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none transition-colors ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                />
                
                <div className="flex gap-1 mb-4">
                  <button
                    onClick={saveNotes}
                    disabled={!notes.trim()}
                    className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm transition-colors"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm transition-colors"
                  >
                    Rate Session
                  </button>
                  <button
                    onClick={() => setIsTeaching(false)}
                    className="bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm transition-colors"
                  >
                    End Session
                  </button>
                  <button
                    onClick={() => {
                      setIsContinuousTeaching((prev) => {
                        const next = !prev;
                        teachingPausedRef.current = !next;
                        if (next) continueTeaching();
                        return next;
                      });
                    }}
                    className={`ml-2 py-2 px-3 rounded-lg text-sm transition-colors ${
                      isContinuousTeaching
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                  >
                    {isContinuousTeaching ? <Pause className="inline h-4 w-4 mr-1" /> : <Play className="inline h-4 w-4 mr-1" />}
                    {isContinuousTeaching ? 'Pause Teaching' : 'Resume Teaching'}
                  </button>
                </div>

                {/* Conversation History */}
                <div className={`rounded-lg p-3 transition-colors ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h4 className={`font-medium mb-2 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>💬 Recent Conversation</h4>
                  <div className="h-32 overflow-y-auto space-y-2">
                    {conversation.slice(-4).map((msg, index) => (
                      <div key={index} className={`p-2 rounded text-xs ${
                        msg.startsWith('Teacher:') 
                          ? (darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800')
                          : (darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800')
                      }`}>
                        <strong>{msg.split(':')[0]}:</strong>
                        <Markdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({children, ...props}) => <p className="inline ml-1 text-xs" {...props}>{children}</p>,
                            ul: ({children, ...props}) => <ul className="list-disc list-inside text-xs" {...props}>{children}</ul>,
                            li: ({children, ...props}) => <li className="mb-1 text-xs" {...props}>{children}</li>,
                            strong: ({children, ...props}) => <strong className="font-bold" {...props}>{children}</strong>
                          }}
                        >
                          {msg.substring(msg.indexOf(':') + 1)}
                        </Markdown>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </div>
            </>
          )}

        </>
        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white'
            }`}>
              <h3 className="text-lg font-semibold mb-4">Rate this session</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSessionRating(star)}
                    className={`text-2xl ${
                      star <= sessionRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => submitFeedback(sessionRating)}
                  disabled={sessionRating === 0}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITeacher;
