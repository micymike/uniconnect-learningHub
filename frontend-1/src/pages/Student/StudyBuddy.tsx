import React, { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

interface Message {
  sender: "user" | "ai";
  text: string;
}

const StudyBuddy: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi there! 👋 I'm your Study Buddy. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call AI backend (replace endpoint as needed)
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "AI error");
      }
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "I'm here to help!" },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I couldn't process your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col items-center">
      <div className="w-full max-w-2xl mt-10 bg-white rounded-xl shadow-lg flex flex-col h-[70vh]">
        <div className="flex items-center justify-center py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">Study Buddy</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] text-base ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
              loading || !input.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
            }`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyBuddy;
