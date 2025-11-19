import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, TrendingUp, Download, Eye, Calendar } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Session {
  id: string;
  topic: string;
  created_at: string;
  conversation_history: string[];
  blackboard_content: string[];
  notes: any[];
}

interface DashboardData {
  recentSessions: Session[];
  totalSessions: number;
  favoriteTopics: string[];
  progressStats: {
    averageNotesPerSession: number;
    totalConversations: number;
  };
}

const API_BASE = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-jqn0.onrender.com/api";

const AITeacherDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai/teacher/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE}/ai/teacher/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const sessionData = await response.json();
      setSelectedSession({ id: sessionId, ...sessionData } as Session);
    } catch (error) {
      console.error('Error fetching session:', error);
    }
  };

  const exportNotes = (session: Session) => {
    const notesText = session.notes.map(note => 
      `${new Date(note.timestamp).toLocaleString()}\n${note.content}\n\n`
    ).join('');
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.topic}-notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Sessions Yet</h2>
          <p className="text-gray-600">Start your first AI teaching session to see your progress here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 p-6 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📊 Learning Dashboard
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Track your AI teaching sessions and progress
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } shadow-md`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Sessions</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.totalSessions}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Notes/Session</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(dashboardData.progressStats.averageNotesPerSession)}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Conversations</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.progressStats.totalConversations}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Favorite Topic</p>
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData.favoriteTopics[0] || 'None yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📚 Recent Sessions
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dashboardData.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {session.topic}
                    </h3>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {session.conversation_history?.length || 0} messages • {session.notes?.length || 0} notes
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewSession(session.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </button>
                    <button
                      onClick={() => exportNotes(session)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Details */}
          <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🔍 Session Details
            </h2>
            {selectedSession ? (
              <div className="space-y-4">
                <div>
                  <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedSession.topic}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(selectedSession.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    💬 Conversation ({selectedSession.conversation?.length || 0} messages)
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedSession.conversation?.slice(-5).map((msg, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-xs ${
                          msg.startsWith('Teacher:')
                            ? (darkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800')
                            : (darkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800')
                        }`}
                      >
                        <strong>{msg.split(':')[0]}:</strong>
                        <Markdown className="inline ml-1" remarkPlugins={[remarkGfm]}>
                          {msg.substring(msg.indexOf(':') + 1)}
                        </Markdown>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📝 Notes ({selectedSession.notes?.length || 0})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {selectedSession.notes?.map((note, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-xs ${
                          darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className={`text-xs mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(note.timestamp).toLocaleString()}
                        </div>
                        {note.content}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select a session to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITeacherDashboard;