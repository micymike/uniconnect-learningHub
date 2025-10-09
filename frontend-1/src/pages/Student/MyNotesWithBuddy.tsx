import React, { useState, useEffect } from "react";
import AnalyzeWithBuddy from "../../components/AnalyzeWithBuddy";
import "boxicons/css/boxicons.min.css";

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export default function MyNotesWithBuddy() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes from API
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend-yspz.onrender.com/api";
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      const notes = (data.notes || []).map((n: any) => ({
        ...n,
        uploadedAt: n.uploaded_at,
      }));
setNotes(notes.filter((n: Note) => n.url && n.url.endsWith(".pdf")));
    } catch (err: any) {
      setNotes([]);
      setError(err.message || "Error fetching notes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
          <i className="bx bx-brain text-orange-500 mr-3"></i>
          AI Document Analyzer
        </h1>
        <p className="text-gray-400 text-lg">Upload PDFs and chat with AI to analyze your documents</p>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-white text-lg">Loading your documents...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-700 text-red-300 px-6 py-8 rounded-2xl text-center animate-fade-in-up">
            <i className="bx bx-error-circle text-4xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Error Loading Documents</h3>
            <p className="mb-4">{error}</p>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
              onClick={fetchNotes}
            >
              <i className="bx bx-refresh"></i>
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up animation-delay-300">
            <AnalyzeWithBuddy notes={notes} refreshNotes={fetchNotes} />
          </div>
        )}
      </div>
    </div>
  );
}
