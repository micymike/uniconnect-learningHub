-- Create task_schedules table for AI-powered task scheduling
CREATE TABLE IF NOT EXISTS task_schedules (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    schedule_date DATE NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_schedules_user_id ON task_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_task_schedules_date ON task_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_task_schedules_created_at ON task_schedules(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_schedules_updated_at 
    BEFORE UPDATE ON task_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE task_schedules IS 'Stores AI-generated task schedules for students';
COMMENT ON COLUMN task_schedules.id IS 'Unique identifier for the schedule';
COMMENT ON COLUMN task_schedules.user_id IS 'ID of the user who owns this schedule';
COMMENT ON COLUMN task_schedules.title IS 'Human-readable title for the schedule';
COMMENT ON COLUMN task_schedules.schedule_date IS 'Date for which this schedule is created';
COMMENT ON COLUMN task_schedules.tasks IS 'JSON array containing all tasks with their details';
COMMENT ON COLUMN task_schedules.total_duration IS 'Total duration of all tasks in minutes';