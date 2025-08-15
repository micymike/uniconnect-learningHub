import React from 'react';
import { Calendar, Clock, Brain, CheckCircle } from 'lucide-react';

const TaskSchedulerDemo: React.FC = () => {
  const demoSchedule = {
    title: "Daily Study Schedule - Demo",
    date: "2024-01-15",
    totalDuration: 480,
    tasks: [
      {
        id: "1",
        title: "Morning Exercise",
        description: "30-minute cardio workout to start the day",
        startTime: "07:00",
        endTime: "07:30",
        priority: "medium" as const,
        category: "exercise",
        estimatedDuration: 30
      },
      {
        id: "2",
        title: "Breakfast",
        description: "Healthy breakfast and morning routine",
        startTime: "07:30",
        endTime: "08:00",
        priority: "low" as const,
        category: "personal",
        estimatedDuration: 30
      },
      {
        id: "3",
        title: "Math Exam Study",
        description: "Focus on calculus problems and review formulas",
        startTime: "08:15",
        endTime: "10:15",
        priority: "high" as const,
        category: "study",
        estimatedDuration: 120
      },
      {
        id: "4",
        title: "Break",
        description: "Take a short break",
        startTime: "10:15",
        endTime: "10:30",
        priority: "low" as const,
        category: "break",
        estimatedDuration: 15
      },
      {
        id: "5",
        title: "History Project",
        description: "Research and write about World War II",
        startTime: "10:30",
        endTime: "11:30",
        priority: "high" as const,
        category: "study",
        estimatedDuration: 60
      }
    ]
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
      case 'exercise': return '🏃♂️';
      case 'break': return '☕';
      case 'personal': return '🏠';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Brain className="text-indigo-600" />
          AI Task Scheduler - Demo
        </h2>
        <p className="text-gray-600">Example of AI-generated schedule from natural language input</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Sample Input:</h3>
        <p className="text-blue-800 italic">
          "I need to exercise for 30 minutes, have breakfast, study for my math exam for 2 hours, 
          work on my history project for 1 hour, and take breaks in between."
        </p>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{demoSchedule.title}</h3>
          <p className="text-gray-600">
            {demoSchedule.tasks.length} tasks • {Math.floor(demoSchedule.totalDuration / 60)}h {demoSchedule.totalDuration % 60}m total
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{demoSchedule.tasks.filter(t => t.priority === 'high').length}</div>
            <div className="text-gray-500">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{demoSchedule.tasks.filter(t => t.priority === 'medium').length}</div>
            <div className="text-gray-500">Medium Priority</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {demoSchedule.tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border-l-4 ${
              task.category === 'break'
                ? 'bg-amber-50 border-l-amber-400'
                : 'bg-gray-50 border-l-indigo-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{getCategoryIcon(task.category)}</span>
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.startTime} - {task.endTime}
                  </span>
                  <span>{task.estimatedDuration} minutes</span>
                  <span className="capitalize">{task.category}</span>
                </div>
              </div>
              <CheckCircle className="h-5 w-5 text-gray-300 hover:text-green-500 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">✅ Features Included:</h4>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• Natural language processing for task extraction</li>
          <li>• Intelligent priority assignment and categorization</li>
          <li>• Automatic break scheduling between tasks</li>
          <li>• Time optimization within user preferences</li>
          <li>• Beautiful, downloadable HTML schedules</li>
          <li>• Database storage for future reference</li>
        </ul>
      </div>
    </div>
  );
};

export default TaskSchedulerDemo;