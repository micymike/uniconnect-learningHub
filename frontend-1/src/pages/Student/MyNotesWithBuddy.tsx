import React, { useState, useEffect } from "react";
import AnalyzeWithBuddy from "../../components/AnalyzeWithBuddy";

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
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3004/api";
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
      setNotes(notes.filter((n: Note) => n.url.endsWith(".pdf")));
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
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-orange-400 mb-8 text-center">
        Analyze documents with Buddy (AI)
      </h1>
      <div className="w-full max-w-6xl flex flex-col">
        {loading ? (
          <div className="text-center text-orange-400 font-semibold py-8">Loading notes...</div>
        ) : error ? (
          <div className="text-center text-red-500 font-semibold py-8">
            {error}
            <button
              className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition"
              onClick={fetchNotes}
            >
              Retry
            </button>
          </div>
        ) : (
          <AnalyzeWithBuddy notes={notes} refreshNotes={fetchNotes} />
        )}
      </div>
    </div>
  );
}
