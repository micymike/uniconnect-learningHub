import React, { useState, useEffect, useRef } from "react";
import "boxicons/css/boxicons.min.css";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend.onrender.com";

type Note = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  file_type?: string;
  tags?: string[];
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const icons: Record<string, string> = {
    pdf: 'bx bxs-file-pdf', doc: 'bx bxs-file-doc', docx: 'bx bxs-file-doc', 
    txt: 'bx bx-file', md: 'bx bx-file',
    png: 'bx bxs-image', jpg: 'bx bxs-image', jpeg: 'bx bxs-image', gif: 'bx bxs-image',
    mp4: 'bx bx-video', mp3: 'bx bx-music', zip: 'bx bxs-archive',
    ppt: 'bx bx-slideshow', pptx: 'bx bx-slideshow', 
    xls: 'bx bx-spreadsheet', xlsx: 'bx bx-spreadsheet'
  };
  return icons[ext] || 'bx bx-file';
};

const getFileColor = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const colors: Record<string, string> = {
    pdf: 'text-red-500', doc: 'text-blue-500', docx: 'text-blue-500',
    txt: 'text-gray-500', md: 'text-gray-500',
    png: 'text-green-500', jpg: 'text-green-500', jpeg: 'text-green-500', gif: 'text-green-500',
    mp4: 'text-purple-500', mp3: 'text-pink-500', zip: 'text-yellow-500',
    ppt: 'text-orange-500', pptx: 'text-orange-500',
    xls: 'text-emerald-500', xlsx: 'text-emerald-500'
  };
  return colors[ext] || 'text-gray-500';
};

export default function MyNotes() {
  const [file, setFile] = useState<File | null>(null);
  const [noteName, setNoteName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
    setSuccess("");
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
      formData.append("file_type", file.name.split('.').pop()?.toLowerCase() || "");
      
      const res = await fetch(`${API_URL}/notes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Upload failed");
      }
      
      setSuccess("Note uploaded successfully!");
      setNoteName("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchNotes();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
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
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!noteName) {
        setNoteName(droppedFile.name.split('.')[0]);
      }
    }
  };

  const filteredNotes = notes.filter(note => 
    note.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    
    const filename = selectedNote.url.split('/').pop() || '';
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative border border-gray-700 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <i className={`${getFileIcon(filename)} ${getFileColor(filename)} text-2xl`}></i>
              <h2 className="text-xl font-bold text-white">{selectedNote.name}</h2>
            </div>
            <button
              onClick={() => setSelectedNote(null)}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
            {['pdf'].includes(ext) && (
              <iframe
                src={selectedNote.url}
                title={selectedNote.name}
                className="w-full h-[600px] rounded-lg border border-gray-600"
              />
            )}
            
            {['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) && (
              <div className="text-center">
                <img 
                  src={selectedNote.url} 
                  alt={selectedNote.name} 
                  className="max-w-full max-h-[600px] rounded-lg mx-auto shadow-lg" 
                />
              </div>
            )}
            
            {['txt', 'md'].includes(ext) && (
              <pre className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm overflow-auto max-h-[500px] border border-gray-600">
                {textContent}
              </pre>
            )}
            
            {!['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'md'].includes(ext) && (
              <div className="text-center py-12">
                <i className={`${getFileIcon(filename)} ${getFileColor(filename)} text-6xl mb-4`}></i>
                <h3 className="text-xl font-semibold text-white mb-2">Preview not available</h3>
                <p className="text-gray-400 mb-6">This file type cannot be previewed in the browser</p>
                <a
                  href={selectedNote.url}
                  download
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                >
                  <i className="bx bx-download"></i>
                  <span>Download File</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 px-4 py-6">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
          <i className="bx bx-notepad text-orange-500 mr-3"></i>
          My Notes
        </h1>
        <p className="text-gray-400 text-lg">Upload, organize, and access your study materials</p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-fade-in-up animation-delay-300">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <i className="bx bx-cloud-upload text-orange-500 mr-2"></i>
                Upload Note
              </h2>
              
              {/* Note Name Input */}
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Note Name
                </label>
                <input
                  type="text"
                  placeholder="Enter note name..."
                  value={noteName}
                  onChange={(e) => setNoteName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 transition-all"
                  disabled={uploading}
                />
              </div>

              {/* File Upload Area */}
              <div
                ref={dropRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-orange-500 bg-orange-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mp3,.zip,.ppt,.pptx,.xls,.xlsx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    if (selectedFile && !noteName) {
                      setNoteName(selectedFile.name.split('.')[0]);
                    }
                  }}
                  disabled={uploading}
                />
                
                {!file ? (
                  <div className="text-gray-400">
                    <i className="bx bx-cloud-upload text-4xl mb-3 block"></i>
                    <p className="text-lg font-medium mb-1">Drop files here</p>
                    <p className="text-sm">or click to browse</p>
                    <p className="text-xs mt-2">Max size: 3MB</p>
                  </div>
                ) : (
                  <div className="text-white">
                    <i className={`${getFileIcon(file.name)} ${getFileColor(file.name)} text-4xl mb-3 block`}></i>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      <i className="bx bx-x mr-1"></i>Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || !file || !noteName.trim()}
                className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  uploading || !file || !noteName.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform hover:scale-105'
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <i className="bx bx-upload text-lg"></i>
                    <span>Upload Note</span>
                  </>
                )}
              </button>

              {/* Messages */}
              {error && (
                <div className="mt-4 bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-xl flex items-center animate-fade-in-up">
                  <i className="bx bx-error-circle mr-2"></i>
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="mt-4 bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-xl flex items-center animate-fade-in-up">
                  <i className="bx bx-check-circle mr-2"></i>
                  <span className="text-sm">{success}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes List Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-fade-in-up animation-delay-600">
              {/* Search and Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white mb-4 md:mb-0 flex items-center">
                  <i className="bx bx-library text-orange-500 mr-2"></i>
                  Your Notes ({filteredNotes.length})
                </h2>
                
                <div className="relative">
                  <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notes Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-400">Loading your notes...</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-20">
                  <i className="bx bx-note text-6xl text-gray-600 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? 'No notes match your search' : 'No notes uploaded yet'}
                  </h3>
                  <p className="text-gray-400">
                    {searchTerm ? 'Try a different search term' : 'Upload your first note to get started'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note, index) => {
                    const filename = note.url.split('/').pop() || '';
                    const ext = filename.split('.').pop()?.toLowerCase() || '';
                    const isViewable = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'md'].includes(ext);
                    const fileIcon = getFileIcon(filename);
                    const fileColor = getFileColor(filename);

                    return (
                      <div
                        key={note.id}
                        className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-orange-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-600 p-2 rounded-lg">
                              <i className={`${fileIcon} ${fileColor} text-xl`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">{note.name}</h3>
                              <p className="text-xs text-gray-400">
                                {ext.toUpperCase()} • {new Date(note.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isViewable ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleViewNote(note);
                              }}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1"
                            >
                              <i className="bx bx-show text-sm"></i>
                              <span>View</span>
                            </button>
                          ) : (
                            <a
                              href={note.url}
                              download
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1 text-center"
                            >
                              <i className="bx bx-download text-sm"></i>
                              <span>Download</span>
                            </a>
                          )}
                          
                          <a
                            href={note.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center justify-center"
                            title="Open in new tab"
                          >
                            <i className="bx bx-link-external text-sm"></i>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {renderViewer()}
    </div>
  );
}
