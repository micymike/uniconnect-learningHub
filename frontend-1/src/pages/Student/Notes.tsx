import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image, Video, Music, Archive, File, Plus, Search, Filter, Grid, List, Calendar, Tag, Folder, Palette, Star, Eye, Download, Trash2, MoreVertical } from 'lucide-react';

// Type definitions
interface Note {
  id: string;
  name: string;
  url: string;
  uploaded_at: string;
  folder?: string;
  tags?: string[];
  color_label?: string;
  icon?: string;
  file_type?: string;
  ocr_text?: string;
  user_id: string;
}

interface UploadFormState {
  file: File | null;
  name: string;
  folder: string;
  tags: string;
  color_label: string;
  icon: string;
  file_type: string;
  ocr_text: string;
}

interface IconOption {
  value: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string>(''); // You'll need to implement JWT token management

  // Upload form state
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    file: null,
    name: '',
    folder: '',
    tags: '',
    color_label: '#6366f1',
    icon: 'file',
    file_type: '',
    ocr_text: ''
  });

  const colorOptions: string[] = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#64748b'
  ];

  const iconOptions: IconOption[] = [
    { value: 'file', icon: FileText },
    { value: 'image', icon: Image },
    { value: 'video', icon: Video },
    { value: 'audio', icon: Music },
    { value: 'archive', icon: Archive },
    { value: 'document', icon: File }
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
    setLoading(false);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File): void => {
    setUploadForm(prev => ({
      ...prev,
      file,
      name: file.name.split('.').slice(0, -1).join('.') || file.name,
      file_type: file.type
    }));
    setShowUploadModal(true);
  };

  const handleUpload = async (): Promise<void> => {
    if (!uploadForm.file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('name', uploadForm.name);
    formData.append('folder', uploadForm.folder);
    formData.append('tags', uploadForm.tags);
    formData.append('color_label', uploadForm.color_label);
    formData.append('icon', uploadForm.icon);
    formData.append('file_type', uploadForm.file_type);
    formData.append('ocr_text', uploadForm.ocr_text);

    try {
      const response = await fetch('/api/notes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchNotes();
        setShowUploadModal(false);
        setUploadForm({
          file: null,
          name: '',
          folder: '',
          tags: '',
          color_label: '#6366f1',
          icon: 'file',
          file_type: '',
          ocr_text: ''
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  };

  const getFileIcon = (fileType?: string, iconName?: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> => {
    const IconComponent = iconOptions.find(opt => opt.value === iconName)?.icon || FileText;
    return IconComponent;
  };

  const filteredNotes = notes.filter((note: Note) => {
    const matchesSearch = note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === 'all' || note.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const folders = Array.from(new Set(notes.map((note: Note) => note.folder).filter(Boolean))) as string[];

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Notes
              </h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Note</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/80 text-slate-600 hover:bg-slate-100'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/80 text-slate-600 hover:bg-slate-100'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notes Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 
            'space-y-4'
          }>
            {filteredNotes.map((note: Note, index: number) => {
              const IconComponent = getFileIcon(note.file_type, note.icon);
              return (
                <div
                  key={note.id}
                  className={`group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200 overflow-hidden ${
                    viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className={`flex items-start ${viewMode === 'list' ? 'flex-row space-x-4 flex-1' : 'flex-col space-y-4'}`}>
                    <div 
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: (note.color_label || '#6366f1') + '20' }}
                    >
                      <IconComponent 
                        className="h-6 w-6" 
                        style={{ color: note.color_label || '#6366f1' }}
                      />
                    </div>
                    <div className={`flex-1 ${viewMode === 'list' ? '' : 'space-y-2'}`}>
                      <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
                        {note.name}
                      </h3>
                      {note.folder && (
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          <Folder className="h-3 w-3" />
                          <span>{note.folder}</span>
                        </div>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-slate-500">+{note.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(note.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    viewMode === 'list' ? 'flex items-center space-x-2' : 'mt-4 flex justify-between items-center'
                  }`}>
                    <div className="flex space-x-1">
                      <button className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <a
                        href={note.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all duration-200"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredNotes.length === 0 && !loading && (
          <div className="text-center py-16">
            <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No notes found</h3>
            <p className="text-slate-500 mb-6">Upload your first note to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Upload Note
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Upload Note</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadForm.file ? (
                  <div className="space-y-2">
                    <FileText className="mx-auto h-12 w-12 text-indigo-500" />
                    <p className="font-medium text-slate-800">{uploadForm.file.name}</p>
                    <p className="text-sm text-slate-500">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div>
                      <p className="text-lg font-medium text-slate-700">Drop your file here</p>
                      <p className="text-slate-500">or click to browse</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                    >
                      Choose File
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.mp4,.mp3,.zip,.ppt,.pptx,.xls,.xlsx"
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Note Name</label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Folder</label>
                  <input
                    type="text"
                    value={uploadForm.folder}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, folder: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Optional folder name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Comma-separated tags"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                  <select
                    value={uploadForm.icon}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value.charAt(0).toUpperCase() + option.value.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                <div className="flex space-x-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, color_label: color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        uploadForm.color_label === color ? 'border-slate-400 scale-110' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">OCR Text (Optional)</label>
                <textarea
                  value={uploadForm.ocr_text}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, ocr_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  rows={3}
                  placeholder="Add any extracted text for better searchability"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!uploadForm.file || uploading}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {uploading ? 'Uploading...' : 'Upload Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotesApp;