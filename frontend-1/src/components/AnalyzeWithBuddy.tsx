import React, { useState } from "react";

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

interface AnalyzeWithBuddyProps {
  notes: Note[];
  refreshNotes?: () => Promise<void>;
}

const AnalyzeWithBuddy: React.FC<AnalyzeWithBuddyProps> = ({ notes, refreshNotes }) => {
  const [view, setView] = useState<"select" | "analyze">("select");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [remotePdfUrl, setRemotePdfUrl] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple Markdown to HTML (bold/underline only)
  function markdownToHtml(text: string) {
    // Bold: **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Underline: __text__
    html = html.replace(/__(.*?)__/g, "<u>$1</u>");
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    return html;
  }

  // Dummy AI response for now
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: "user", text: chatInput }]);
    setLoading(true);

    // Prepare payload for backend
    let payload: any = { question: chatInput };
    if (selectedNote) {
      payload.pdfUrl = selectedNote.url;
    } else if (remotePdfUrl.trim()) {
      payload.pdfUrl = remotePdfUrl.trim();
    }

    // If uploading a file, use FormData
    if (uploadFile) {
      const formData = new FormData();
      formData.append("question", chatInput);
      formData.append("file", uploadFile);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/study-assist`, {
          method: "POST",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
          body: formData,
        });
        const data = await response.json();
        setChatMessages((msgs) => [
          ...msgs,
          { sender: "ai", text: data.answer || "No response from AI." },
        ]);
      } catch (error) {
        setChatMessages((msgs) => [
          ...msgs,
          { sender: "ai", text: "Error contacting AI backend." },
        ]);
      }
    } else {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/study-assist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        setChatMessages((msgs) => [
          ...msgs,
          { sender: "ai", text: data.answer || "No response from AI." },
        ]);
      } catch (error) {
        setChatMessages((msgs) => [
          ...msgs,
          { sender: "ai", text: "Error contacting AI backend." },
        ]);
      }
    }
    setLoading(false);
    setChatInput("");
  };

  // Reset selection and chat
  const handleBack = () => {
    setView("select");
    setSelectedNote(null);
    setUploadFile(null);
    setRemotePdfUrl("");
    setChatMessages([]);
    setChatInput("");
  };

  // Handle selection
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setView("analyze");
    setUploadFile(null);
    setRemotePdfUrl("");
  };

  // Upload PDF to backend and refresh notes list
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setSelectedNote(null);
      setRemotePdfUrl("");
      setView("analyze");

      // Upload to backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: formData,
        });
        if (!response.ok) throw new Error("Upload failed");
        // Optionally, get the uploaded note info
        // const uploadedNote = await response.json();

        // Refresh notes list (if provided by parent)
        if (typeof refreshNotes === "function") {
          await refreshNotes();
        }
      } catch (error) {
        alert("Failed to upload PDF. Please try again.");
      }
    }
  };

  const handleRemoteUrl = () => {
    if (remotePdfUrl.trim()) {
      setSelectedNote(null);
      setUploadFile(null);
      setView("analyze");
    }
  };

  return (
    <div className="w-full">
      {/* Top bar with upload button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-orange-500">Analyze documents with Buddy (AI)</h2>
        {view === "select" && (
          <label className="cursor-pointer flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded font-semibold transition">
            <span className="material-icons" style={{ fontSize: "1.5rem" }}>add</span>
            Upload PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {view === "select" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes List */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-orange-500 mb-4">Your Uploaded PDFs</h3>
            <div className="flex flex-col gap-2 max-h-60 overflow-auto">
              {notes.filter(n => n.url.endsWith(".pdf")).map(note => (
                <button
                  key={note.id}
                  className="bg-gray-100 hover:bg-orange-100 px-3 py-2 rounded text-left transition"
                  onClick={() => handleSelectNote(note)}
                >
                  {note.name}
                </button>
              ))}
              {notes.filter(n => n.url.endsWith(".pdf")).length === 0 && (
                <div className="text-gray-400">No uploaded PDFs found.</div>
              )}
            </div>
          </div>
          {/* Remote PDF URL */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h3 className="font-bold text-orange-500 mb-4">Analyze Remote PDF</h3>
            <input
              type="text"
              value={remotePdfUrl}
              onChange={e => setRemotePdfUrl(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="w-full p-2 rounded border border-gray-300 mb-2"
            />
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition self-end"
              disabled={!remotePdfUrl.trim()}
              onClick={handleRemoteUrl}
            >
              Analyze this PDF
            </button>
          </div>
        </div>
      )}

      {view === "analyze" && (
        <div className="flex flex-col md:flex-row w-full gap-6 mt-6">
          {/* Left: PDF Viewer */}
          <div className="flex-1 bg-white rounded-xl shadow p-4 mb-4 md:mb-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-orange-500">
                {selectedNote
                  ? selectedNote.name
                  : uploadFile
                  ? uploadFile.name
                  : remotePdfUrl
                  ? remotePdfUrl
                  : ""}
              </h3>
              <button
                className="bg-gray-200 hover:bg-orange-100 text-orange-500 px-3 py-1 rounded font-semibold transition"
                onClick={handleBack}
              >
                &larr; Back
              </button>
            </div>
            {selectedNote ? (
              <iframe
                src={selectedNote.url}
                title={selectedNote.name}
                width="100%"
                height="400px"
                className="rounded border"
              />
            ) : uploadFile ? (
              <div className="text-gray-400">PDF preview not available for local file. Please upload to view.</div>
            ) : remotePdfUrl.trim() ? (
              <iframe
                src={remotePdfUrl}
                title={remotePdfUrl}
                width="100%"
                height="400px"
                className="rounded border"
              />
            ) : null}
          </div>
          {/* Right: Chat Interface */}
          <div className="flex-1 bg-gray-900 rounded-xl shadow p-4 flex flex-col">
            <h3 className="font-bold text-orange-400 mb-2">Chat with Buddy (AI)</h3>
            <div className="flex-1 overflow-auto mb-2">
              {chatMessages.length === 0 && !loading && (
                <div className="text-gray-400">Ask questions about the PDF and Buddy will help you analyze it.</div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={`inline-block px-4 py-3 rounded-lg shadow ${
                      msg.sender === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-white text-gray-900 border border-orange-200"
                    } max-w-[80%] break-words`}
                    style={msg.sender === "ai" ? { fontSize: "1rem", lineHeight: "1.6" } : {}}
                  >
                    {msg.sender === "ai" ? (
                      <span dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} />
                    ) : (
                      msg.text
                    )}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start mb-2">
                  <span className="inline-block px-4 py-3 rounded-lg shadow bg-white text-orange-500 border border-orange-200 max-w-[80%] break-words font-semibold">
                    Buddy is thinking...
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2">
<input
  type="text"
  value={chatInput}
  onChange={e => setChatInput(e.target.value)}
  onKeyDown={e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  }}
  placeholder="Ask Buddy about the PDF..."
  className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-700"
/>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeWithBuddy;
