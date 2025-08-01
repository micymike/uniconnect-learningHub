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
        users: {
          Row: {
            id: string
            email: string
            password: string
            role: string
            created_at: string
            updated_at: string
          }
        }
      }
    
    }
  }