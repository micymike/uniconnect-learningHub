export type Database = {
    public: {
      Tables: {
        courses: {
 
        Row: {
            id: string
            title: string
            description: string | null
            created_by: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            title: string
            description?: string | null
            created_by: string
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            title?: string
            description?: string | null
            created_by?: string
            created_at?: string
            updated_at?: string
          }
        }
        user_profiles: {
          Row: {
            id: string
            email: string
            password: string
            role: string
            created_at: string
            updated_at: string
          }
        },
        student_ai_context: {
          Row: {
            student_id: string
            conversation_history: string[] | null
            flashcard_preferences: string[] | null
            personalization: Record<string, any> | null
            created_at: string
            updated_at: string
          }
          Insert: {
            student_id: string
            conversation_history?: string[] | null
            flashcard_preferences?: string[] | null
            personalization?: Record<string, any> | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            student_id?: string
            conversation_history?: string[] | null
            flashcard_preferences?: string[] | null
            personalization?: Record<string, any> | null
            created_at?: string
            updated_at?: string
          }
        }
        task_schedules: {
          Row: {
            id: string
            user_id: string
            title: string
            schedule_date: string
            tasks: Record<string, any>[]
            total_duration: number
            created_at: string
            updated_at: string
          }
          Insert: {
            id: string
            user_id: string
            title: string
            schedule_date: string
            tasks: Record<string, any>[]
            total_duration: number
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            user_id?: string
            title?: string
            schedule_date?: string
            tasks?: Record<string, any>[]
            total_duration?: number
            created_at?: string
            updated_at?: string
          }
        }
      }
    
    }
  }
