import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import axios from 'axios';

export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedDuration: number;
}

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  date: string;
  tasks: Task[];
  totalDuration: number;
  createdAt: string;
}

@Injectable()
export class TaskSchedulerService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient<Database>,
  ) {}

  async createScheduleFromNLP(
    userId: string,
    userInput: string,
    preferences?: any
  ): Promise<Schedule> {
    // Parse user input using AI
    const parsedTasks = await this.parseUserInputWithAI(userInput, preferences);
    
    // Generate optimized schedule
    const schedule = await this.generateOptimizedSchedule(userId, parsedTasks, preferences);
    
    // Save to database
    const savedSchedule = await this.saveSchedule(schedule);
    
    return savedSchedule;
  }

  private async parseUserInputWithAI(userInput: string, preferences?: any): Promise<Task[]> {
    const prompt = `
You are an AI task scheduler. Parse the following user input and extract tasks with their details.
Return ONLY a valid JSON array of tasks with this exact structure:
[{
  "title": "task name",
  "description": "detailed description",
  "priority": "high|medium|low",
  "category": "study|work|personal|exercise|break",
  "estimatedDuration": minutes_as_number
}]

User input: "${userInput}"
${preferences ? `User preferences: ${JSON.stringify(preferences)}` : ''}

Consider:
- Break down complex activities into smaller tasks
- Estimate realistic durations
- Assign appropriate priorities
- Categorize tasks logically
- Include breaks if the schedule is long

Return only the JSON array, no other text.`;

    try {
      const aiResponse = await this.callAzureOpenAI(prompt);
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        const tasks = JSON.parse(match[0]);
        return tasks.map((task: any, index: number) => ({
          id: `task_${Date.now()}_${index}`,
          ...task
        }));
      }
      throw new Error('Invalid AI response format');
    } catch (error) {
      throw new Error(`Failed to parse user input: ${error.message}`);
    }
  }

  private async generateOptimizedSchedule(
    userId: string,
    tasks: Task[],
    preferences?: any
  ): Promise<Schedule> {
    const startTime = preferences?.startTime || '09:00';
    const endTime = preferences?.endTime || '17:00';
    const breakDuration = preferences?.breakDuration || 15;
    
    // Sort tasks by priority and estimated duration
    const sortedTasks = tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let currentTime = this.parseTime(startTime);
    const endTimeMinutes = this.parseTime(endTime);
    const scheduledTasks: Task[] = [];
    let totalDuration = 0;

    for (const task of sortedTasks) {
      if (currentTime + task.estimatedDuration > endTimeMinutes) {
        break; // Skip tasks that don't fit
      }

      const taskStartTime = this.formatTime(currentTime);
      const taskEndTime = this.formatTime(currentTime + task.estimatedDuration);

      scheduledTasks.push({
        ...task,
        startTime: taskStartTime,
        endTime: taskEndTime
      });

      currentTime += task.estimatedDuration;
      totalDuration += task.estimatedDuration;

      // Add break after tasks (except the last one)
      if (scheduledTasks.length < sortedTasks.length && task.category !== 'break') {
        if (currentTime + breakDuration <= endTimeMinutes) {
          scheduledTasks.push({
            id: `break_${Date.now()}_${scheduledTasks.length}`,
            title: 'Break',
            description: 'Take a short break',
            startTime: this.formatTime(currentTime),
            endTime: this.formatTime(currentTime + breakDuration),
            priority: 'low' as const,
            category: 'break',
            estimatedDuration: breakDuration
          });
          currentTime += breakDuration;
          totalDuration += breakDuration;
        }
      }
    }

    return {
      id: `schedule_${Date.now()}`,
      userId,
      title: `Daily Schedule - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      tasks: scheduledTasks,
      totalDuration,
      createdAt: new Date().toISOString()
    };
  }

  private async saveSchedule(schedule: Schedule): Promise<Schedule> {
    const { data, error } = await this.supabase
      .from('task_schedules')
      .insert({
        id: schedule.id,
        user_id: schedule.userId,
        title: schedule.title,
        schedule_date: schedule.date,
        tasks: schedule.tasks,
        total_duration: schedule.totalDuration,
        created_at: schedule.createdAt
      })
      .select()
      .single();

    if (error) throw error;
    return schedule;
  }

  async getUserSchedules(userId: string): Promise<Schedule[]> {
    const { data, error } = await this.supabase
      .from('task_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      title: item.title,
      date: item.schedule_date,
      tasks: item.tasks as Task[],
      totalDuration: item.total_duration,
      createdAt: item.created_at
    }));
  }

  async updateSchedule(userId: string, scheduleId: string, schedule: Schedule): Promise<Schedule> {
    const { data, error } = await this.supabase
      .from('task_schedules')
      .update({
        title: schedule.title,
        tasks: schedule.tasks,
        total_duration: schedule.tasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return schedule;
  }

  async deleteSchedule(userId: string, scheduleId: string): Promise<void> {
    const { error } = await this.supabase
      .from('task_schedules')
      .delete()
      .eq('id', scheduleId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  generateScheduleHTML(schedule: Schedule): string {
    const taskRows = schedule.tasks.map(task => `
      <tr class="${task.category === 'break' ? 'break-row' : 'task-row'}">
        <td>${task.startTime}</td>
        <td>${task.endTime}</td>
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td><span class="priority-${task.priority}">${task.priority.toUpperCase()}</span></td>
        <td>${task.category}</td>
        <td>${task.estimatedDuration} min</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${schedule.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f7fa; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 2.2em; }
        .header p { color: #6b7280; margin: 10px 0 0 0; font-size: 1.1em; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .summary-item { text-align: center; }
        .summary-item .number { font-size: 2em; font-weight: bold; color: #4f46e5; }
        .summary-item .label { color: #6b7280; font-size: 0.9em; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #4f46e5; color: white; padding: 15px 10px; text-align: left; font-weight: 600; }
        td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; }
        .task-row:hover { background: #f9fafb; }
        .break-row { background: #fef3c7; }
        .break-row:hover { background: #fde68a; }
        .priority-high { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .priority-medium { background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .priority-low { background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 0.9em; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${schedule.title}</h1>
            <p>Generated on ${new Date(schedule.createdAt).toLocaleDateString()} at ${new Date(schedule.createdAt).toLocaleTimeString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="number">${schedule.tasks.length}</div>
                <div class="label">Total Tasks</div>
            </div>
            <div class="summary-item">
                <div class="number">${Math.floor(schedule.totalDuration / 60)}h ${schedule.totalDuration % 60}m</div>
                <div class="label">Total Duration</div>
            </div>
            <div class="summary-item">
                <div class="number">${schedule.tasks.filter(t => t.priority === 'high').length}</div>
                <div class="label">High Priority</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Task</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                ${taskRows}
            </tbody>
        </table>
        
        <div class="footer">
            <p>Generated by UniConnect Learning Hub - AI Task Scheduler</p>
        </div>
    </div>
</body>
</html>`;
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private async callAzureOpenAI(prompt: string): Promise<string> {
    const endpoint = process.env.AZURE_API_BASE!;
    const apiKey = process.env.AZURE_API_KEY!;

    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: 'You are an AI task scheduler that helps students organize their daily routines efficiently.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  }
}