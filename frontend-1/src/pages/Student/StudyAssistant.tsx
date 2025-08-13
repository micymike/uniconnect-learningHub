import React, { useState } from "react";

// Utility function to strip markdown syntax
function stripMarkdown(md: string): string {
  // Remove headings
  md = md.replace(/^#{1,6}\s+/gm, "");
  // Remove bold/italic
  md = md.replace(/(\*\*|__)(.*?)\1/g, "$2");
  md = md.replace(/(\*|_)(.*?)\1/g, "$2");
  // Remove inline code
  md = md.replace(/`([^`]+)`/g, "$1");
  // Remove blockquotes
  md = md.replace(/^>\s?/gm, "");
  // Remove links but keep text
  md = md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove images
  md = md.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
  // Remove unordered lists
  md = md.replace(/^\s*[-+*]\s+/gm, "");
  // Remove ordered lists
  md = md.replace(/^\s*\d+\.\s+/gm, "");
  // Remove horizontal rules
  md = md.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, "");
  // Remove remaining markdown characters
  md = md.replace(/[*_~`]/g, "");
  // Remove extra spaces
  md = md.replace(/\s{2,}/g, " ");
  return md.trim();
}

type QA = {
  question: string;
  answer: string;
};

export default function StudyAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [qaList, setQaList] = useState<QA[]>([]);
  const [error, setError] = useState("");



  const handleAsk = async () => {
    if (!file || !question) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("question", question);
      const response = await fetch("http://localhost:3004/api/ai/study-assist", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to get answer");
      }
      const data = await response.json();
      setQaList((prev) => [...prev, { question, answer: data.answer }]);
      setQuestion("");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        Study Assistant
      </h1>
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Ask a question about your document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            disabled={loading || !file}
          />
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition mt-2"
            onClick={handleAsk}
            disabled={loading || !file || !question}
          >
            {loading ? "Analyzing..." : "Ask"}
          </button>
          {error && (
            <div className="bg-red-900 text-red-300 p-2 rounded mt-2 text-center">{error}</div>
          )}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        {qaList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-4 text-center">
              Q&A History
            </h2>
            <div className="flex flex-col gap-6">
              {qaList.map((qa, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col">
                  <div className="font-semibold text-gray-900 mb-2">
                    Q{idx + 1}: {qa.question}
                  </div>
                  <div className="text-gray-700 mb-2">
                    <span className="font-bold">Answer:</span>
                    <div className="prose prose-sm max-w-none">
                      {typeof qa.answer === "string" ? (
                        <span>{stripMarkdown(qa.answer)}</span>
                      ) : (
                        <span className="text-red-500">[Invalid answer format]</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
