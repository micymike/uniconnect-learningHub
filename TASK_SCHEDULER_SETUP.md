# AI Task Scheduler Setup Guide

## Overview
The AI Task Scheduler is a production-ready feature that allows students to describe their daily routine in natural language, and the AI creates a beautifully formatted, downloadable schedule saved to the database.

## Features
- **Natural Language Processing**: Students describe their day in plain English
- **AI-Powered Scheduling**: Intelligent task parsing and time optimization
- **Beautiful UI**: Modern, responsive interface with priority indicators
- **Downloadable Schedules**: Export as formatted HTML files
- **Database Storage**: All schedules saved for future reference
- **Customizable Preferences**: Set start/end times and break durations

## Database Setup

1. **Run the migration script** in your Supabase/PostgreSQL database:
   ```sql
   -- Execute the contents of: backend/database/migrations/create_task_schedules_table.sql
   ```

2. **Verify the table was created**:
   ```sql
   SELECT * FROM task_schedules LIMIT 1;
   ```

## Backend Setup

The backend is already configured and ready to use. Ensure your Azure OpenAI credentials are set in your `.env` file:

```env
AZURE_API_BASE=your_azure_openai_endpoint
AZURE_API_KEY=your_azure_openai_key
```

## Frontend Setup

The frontend component is integrated into the student dashboard. Access it via:
- **URL**: `/student/task-scheduler`
- **Navigation**: Sidebar → AI Tools → Task Scheduler

## Usage Examples

Students can input natural language descriptions like:

### Example 1: Study Schedule
```
I need to study for my math exam for 2 hours, work on my history project for 1 hour, exercise for 30 minutes, and have lunch. I also want to review my notes and do some reading.
```

### Example 2: Work Day
```
I have a team meeting at 10 AM, need to finish my presentation by 2 PM, review documents for 45 minutes, take a coffee break, and prepare for tomorrow's client call.
```

### Example 3: Mixed Activities
```
Morning workout for 45 minutes, breakfast, study chemistry for 90 minutes, lunch break, work on coding assignment for 2 hours, review lecture notes, and prepare dinner.
```

## AI Processing

The AI will:
1. **Parse tasks** from natural language
2. **Assign priorities** based on context
3. **Categorize activities** (study, work, personal, exercise, break)
4. **Estimate durations** realistically
5. **Optimize scheduling** with proper breaks
6. **Generate time slots** within user preferences

## Output Format

Generated schedules include:
- **Task breakdown** with start/end times
- **Priority levels** (High, Medium, Low)
- **Category icons** for visual organization
- **Duration tracking** for each activity
- **Break scheduling** between tasks
- **Summary statistics** (total tasks, duration, priorities)

## Download Feature

Students can download schedules as:
- **HTML files** with professional formatting
- **Print-ready** layouts
- **Mobile-responsive** design
- **Color-coded** priorities and categories

## API Endpoints

- `POST /api/task-scheduler/create` - Create new schedule
- `GET /api/task-scheduler/schedules` - Get user schedules
- `DELETE /api/task-scheduler/schedules/:id` - Delete schedule
- `GET /api/task-scheduler/download/:id` - Download schedule

## Customization Options

Users can set:
- **Start Time**: When their day begins
- **End Time**: When their day ends
- **Break Duration**: Length of breaks between tasks
- **Priority Tasks**: Specific high-priority items

## Production Considerations

✅ **Database**: Proper indexing and constraints
✅ **Security**: User-specific data access
✅ **Performance**: Optimized queries and caching
✅ **Error Handling**: Comprehensive error management
✅ **Validation**: Input sanitization and validation
✅ **Responsive Design**: Works on all devices
✅ **Accessibility**: Screen reader compatible

## Testing

Test the feature with various inputs:
1. Simple daily routines
2. Complex work schedules
3. Mixed academic and personal tasks
4. Different time preferences
5. Various break durations

The AI is designed to handle ambiguous inputs and create realistic, actionable schedules.