export enum UserRole {
  SUPAADMIN = 'supaadmin',
  ADMIN = 'admin',
  STUDENT = 'student'
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string | null;
}
