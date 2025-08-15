import React, { useState, useRef, useEffect } from "react";
import "boxicons/css/boxicons.min.css";

const API_BASE = import.meta.env.VITE_API_URL;

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

const StudyBuddy: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi there! 👋 I'm your Study Buddy. I'm here to help you with your studies, answer questions, explain concepts, and support your learning journey. What would you like to explore today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { 
      sender: "user", 
      text: input.trim(), 
      timestamp: new Date() 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ message: input.trim() }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "AI error");
      }
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            sender: "ai", 
            text: data.reply || "I'm here to help you learn! 📚", 
            timestamp: new Date() 
          },
        ]);
        setIsTyping(false);
      }, 1000);
      
    } catch (err: any) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            sender: "ai", 
            text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄", 
            timestamp: new Date() 
          },
        ]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && input.trim()) {
      sendMessage();
    }
  };

  const quickPrompts = [
    "Explain a concept",
    "Help with homework",
    "Study tips",
    "Quiz me"
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 animate-fade-in-up">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-500 bg-opacity-20 p-3 rounded-xl">
              <i className="bx bx-message-dots text-2xl text-orange-500"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Study Buddy</h1>
              <p className="text-gray-400 text-sm">Your AI learning companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 flex flex-col h-[calc(100vh-200px)] animate-fade-in-up animation-delay-300">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 animate-fade-in-up ${
                  msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.sender === "user" 
                    ? "bg-orange-500" 
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                }`}>
                  <i className={`bx ${
                    msg.sender === "user" ? "bx-user" : "bx-bot"
                  } text-white text-lg`}></i>
                </div>
                
                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[70%] ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white rounded-tr-md"
                      : "bg-gray-700 text-white rounded-tl-md border border-gray-600"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3 animate-fade-in-up">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <i className="bx bx-bot text-white text-lg"></i>
                </div>
                <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-md border border-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-3">Quick prompts to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors border border-gray-600 hover:border-orange-500"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all duration-300"
                  placeholder="Ask me anything about your studies..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading}
                />
                {input && (
                  <button
                    onClick={() => setInput("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <i className="bx bx-x text-lg"></i>
                  </button>
                )}
              </div>
              
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  loading || !input.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform hover:scale-105"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <i className="bx bx-send text-lg"></i>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Study Buddy can make mistakes, always verify important information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
