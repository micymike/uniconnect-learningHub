import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, Trash2, Plus, Brain, CheckCircle } from 'lucide-react';

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

  const userId = localStorage.getItem('userId') || 'demo-user';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-bc.onrender.com/api"}/task-scheduler/schedules?userId=${userId}`);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-bc.onrender.com"}/task-scheduler/create?userId=${userId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-bc.onrender.com"}/task-scheduler/schedules/${scheduleId}?userId=${userId}`, {
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

  const updateTask = (taskIndex: number, field: string, value: any) => {
    if (!selectedSchedule) return;
    
    const updatedTasks = [...selectedSchedule.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], [field]: value };
    
    const updatedSchedule = { ...selectedSchedule, tasks: updatedTasks };
    setSelectedSchedule(updatedSchedule);
    
    // Update in schedules array
    const updatedSchedules = schedules.map(s => 
      s.id === selectedSchedule.id ? updatedSchedule : s
    );
    setSchedules(updatedSchedules);
  };

  const saveSchedule = async () => {
    if (!selectedSchedule) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-bc.onrender.com"}/task-scheduler/schedules/${selectedSchedule.id}?userId=${userId}`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-bc.onrender.com"}/task-scheduler/download/${scheduleId}?userId=${userId}`);
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study': return '📚';
      case 'work': return '💼';
      case 'exercise': return '🏃‍♂️';
      case 'break': return '☕';
      case 'personal': return '🏠';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Brain className="text-indigo-600" />
            AI Task Scheduler
          </h1>
          <p className="text-gray-600 text-lg">Tell me your daily routine and I'll create a perfect schedule for you!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="text-indigo-600" />
                Create New Schedule
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your day:
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="I need to study for my math exam for 2 hours, work on my history project for 1 hour, exercise for 30 minutes, and have lunch. I also want to review my notes and do some reading..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={preferences.startTime}
                      onChange={(e) => setPreferences({...preferences, startTime: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={preferences.endTime}
                      onChange={(e) => setPreferences({...preferences, endTime: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={preferences.breakDuration}
                    onChange={(e) => setPreferences({...preferences, breakDuration: parseInt(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="5"
                    max="60"
                  />
                </div>

                <button
                  onClick={createSchedule}
                  disabled={loading || !userInput.trim()}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Schedule...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Generate Schedule
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Saved Schedules */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-600" />
                Saved Schedules
              </h2>
              
              <div className="space-y-3">
                {Array.isArray(schedules) && schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSchedule?.id === schedule.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                        <p className="text-sm text-gray-500">{schedule.date}</p>
                        <p className="text-xs text-gray-400">{schedule.tasks.length} tasks</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadSchedule(schedule.id, schedule.title);
                          }}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSchedule(schedule.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!schedules || schedules.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No schedules yet. Create your first one!</p>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Display */}
          <div className="lg:col-span-2">
            {selectedSchedule ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedSchedule.title}</h2>
                    <p className="text-gray-600">
                      {selectedSchedule.tasks?.length || 0} tasks • {Math.floor((selectedSchedule.totalDuration || 0) / 60)}h {(selectedSchedule.totalDuration || 0) % 60}m total
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveSchedule}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => downloadSchedule(selectedSchedule.id, selectedSchedule.title)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">Start Time</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">End Time</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">Task</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">Description</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">Priority</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">Category</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-900">Duration (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSchedule.tasks?.map((task, index) => (
                        <tr key={task.id} className={task.category === 'break' ? 'bg-amber-50' : 'bg-white hover:bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="time"
                              value={task.startTime}
                              onChange={(e) => updateTask(index, 'startTime', e.target.value)}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="time"
                              value={task.endTime}
                              onChange={(e) => updateTask(index, 'endTime', e.target.value)}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => updateTask(index, 'title', e.target.value)}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="text"
                              value={task.description}
                              onChange={(e) => updateTask(index, 'description', e.target.value)}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <select
                              value={task.priority}
                              onChange={(e) => updateTask(index, 'priority', e.target.value as 'high' | 'medium' | 'low')}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <select
                              value={task.category}
                              onChange={(e) => updateTask(index, 'category', e.target.value)}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                            >
                              <option value="study">Study</option>
                              <option value="work">Work</option>
                              <option value="exercise">Exercise</option>
                              <option value="personal">Personal</option>
                              <option value="break">Break</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <input
                              type="number"
                              value={task.estimatedDuration}
                              onChange={(e) => updateTask(index, 'estimatedDuration', parseInt(e.target.value))}
                              className="w-full border-0 bg-transparent focus:ring-1 focus:ring-indigo-500 rounded px-1"
                              min="5"
                            />
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={7} className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                            No tasks found in this schedule.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Schedule Selected</h3>
                <p className="text-gray-600">Create a new schedule or select an existing one to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskScheduler;
