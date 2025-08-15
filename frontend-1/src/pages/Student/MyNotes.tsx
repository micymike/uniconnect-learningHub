import React, { useState, useEffect } from "react";

// do not change this file

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3004/api";

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const icons: Record<string, string> = {
    pdf: '📄', doc: '📝', docx: '📝', txt: '📄', md: '📄',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️',
    mp4: '🎥', mp3: '🎵', zip: '📦',
    ppt: '📊', pptx: '📊', xls: '📊', xlsx: '📊'
  };
  return icons[ext] || '📎';
};

export default function MyNotes() {
  const [file, setFile] = useState<File | null>(null);
  const [noteName, setNoteName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [textContent, setTextContent] = useState<string>("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
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
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

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
    setUploading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("name", noteName.trim());
      formData.append("contentType", file.type || "application/octet-stream");
      const res = await fetch(`${API_URL}/notes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setNoteName("");
      setFile(null);
      await fetchNotes();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

const handleViewNote = async (note: Note) => {
  console.log("View button clicked for note:", note);
  setSelectedNote(note);
  const filename = note.url.split('/').pop() || '';
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['txt', 'md'].includes(ext)) {
    try {
      const res = await fetch(note.url);
      const text = await res.text();
      setTextContent(text);
    } catch {
      setTextContent("Failed to load text content.");
    }
  } else {
    setTextContent("");
  }
};

  const renderViewer = () => {
  if (!selectedNote) return null;
  console.log("Rendering modal for note:", selectedNote);
  const filename = selectedNote.url.split('/').pop() || '';
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl relative flex flex-col items-center">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            onClick={() => setSelectedNote(null)}
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-orange-500">{selectedNote.name}</h2>
          <iframe
            src={selectedNote.url}
            title={selectedNote.name}
            width="100%"
            height="600px"
            className="rounded border"
          />
        </div>
      </div>
    );
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative flex flex-col items-center">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            onClick={() => setSelectedNote(null)}
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-orange-500">{selectedNote.name}</h2>
          <img src={selectedNote.url} alt={selectedNote.name} className="max-w-full max-h-[500px] rounded" />
        </div>
      </div>
    );
  }
  if (['txt', 'md'].includes(ext)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative flex flex-col items-center">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
            onClick={() => setSelectedNote(null)}
          >
            &times;
          </button>
          <h2 className="text-xl font-bold mb-4 text-orange-500">{selectedNote.name}</h2>
          <pre className="bg-gray-100 rounded p-4 w-full max-h-[400px] overflow-auto text-sm text-gray-800">{textContent}</pre>
        </div>
      </div>
    );
  }
  // For other files, show download button
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
          onClick={() => setSelectedNote(null)}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-orange-500">{selectedNote.name}</h2>
        <a
          href={selectedNote.url}
          download
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded font-semibold transition"
        >
          Download File
        </a>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        My Notes
      </h1>
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-lg mb-8">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Note name"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
            disabled={uploading}
          />
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mp3,.zip,.ppt,.pptx,.xls,.xlsx"
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
            {file && (
              <div className="mt-2 text-sm text-gray-400">
                {getFileIcon(file.name)} {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition mt-2"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Note"}
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
        <div className="flex flex-col gap-4">
          {loading && (
            <div className="text-gray-400 text-center">Loading notes...</div>
          )}
          {!loading && notes.length === 0 && (
            <div className="text-gray-400 text-center">No notes uploaded yet.</div>
          )}
          {!loading && notes.map((note) => {
            const filename = note.url.split('/').pop() || '';
            const ext = filename.split('.').pop()?.toLowerCase() || '';
            const isViewable = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'md'].includes(ext);
            const fileIcon = getFileIcon(filename);

            return (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{fileIcon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{note.name}</div>
                    <div className="text-xs text-gray-500">
                      {ext.toUpperCase()} • {new Date(note.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
{isViewable ? (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      handleViewNote(note);
    }}
    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition text-center flex-1 sm:flex-none"
  >
    👁️ View
  </button>
) : (
  <a
    href={note.url}
    download
    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition text-center flex-1 sm:flex-none"
  >
    ⬇️ Download
  </a>
)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {renderViewer()}
    </div>
  );
}
