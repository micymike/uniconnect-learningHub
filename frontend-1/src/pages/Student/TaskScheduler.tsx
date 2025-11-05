import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Download, Trash2, Plus, Brain, CheckCircle, 
  BookOpen, Briefcase, Dumbbell, Coffee, Home, FileText, X, Eye,
  Calendar as CalendarIcon, Clock as ClockIcon, Settings, Save,
  User, ChevronDown, ChevronUp, LogOut, Bell, Sun, Moon
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedDuration: number;
}

interface Schedule {
  id: string;
  userId: string;
  title: string;
  date: string;
  tasks: Task[];
  totalDuration: number;
  createdAt: string;
}

const TaskScheduler: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [preferences, setPreferences] = useState({
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 15
  });
  const [modalContent, setModalContent] = useState<{
    title: string;
    content: string;
    field: string;
    taskIndex: number;
  } | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const userId = 'demo-user';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`https://app.uniconnect-learninghub.co.ke/api/task-scheduler/schedules?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(Array.isArray(data) ? data : []);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };

  const createSchedule = async () => {
    if (!userInput.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://app.uniconnect-learninghub.co.ke/api/task-scheduler/create?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, preferences })
      });
      
      if (response.ok) {
        const newSchedule = await response.json();
        const updatedSchedules = Array.isArray(schedules) ? [newSchedule, ...schedules] : [newSchedule];
        setSchedules(updatedSchedules);
        setSelectedSchedule(newSchedule);
        setUserInput('');
      } else {
        console.error('Failed to create schedule:', response.status);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`https://uniconnect-learninghub-backend.onrender.com/task-scheduler/schedules/${scheduleId}?userId=${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok && Array.isArray(schedules)) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        if (selectedSchedule?.id === scheduleId) {
          setSelectedSchedule(null);
        }
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const openModal = (title: string, content: string, field: string, taskIndex: number) => {
    setModalContent({ title, content, field, taskIndex });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const handleModalSave = (newContent: string) => {
    if (modalContent && selectedSchedule) {
      updateTask(modalContent.taskIndex, modalContent.field, newContent);
      closeModal();
    }
  };

  const updateTask = (taskIndex: number, field: string, value: any) => {
    if (!selectedSchedule) return;
    
    const updatedTasks = [...selectedSchedule.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], [field]: value };
    
    const updatedSchedule = { ...selectedSchedule, tasks: updatedTasks };
    setSelectedSchedule(updatedSchedule);
    
    const updatedSchedules = schedules.map(s => 
      s.id === selectedSchedule.id ? updatedSchedule : s
    );
    setSchedules(updatedSchedules);
  };

  const saveSchedule = async () => {
    if (!selectedSchedule) return;
    
    try {
      const response = await fetch(`https://uniconnect-learninghub-backend.onrender.com/task-scheduler/schedules/${selectedSchedule.id}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedSchedule)
      });
      
      if (response.ok) {
        console.log('Schedule saved successfully');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const downloadSchedule = async (scheduleId: string, title: string) => {
    try {
      const response = await fetch(`https://uniconnect-learninghub-backend.onrender.com/task-scheduler/download/${scheduleId}?userId=${userId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading schedule:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study': return <BookOpen className="h-5 w-5 text-blue-400" />;
      case 'work': return <Briefcase className="h-5 w-5 text-purple-400" />;
      case 'exercise': return <Dumbbell className="h-5 w-5 text-green-400" />;
      case 'break': return <Coffee className="h-5 w-5 text-yellow-400" />;
      case 'personal': return <Home className="h-5 w-5 text-pink-400" />;
      default: return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
              <Brain className="text-orange-500 mr-3" />
              AI Task Scheduler
            </h1>
            <p className="text-gray-400 text-lg">Tell me your daily routine and I'll create a perfect schedule for you!</p>
          </div>
          {/* Removed the user and settings icons from here */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6 animate-fade-in-up animation-delay-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Plus className="text-orange-500" />
                Create New Schedule
              </h2>
              
              <div className="space-y-4">
                <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-400" />
                    Describe your day:
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="I need to study for my math exam for 2 hours, work on my history project for 1 hour, exercise for 30 minutes, and have lunch. I also want to review my notes and do some reading..."
                    className="w-full h-32 p-3 bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-300"
                  />
                </div>

                <div className="bg-gray-900/30 rounded-xl p-3 border border-gray-700/50">
                  <button 
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2 text-orange-400" />
                      <span className="text-sm font-medium text-gray-300">Schedule Preferences</span>
                    </div>
                    {showPreferences ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>
                  
                  {showPreferences && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                            <Sun className="h-4 w-4 mr-1 text-blue-400" />
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={preferences.startTime}
                            onChange={(e) => setPreferences({...preferences, startTime: e.target.value})}
                            className="w-full p-2 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                          />
                        </div>
                        <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                            <Moon className="h-4 w-4 mr-1 text-purple-400" />
                            End Time
                          </label>
                          <input
                            type="time"
                            value={preferences.endTime}
                            onChange={(e) => setPreferences({...preferences, endTime: e.target.value})}
                            className="w-full p-2 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                          <Coffee className="h-4 w-4 mr-1 text-yellow-400" />
                          Break Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={preferences.breakDuration}
                          onChange={(e) => setPreferences({...preferences, breakDuration: parseInt(e.target.value)})}
                          className="w-full p-2 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                          min="5"
                          max="60"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={createSchedule}
                  disabled={loading || !userInput.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Schedule...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-4 w-4" />
                      Generate Schedule
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-fade-in-up animation-delay-400">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <CalendarIcon className="text-orange-500" />
                Saved Schedules
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {Array.isArray(schedules) && schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 border rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedSchedule?.id === schedule.id
                        ? 'border-orange-500 bg-orange-900/20'
                        : 'border-gray-700 hover:border-orange-400/50 bg-gray-700/30 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{schedule.title}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {schedule.date}
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full mr-2">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {schedule.tasks.length} tasks
                          </span>
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                            <ClockIcon className="h-3 w-3 inline mr-1" />
                            {Math.floor((schedule.totalDuration || 0) / 60)}h {(schedule.totalDuration || 0) % 60}m
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSchedule(schedule.id, schedule.title);
                          }}
                          className="p-1 text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                          title="Download schedule"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSchedule(schedule.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:scale-110"
                          title="Delete schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!schedules || schedules.length === 0) && (
                  <div className="text-gray-400 text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p>No schedules yet. Create your first one!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedSchedule ? (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-fade-in-up animation-delay-300">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedSchedule.title}</h2>
                    <div className="flex items-center text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="mr-3">{selectedSchedule.date}</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{Math.floor((selectedSchedule.totalDuration || 0) / 60)}h {(selectedSchedule.totalDuration || 0) % 60}m total</span>
                    </div>
                  </div>
                  <div className="flex flex-col xs:flex-row gap-2 w-full max-w-xs sm:max-w-none sm:flex-row sm:items-center sm:justify-end">
                    <button
                      onClick={saveSchedule}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => downloadSchedule(selectedSchedule.id, selectedSchedule.title)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 w-full sm:w-auto font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-6 px-6">
                  <div className="min-w-full inline-block align-top">
                    <table className="w-full min-w-[800px] border-collapse border border-gray-700 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-gray-700/50">
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <Sun className="h-4 w-4 mr-2 text-blue-400" />
                              Start
                            </div>
                          </th>
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <Moon className="h-4 w-4 mr-2 text-purple-400" />
                              End
                            </div>
                          </th>
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-orange-400" />
                              Task
                            </div>
                          </th>
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-2 text-green-400" />
                              Description
                            </div>
                          </th>
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <Bell className="h-4 w-4 mr-2 text-red-400" />
                              Priority
                            </div>
                          </th>
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <Settings className="h-4 w-4 mr-2 text-yellow-400" />
                              Category
                            </div>
                          </th>
                          <th className="border border-gray-700 px-3 py-3 text-left font-semibold text-white text-sm">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-2 text-cyan-400" />
                              Duration
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSchedule.tasks?.map((task, index) => (
                          <tr key={task.id} className={`${task.category === 'break' ? 'bg-yellow-900/20' : 'bg-gray-800/30'} hover:bg-gray-700/50 transition-all duration-300`}>
                            <td className="border border-gray-700 px-3 py-3">
                              <input
                                type="time"
                                value={task.startTime}
                                onChange={(e) => updateTask(index, 'startTime', e.target.value)}
                                className="w-full min-w-[70px] border-0 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300"
                              />
                            </td>
                            <td className="border border-gray-700 px-3 py-3">
                              <input
                                type="time"
                                value={task.endTime}
                                onChange={(e) => updateTask(index, 'endTime', e.target.value)}
                                className="w-full min-w-[70px] border-0 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300"
                              />
                            </td>
                            <td className="border border-gray-700 px-3 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => updateTask(index, 'title', e.target.value)}
                                  className="w-full min-w-[80px] border-0 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300"
                                />
                                <button
                                  onClick={() => openModal('Task Title', task.title, 'title', index)}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="border border-gray-700 px-3 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={task.description}
                                  onChange={(e) => updateTask(index, 'description', e.target.value)}
                                  className="w-full min-w-[100px] border-0 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300"
                                />
                                <button
                                  onClick={() => openModal('Task Description', task.description, 'description', index)}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-110"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                            <td className="border border-gray-700 px-3 py-3">
                              <select
                                value={task.priority}
                                onChange={(e) => updateTask(index, 'priority', e.target.value as 'high' | 'medium' | 'low')}
                                className={`w-full border-0 bg-gray-900 text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300 ${getPriorityColor(task.priority)}`}
                                style={{ color: 'white' }}
                              >
                                <option value="high" style={{ backgroundColor: '#1f2937', color: 'white' }}>High</option>
                                <option value="medium" style={{ backgroundColor: '#1f2937', color: 'white' }}>Medium</option>
                                <option value="low" style={{ backgroundColor: '#1f2937', color: 'white' }}>Low</option>
                              </select>
                            </td>
                            <td className="border border-gray-700 px-3 py-3">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(task.category)}
                                <select
                                  value={task.category}
                                  onChange={(e) => updateTask(index, 'category', e.target.value)}
                                  className="w-full border-0 bg-gray-900 text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300"
                                  style={{ color: 'white' }}
                                >
                                  <option value="study" style={{ backgroundColor: '#1f2937', color: 'white' }}>Study</option>
                                  <option value="work" style={{ backgroundColor: '#1f2937', color: 'white' }}>Work</option>
                                  <option value="exercise" style={{ backgroundColor: '#1f2937', color: 'white' }}>Exercise</option>
                                  <option value="personal" style={{ backgroundColor: '#1f2937', color: 'white' }}>Personal</option>
                                  <option value="break" style={{ backgroundColor: '#1f2937', color: 'white' }}>Break</option>
                                </select>
                              </div>
                            </td>
                            <td className="border border-gray-700 px-3 py-3">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-cyan-400" />
                                <input
                                  type="number"
                                  value={task.estimatedDuration}
                                  onChange={(e) => updateTask(index, 'estimatedDuration', parseInt(e.target.value))}
                                  className="w-full min-w-[60px] border-0 bg-transparent text-white text-sm focus:ring-2 focus:ring-orange-500 rounded-lg px-2 py-1 transition-all duration-300"
                                  min="5"
                                />
                                <span className="text-gray-400 text-sm">min</span>
                              </div>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={7} className="border border-gray-700 px-3 py-8 text-center text-gray-400">
                              No tasks found in this schedule.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center animate-fade-in-up animation-delay-300">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Schedule Selected</h3>
                <p className="text-gray-400">Create a new schedule or select an existing one to view details.</p>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 animate-fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-white text-lg">Generating your perfect schedule...</p>
          </div>
        )}

        {/* Modal for viewing/editing task details */}
        {modalContent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{modalContent.title}</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                {modalContent.field === 'description' ? (
                  <textarea
                    value={modalContent.content}
                    onChange={(e) => setModalContent({...modalContent, content: e.target.value})}
                    className="w-full h-32 p-3 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-300"
                  />
                ) : (
                  <input
                    type="text"
                    value={modalContent.content}
                    onChange={(e) => setModalContent({...modalContent, content: e.target.value})}
                    className="w-full p-3 bg-gray-900/50 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleModalSave(modalContent.content)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-300"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
        
        select option {
          background-color: #1f2937;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default TaskScheduler;