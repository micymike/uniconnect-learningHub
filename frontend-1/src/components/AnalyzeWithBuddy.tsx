import React, { useState, useRef, useEffect } from "react";
import "boxicons/css/boxicons.min.css";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-jqn0.onrender.com/api";

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
  const [dragActive, setDragActive] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
        const response = await fetch(`${API_URL}/ai/study-assist`, {
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
        const response = await fetch(`${API_URL}/ai/study-assist`, {
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
    setChatMessages([]);
    setChatInput("");
  };

  const handleRemoteUrl = () => {
    if (remotePdfUrl.trim()) {
      setSelectedNote(null);
      setUploadFile(null);
      setView("analyze");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        handleUploadFile(file);
      }
    }
  };

  const handleUploadFile = async (file: File) => {
    setUploadFile(file);
    setSelectedNote(null);
    setRemotePdfUrl("");
    setView("analyze");

    // Upload to backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("contentType", file.type);
    formData.append("file_type", "pdf");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/notes/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");

      // Refresh notes list
      if (typeof refreshNotes === "function") {
        await refreshNotes();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="w-full">
      {view === "select" && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <i className="bx bx-cloud-upload text-orange-500 mr-2"></i>
              Upload New PDF
            </h2>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                dragActive 
                  ? 'border-orange-500 bg-orange-500 bg-opacity-10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              
              <div className="text-gray-400">
                <i className="bx bx-file-pdf text-6xl mb-4 block text-red-500"></i>
                <p className="text-lg font-medium mb-2">Drop PDF here or click to browse</p>
                <p className="text-sm">Only PDF files are supported</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notes List */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <i className="bx bx-library text-orange-500 mr-2"></i>
Your PDF Documents ({notes.filter(n => n.url && n.url.endsWith(".pdf")).length})
              </h3>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
{notes.filter(n => n.url && n.url.endsWith(".pdf")).map((note, index) => (
  <button
                    key={note.id || index}
                    className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-orange-500 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleSelectNote(note)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-500 bg-opacity-20 p-2 rounded-lg">
                        <i className="bx bx-file-pdf text-red-500 text-xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate group-hover:text-orange-500 transition-colors">
                          {note.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(note.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <i className="bx bx-right-arrow-alt text-gray-400 group-hover:text-orange-500 transition-colors"></i>
                    </div>
                  </button>
                ))}
                
{notes.filter(n => n.url && n.url.endsWith(".pdf")).length === 0 && (
  <div className="text-center py-12">
                    <i className="bx bx-file-pdf text-6xl text-gray-600 mb-4"></i>
                    <h4 className="text-lg font-semibold text-white mb-2">No PDF documents found</h4>
                    <p className="text-gray-400">Upload your first PDF to get started</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Remote PDF URL */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <i className="bx bx-link text-orange-500 mr-2"></i>
                Analyze Remote PDF
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    PDF URL
                  </label>
                  <input
                    type="url"
                    value={remotePdfUrl}
                    onChange={e => setRemotePdfUrl(e.target.value)}
                    placeholder="https://example.com/document.pdf"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all"
                  />
                </div>
                
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    !remotePdfUrl.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform hover:scale-105'
                  }`}
                  disabled={!remotePdfUrl.trim()}
                  onClick={handleRemoteUrl}
                >
                  <i className="bx bx-analyse"></i>
                  <span>Analyze PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "analyze" && (
        <div className="space-y-6">
          {/* Header with Back Button */}
          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-500 bg-opacity-20 p-2 rounded-lg">
                  <i className="bx bx-file-pdf text-red-500 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-white truncate">
                    {selectedNote
                      ? selectedNote.name
                      : uploadFile
                      ? uploadFile.name
                      : remotePdfUrl
                      ? new URL(remotePdfUrl).pathname.split('/').pop()
                      : "Document"}
                  </h3>
                  <p className="text-gray-400 text-sm">AI Document Analysis</p>
                </div>
              </div>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                onClick={handleBack}
              >
                <i className="bx bx-arrow-back"></i>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* PDF Viewer */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <i className="bx bx-show text-orange-500 mr-2"></i>
                Document Preview
              </h3>
              
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                {selectedNote ? (
                  <iframe
                    src={selectedNote.url}
                    title={selectedNote.name}
                    className="w-full h-96 lg:h-[500px] rounded-lg border border-gray-600"
                  />
                ) : uploadFile ? (
                  <div className="h-96 lg:h-[500px] flex items-center justify-center text-center">
                    <div>
                      <i className="bx bx-file-pdf text-6xl text-red-500 mb-4"></i>
                      <h4 className="text-lg font-semibold text-white mb-2">PDF Uploaded</h4>
                      <p className="text-gray-400">Preview will be available after processing</p>
                    </div>
                  </div>
                ) : remotePdfUrl.trim() ? (
                  <iframe
                    src={remotePdfUrl}
                    title="Remote PDF"
                    className="w-full h-96 lg:h-[500px] rounded-lg border border-gray-600"
                  />
                ) : (
                  <div className="h-96 lg:h-[500px] flex items-center justify-center">
                    <p className="text-gray-400">No document selected</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Interface */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <i className="bx bx-bot text-orange-500 mr-2"></i>
                  Chat with AI Buddy
                </h3>
                <p className="text-gray-400 text-sm mt-1">Ask questions about your document</p>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <i className="bx bx-message-dots text-4xl text-gray-600 mb-3"></i>
                    <p className="text-gray-400">Start a conversation about your document</p>
                    <p className="text-gray-500 text-sm mt-1">Ask questions, request summaries, or get explanations</p>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 animate-fade-in-up ${
                      msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === "user" 
                        ? "bg-orange-500" 
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}>
                      <i className={`bx ${
                        msg.sender === "user" ? "bx-user" : "bx-bot"
                      } text-white text-sm`}></i>
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`flex-1 max-w-[85%] ${
                      msg.sender === "user" ? "text-right" : "text-left"
                    }`}>
                      <div className={`inline-block px-4 py-3 rounded-2xl shadow-lg ${
                        msg.sender === "user"
                          ? "bg-orange-500 text-white rounded-tr-md"
                          : "bg-gray-700 text-white rounded-tl-md border border-gray-600"
                      }`}>
                        {msg.sender === "ai" ? (
                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} 
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex items-start space-x-3 animate-fade-in-up">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <i className="bx bx-bot text-white text-sm"></i>
                    </div>
                    <div className="bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-md border border-gray-600">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !loading && chatInput.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about the document..."
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all"
                    disabled={loading}
                  />
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !chatInput.trim()}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      loading || !chatInput.trim()
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform hover:scale-105'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Sending</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Send</span>
                        <i className="bx bx-send"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeWithBuddy;
