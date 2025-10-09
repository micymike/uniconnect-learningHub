import React, { useState, useEffect } from "react";
import NoteOrganizer from "../../components/NoteOrganizer";
import type { NoteFilter } from "../../components/NoteOrganizer";
import NotesList from "../../components/NotesList";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend-yspz.onrender.com/api";

export default function OrganizedNotes() {
  // State for folders, tags, and notes
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<NoteFilter>({
    search: "",
    folder: "",
    tags: [],
    colorLabel: "",
    fileType: "",
    dateFrom: "",
    dateTo: "",
    icon: "",
  });
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Upload form state
  const [noteName, setNoteName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [colorLabel, setColorLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [fileType, setFileType] = useState("");
  const [ocrText, setOcrText] = useState("");

  // Fetch notes with filters
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, [filter]);

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      // Example: send filter as query params (backend must support)
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (
          value &&
          (typeof value === "string" ||
            typeof value === "number" ||
            (Array.isArray(value) && value.length > 0 && typeof value[0] === "string"))
        ) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      const res = await fetch(`${API_URL}/notes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notes");
      const data = await res.json();
      setNotes(data.notes || []);
      // Extract folders/tags from notes for organizer options
      setFolders(Array.from(new Set((data.notes || []).map((n: any) => n.folder).filter(Boolean))));
      setTags(Array.from(new Set((data.notes || []).flatMap((n: any) => n.tags || []))));
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  // Upload note with new fields
  const handleUpload = async () => {
    setError("");
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (!noteName.trim()) {
      setError("Please enter a note name.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("File size must be less than 3MB.");
      return;
    }
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("name", noteName.trim());
      formData.append("contentType", file.type || "application/octet-stream");
      formData.append("folder", folder);
      formData.append("tags", noteTags.join(","));
      formData.append("color_label", colorLabel);
      formData.append("icon", icon);
      formData.append("file_type", fileType);
      formData.append("ocr_text", ocrText);
      const res = await fetch(`${API_URL}/notes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setNoteName("");
      setFile(null);
      setFolder("");
      setNoteTags([]);
      setColorLabel("");
      setIcon("");
      setFileType("");
      setOcrText("");
      fetchNotes();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
  };

  // Organizer callbacks
  const handleFilterChange = (f: any) => setFilter(f);
  const handleCreateFolder = (newFolder: string) => {
    if (!folders.includes(newFolder)) setFolders([...folders, newFolder]);
    setFolder(newFolder);
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        Organized Notes
      </h1>
      <NoteOrganizer
        onFilterChange={handleFilterChange}
        onCreateFolder={handleCreateFolder}
        availableFolders={folders}
        availableTags={tags}
      />
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Note name"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mp3,.zip,.ppt,.pptx,.xls,.xlsx"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          >
            <option value="">Select folder</option>
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={noteTags.join(",")}
            onChange={(e) => setNoteTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={colorLabel}
            onChange={(e) => setColorLabel(e.target.value)}
          >
            <option value="">Color label</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="gray">Gray</option>
          </select>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            <option value="">Icon</option>
            <option value="📚">Book</option>
            <option value="📝">Exam</option>
            <option value="🎤">Lecture</option>
            <option value="🧪">Lab</option>
            <option value="📎">Default</option>
          </select>
          <select
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <option value="">File type</option>
            <option value="pdf">PDF</option>
            <option value="doc">DOC</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
            <option value="md">MD</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="OCR text (optional)"
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
          />
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition mt-2"
            onClick={handleUpload}
          >
            Upload Note
          </button>
          {error && (
            <div className="bg-red-900 text-red-300 p-2 rounded mt-2 text-center">{error}</div>
          )}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mb-4 text-center">
          Your Notes
        </h2>
        {loading ? (
          <div className="text-gray-400 text-center">Loading notes...</div>
        ) : (
          <NotesList notes={notes} />
        )}
      </div>
    </div>
  );
}
