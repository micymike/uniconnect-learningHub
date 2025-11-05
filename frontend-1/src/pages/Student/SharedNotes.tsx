import React, { useState, useEffect } from 'react';
import 'boxicons/css/boxicons.min.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://app.uniconnect-learninghub.co.ke/api';

interface SharedNote {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
  author_name: string;
}

interface SharedNotesProps {
  partnerId: string;
  partnerName: string;
}

const SharedNotes: React.FC<SharedNotesProps> = ({ partnerId, partnerName }) => {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [selectedNote, setSelectedNote] = useState<SharedNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSharedNotes();
  }, [partnerId]);

  const fetchSharedNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/shared-notes/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching shared notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!title.trim()) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/shared-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          partner_id: partnerId
        })
      });
      
      if (response.ok) {
        await fetchSharedNotes();
        setTitle('');
        setContent('');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateNote = async () => {
    if (!selectedNote || !title.trim()) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/shared-notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      });
      
      if (response.ok) {
        await fetchSharedNotes();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Delete this shared note?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/shared-notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchSharedNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startEditing = (note?: SharedNote) => {
    if (note) {
      setSelectedNote(note);
      setTitle(note.title);
      setContent(note.content);
    } else {
      setSelectedNote(null);
      setTitle('');
      setContent('');
    }
    setIsEditing(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p>Loading shared notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-800 rounded-lg overflow-hidden">
      {/* Notes List */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">Shared Notes</h3>
            <button
              onClick={() => startEditing()}
              className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-colors"
              title="New Note"
            >
              <i className="bx bx-plus text-sm"></i>
            </button>
          </div>
          <p className="text-gray-400 text-xs">with {partnerName}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <i className="bx bx-note text-3xl mb-2"></i>
              <p className="text-sm">No shared notes yet</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                  selectedNote?.id === note.id ? 'bg-gray-700' : ''
                }`}
              >
                <h4 className="text-white font-medium text-sm mb-1 truncate">{note.title}</h4>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{note.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>by {note.author_name}</span>
                  <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note Editor/Viewer */}
      <div className="flex-1 flex flex-col">
        {isEditing ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">
                  {selectedNote ? 'Edit Note' : 'New Note'}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-white px-3 py-1 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={selectedNote ? updateNote : createNote}
                    disabled={saving || !title.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-4 py-1 rounded transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <textarea
                placeholder="Start writing your shared note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
          </>
        ) : selectedNote ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{selectedNote.title}</h3>
                  <p className="text-gray-400 text-sm">
                    by {selectedNote.author_name} • {new Date(selectedNote.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {selectedNote.can_edit && (
                    <button
                      onClick={() => startEditing(selectedNote)}
                      className="text-gray-400 hover:text-orange-500 p-2 rounded transition-colors"
                      title="Edit"
                    >
                      <i className="bx bx-edit"></i>
                    </button>
                  )}
                  {selectedNote.can_edit && (
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors"
                      title="Delete"
                    >
                      <i className="bx bx-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="text-white whitespace-pre-wrap">{selectedNote.content}</div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <i className="bx bx-note text-4xl mb-2"></i>
              <p>Select a note to view or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedNotes;