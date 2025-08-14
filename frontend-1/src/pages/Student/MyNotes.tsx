import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:3004/api/notes", {
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
      const res = await fetch("http://localhost:3004/api/notes/upload", {
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
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition text-center flex-1 sm:flex-none"
                  >
                    {isViewable ? '👁️ View' : '⬇️ Download'}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
