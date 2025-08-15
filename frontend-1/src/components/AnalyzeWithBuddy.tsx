import React, { useState } from "react";

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

interface AnalyzeWithBuddyProps {
  notes: Note[];
}

const AnalyzeWithBuddy: React.FC<AnalyzeWithBuddyProps> = ({ notes }) => {
  const [modalOpen, setModalOpen] = useState(false);
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/study-assist`, {
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/study-assist`, {
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

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setModalOpen(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setSelectedNote(null);
      setModalOpen(false);
    }
  };

  return (
    <div className="w-full">
      <button
        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded font-semibold transition mb-4"
        onClick={() => setModalOpen(true)}
      >
        Analyze documents with Buddy (AI)
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-orange-500">Select, Upload, or Enter PDF URL</h2>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Choose from uploaded notes:</label>
              <div className="flex flex-col gap-2 max-h-40 overflow-auto">
                {notes.filter(n => n.url.endsWith(".pdf")).map(note => (
                  <button
                    key={note.id}
                    className="bg-gray-100 hover:bg-orange-100 px-3 py-2 rounded text-left"
                    onClick={() => {
                      setSelectedNote(note);
                      setUploadFile(null);
                      setRemotePdfUrl("");
                      setModalOpen(false);
                    }}
                  >
                    {note.name}
                  </button>
                ))}
                {notes.filter(n => n.url.endsWith(".pdf")).length === 0 && (
                  <div className="text-gray-400">No uploaded PDFs found.</div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Or upload a new PDF:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="w-full"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Or enter a remote PDF URL:</label>
              <input
                type="text"
                value={remotePdfUrl}
                onChange={e => {
                  setRemotePdfUrl(e.target.value);
                  setSelectedNote(null);
                  setUploadFile(null);
                }}
                placeholder="https://example.com/document.pdf"
                className="w-full p-2 rounded border border-gray-300"
              />
              <button
                className="mt-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition"
                disabled={!remotePdfUrl.trim()}
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                Use this PDF URL
              </button>
            </div>
          </div>
        </div>
      )}

      {(selectedNote || uploadFile || remotePdfUrl.trim()) && (
        <div className="flex w-full gap-6 mt-6">
          {/* Left: PDF Viewer */}
          <div className="flex-1 bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-orange-500 mb-2">
              {selectedNote
                ? selectedNote.name
                : uploadFile
                ? uploadFile.name
                : remotePdfUrl
                ? remotePdfUrl
                : ""}
            </h3>
            {selectedNote ? (
              <iframe
                src={selectedNote.url}
                title={selectedNote.name}
                width="100%"
                height="500px"
                className="rounded border"
              />
            ) : uploadFile ? (
              <div className="text-gray-400">PDF preview not available for local file. Please upload to view.</div>
            ) : remotePdfUrl.trim() ? (
              <iframe
                src={remotePdfUrl}
                title={remotePdfUrl}
                width="100%"
                height="500px"
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
