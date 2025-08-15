import React, { useState, useEffect } from "react";
import MyNotes from "./MyNotes";
import AnalyzeWithBuddy from "../../components/AnalyzeWithBuddy";

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export default function MyNotesWithBuddy() {
  const [notes, setNotes] = useState<Note[]>([]);

  // Fetch notes from API (same logic as MyNotes)
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3004/api";
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
        setNotes(notes);
      } catch {
        setNotes([]);
      }
    };
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        My Notes & Buddy AI
      </h1>
      <div className="w-full max-w-5xl flex flex-col gap-8">
        <MyNotes />
        <AnalyzeWithBuddy notes={notes} />
      </div>
    </div>
  );
}
