import React, { useState, useEffect } from 'react';
import 'boxicons/css/boxicons.min.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://uniconnect-learninghub-backend.onrender.com/api';

interface StudySession {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  created_by: string;
  created_by_name: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  participants: string[];
}

interface StudySessionsProps {
  partnerId: string;
  partnerName: string;
}

const StudySessions: React.FC<StudySessionsProps> = ({ partnerId, partnerName }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchStudySessions();
  }, [partnerId]);

  const fetchStudySessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/study-sessions/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async () => {
    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      
      const response = await fetch(`${API_URL}/study-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          partner_id: partnerId
        })
      });
      
      if (response.ok) {
        await fetchStudySessions();
        setFormData({ title: '', description: '', date: '', startTime: '', endTime: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating study session:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'completed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/study-sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      await fetchStudySessions();
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this study session?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/study-sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchStudySessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p>Loading study sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Study Sessions</h3>
            <p className="text-gray-400 text-sm">Schedule study time with {partnerName}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <i className="bx bx-plus"></i>
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-6">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <i className="bx bx-calendar text-6xl mb-4"></i>
            <h4 className="text-xl font-semibold mb-2">No Study Sessions</h4>
            <p>Schedule your first study session with {partnerName}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const startDateTime = formatDateTime(session.start_time);
              const endDateTime = formatDateTime(session.end_time);
              const upcoming = isUpcoming(session.start_time);
              
              return (
                <div key={session.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">{session.title}</h4>
                      {session.description && (
                        <p className="text-gray-300 text-sm mb-2">{session.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                          <i className="bx bx-calendar"></i>
                          <span>{startDateTime.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="bx bx-time"></i>
                          <span>{startDateTime.time} - {endDateTime.time}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <i className="bx bx-user"></i>
                          <span>by {session.created_by_name}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      
                      {upcoming && session.status === 'scheduled' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                            className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                            title="Mark as completed"
                          >
                            <i className="bx bx-check"></i>
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, 'cancelled')}
                            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                            title="Cancel session"
                          >
                            <i className="bx bx-x"></i>
                          </button>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
                            title="Delete session"
                          >
                            <i className="bx bx-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Schedule Study Session</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="bx bx-x text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Study session title..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 resize-none"
                  placeholder="What will you study?"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                disabled={saving || !formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-2 rounded-lg transition-colors"
              >
                {saving ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySessions;