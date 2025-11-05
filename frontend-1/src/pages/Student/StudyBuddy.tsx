import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import "boxicons/css/boxicons.min.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://app.uniconnect-learninghub.co.ke/api";
const MAX_MESSAGES = 50; // Limit message history

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  imageUrl?: string;
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [context, setContext] = useState<any>({});
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch context (notes, quiz results, learning path) on mount
  useEffect(() => {
    const fetchContext = async () => {
      const token = localStorage.getItem("token") || "";
      try {
        // Fetch notes
        const notesRes = await fetch(`${API_BASE}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const notesData = await notesRes.json();
        const notes = (notesData.notes || []).map((n: any) => n.content || n.text || n.name || "").filter(Boolean);

        // Fetch quiz results (mocked for now)
        const quizResults: any[] = [];

        // Fetch learning path
        const lpRes = await fetch(`${API_BASE}/ai/learning-path`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            performanceData: {
              quizResults: [],
              notes: [],
              completedLessons: [],
            },
          }),
        });
        const lpData = await lpRes.json();
        const learningPath = lpData.learningPath || [];

        setContext({
          notes,
          quizResults,
          learningPath,
        });
      } catch (err) {
        setContext({});
      }
    };
    fetchContext();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const cleanupImage = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
  }, [imagePreview]);

  // Unified sendMessage: sends text, or text+image if image attached
  const sendMessage = async () => {
    if (!input.trim() && !imageFile) return;

    const userMessage: Message = {
      sender: "user",
      text: input.trim() || (imageFile ? "Uploaded an image" : ""),
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      return newMessages.length > MAX_MESSAGES ? newMessages.slice(-MAX_MESSAGES) : newMessages;
    });
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");

      let res, data;
      if (imageFile) {
        // Send both text and image as multipart/form-data to /ai/chat
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("message", input.trim());
        formData.append("context", JSON.stringify(context));

        res = await fetch(`${API_BASE}/ai/chat`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token || ""}`,
          },
          body: formData,
        });
        data = await res.json();
      } else {
        // Send text and context as JSON to agent-based endpoint
        res = await fetch(`${API_BASE}/ai/agents-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ message: input.trim(), context }),
        });
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || "AI error");
      }

      timeoutRef.current = setTimeout(() => {
        setMessages((prev) => {
          const newMessages = [
            ...prev,
            {
              sender: "ai" as "ai",
              text:
                imageFile
                  ? data.reply || data.explanation || "Here's what I see in your image."
                  : data.reply || data.answer || "I'm here to help you learn! 📚",
              timestamp: new Date(),
            },
          ];
          return newMessages.length > MAX_MESSAGES ? newMessages.slice(-MAX_MESSAGES) : newMessages;
        });
        setIsTyping(false);
      }, 1000);
    } catch (err: any) {
      timeoutRef.current = setTimeout(() => {
        setMessages((prev) => {
          const newMessages = [
            ...prev,
            {
              sender: "ai" as "ai",
              text: imageFile
                ? "Sorry, I couldn't analyze the image. Please try again! 🔄"
                : "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
              timestamp: new Date(),
            },
          ];
          return newMessages.length > MAX_MESSAGES ? newMessages.slice(-MAX_MESSAGES) : newMessages;
        });
        setIsTyping(false);
      }, 1000);
    } finally {
      setLoading(false);
      cleanupImage();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && (input.trim() || imageFile)) {
      sendMessage();
    }
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) { // 5MB limit
      cleanupImage(); // Clean up previous image
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [cleanupImage]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file && file.size < 5 * 1024 * 1024) { // 5MB limit
          cleanupImage(); // Clean up previous image
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (ev) => setImagePreview(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      }
    }
  }, [cleanupImage]);

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
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 sm:px-6 sm:py-4 animate-fade-in-up flex-shrink-0">
        <div className="flex items-center justify-between mx-auto w-full">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-orange-500 bg-opacity-20 p-2 sm:p-3 rounded-xl">
              <i className="bx bx-message-dots text-xl sm:text-2xl text-orange-500"></i>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Study Buddy</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Your AI learning companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs sm:text-sm font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6 bg-gray-800">
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
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded" className="mb-2 rounded-lg max-w-xs" />
                    )}
                    {msg.sender === "ai" ? (
                      <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                            li: ({children}) => <li className="mb-1">{children}</li>,
                            code: ({children}) => <code className="bg-gray-600 px-1 py-0.5 rounded text-xs">{children}</code>,
                            pre: ({children}) => <pre className="bg-gray-600 p-2 rounded mt-2 overflow-x-auto text-xs">{children}</pre>,
                            strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
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
        <div className="px-2 py-3 sm:px-6 sm:py-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
          <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">Quick prompts to get started:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInput(prompt)}
                className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs sm:text-sm rounded-lg transition-colors border border-gray-600 hover:border-orange-500"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-2 py-3 sm:px-6 sm:py-4 border-t border-gray-700 bg-gray-800 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-2 sm:space-y-0">
            {imagePreview && (
              <div className="flex items-center space-x-1 mb-2 sm:mb-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-lg"
                  style={{ width: 40, height: 40, objectFit: "cover" }}
                />
                <button
                  onClick={cleanupImage}
                  className="text-gray-400 hover:text-red-500 text-xs ml-1"
                  title="Remove"
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            )}
            <div className="flex-1 relative flex items-center w-full">
              <input
                ref={inputRef}
                type="text"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all duration-300 text-sm sm:text-base"
                placeholder="Ask me anything about your studies... (or what to do with your image)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onPaste={handlePaste}
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
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              onChange={handleImageChange}
              disabled={loading}
            />
            <label htmlFor="image-upload" className="cursor-pointer mt-2 sm:mt-0">
              <span className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-700 border border-gray-600 rounded-xl text-white hover:bg-gray-600 transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base">
                <i className="bx bx-image text-lg"></i>
                <span>Upload Photo</span>
              </span>
            </label>
            <button
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !imageFile)}
              className={`mt-2 sm:mt-0 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-base ${
                loading || (!input.trim() && !imageFile)
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
          {/* Image preview is now inside the input area */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • You can upload or paste a photo and type what you want Study Buddy to do with it
        </p>
      </div>
    </div>
  );
};

export default StudyBuddy;
