/**
 * TypeScript interface for StudentAIContext, matching the Supabase table structure.
 * This replaces the previous Mongoose schema.
 */

export interface StudentAIContext {
  student_id: string;
  conversation_history: string[] | null;
  flashcard_preferences: string[] | null;
  personalization: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}
