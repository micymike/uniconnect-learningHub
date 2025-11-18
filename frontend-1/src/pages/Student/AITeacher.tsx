import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, MicOff, Send, BookOpen, MessageCircle } from 'lucide-react';
import  Markdown  from 'react-markdown';

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
              d={mouthPath.split(" ")[0]}
              stroke="#dfa688"
              strokeWidth="3"
              fill="none"
            />
            <path
              d={mouthPath.split(" ")[1]}
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
  const [notes, setNotes] = useState('');
  const [suggestedNotes, setSuggestedNotes] = useState('');
  const [topic, setTopic] = useState('');
  const [isTeaching, setIsTeaching] = useState(false);
  const [isLoading, setIsloading] = useState(false); // New state variable for loading indicator
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening'>('idle');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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
      setBlackboardContent([data.blackboardContent]);
      setIsTeaching(true);
      
      // Speak the introduction
      speakText(data.introduction);
    } catch (error) {
      console.error('Error starting teaching session:', error);
    }
  };

  const sendMessage = async (message: string, isInterruption = false) => {
    if (!sessionId || !message.trim()) return;

    try {
      setAvatarState('listening');
      
      const response = await fetch(`${API_BASE}/api/ai/teacher/continue`, {
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
      
      if (data.blackboardUpdate) {
        setBlackboardContent(prev => [...prev, data.blackboardUpdate]);
      }
      
      if (data.suggestedNotes) {
        setSuggestedNotes(data.suggestedNotes);
      }

      setCurrentMessage('');
      
      // Speak the response
      speakText(data.response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onstart = () => setAvatarState('speaking');
      utterance.onend = () => setAvatarState('idle');
      synthRef.current.speak(utterance);
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
      await fetch(`${API_BASE}/api/ai/teacher/notes`, {
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

  return (
    <div className="min-h-screen bg-primary  p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          🤖 Luna AI Teacher Assistant
        </h1>

        <>
          {!isTeaching ? (
            // Setup Screen
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">Start Your Learning Session</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to learn about?
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Mathematics, History, Science..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PDF (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
              {/* Left Side - AI Avatar */}
              <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-center">🤖 AI Teacher</h3>
                
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
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your message or use voice..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
                    />
                    <button
                      onClick={() => sendMessage(currentMessage)}
                      className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"
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

              {/* Right Side - Blackboard and Notes */}
              <div className="space-y-6">
                {/* Blackboard */}
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 text-white h-1/2">
                  <h3 className="text-xl font-semibold mb-4 text-center text-green-400">📋 Blackboard</h3>
                  <div className="bg-gray-800 rounded-lg p-4 h-5/6 overflow-y-auto font-mono text-sm">
                    {blackboardContent.map((content, index) => (
                      <div key={index} className="mb-4 p-3 bg-gray-700 rounded border-l-4 border-green-400">
                        <pre className="whitespace-pre-wrap text-green-300">{content}</pre>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 h-1/2">
                  <h3 className="text-xl font-semibold mb-4">📝 Your Notes</h3>
                
                {suggestedNotes && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">Suggested notes:</p>
                    <p className="text-sm text-gray-700">{suggestedNotes}</p>
                    <button
                      onClick={addSuggestedNotes}
                      className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Add to Notes
                    </button>
                  </div>
                )}

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes during the lesson..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    disabled={!notes.trim()}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setIsTeaching(false)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    End Session
                  </button>
                </div>
                </div>
              </div>
            </div>
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h4 className="font-medium mb-4">💬 Conversation History</h4>
                <div className="h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                  {conversation.map((msg, index) => (
                    <div key={index} className={`mb-3 p-2 rounded ${msg.startsWith('Teacher:') ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      <strong>{msg.split(':')[0]}:</strong> {msg.substring(msg.indexOf(':') + 1)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </>
      </div>
    </div>
  );
};

export default AITeacher;
