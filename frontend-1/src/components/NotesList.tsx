import React, { useState } from "react";

export type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  // Optionally include new fields for organization
  folder?: string;
  tags?: string[];
  color_label?: string;
  icon?: string;
  file_type?: string;
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

type NotesListProps = {
  notes: Note[];
};

export default function NotesList({ notes }: NotesListProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [textContent, setTextContent] = useState<string>("");

  const handleViewNote = async (note: Note) => {
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
    <div className="flex flex-col gap-4">
      {notes.length === 0 && (
        <div className="text-gray-400 text-center">No notes uploaded yet.</div>
      )}
      {notes.map((note) => {
        const filename = note.url.split('/').pop() || '';
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const isViewable = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'md'].includes(ext);
        const fileIcon = note.icon || getFileIcon(filename);

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
                  {(note.file_type || ext).toUpperCase()} • {note.folder || ""} {note.uploadedAt ? `• ${new Date(note.uploadedAt).toLocaleDateString()}` : ""}
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Tags: {note.tags.join(", ")}
                  </div>
                )}
                {note.color_label && (
                  <div className="text-xs" style={{ color: note.color_label }}>
                    Label: {note.color_label}
                  </div>
                )}
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
      {renderViewer()}
    </div>
  );
}
