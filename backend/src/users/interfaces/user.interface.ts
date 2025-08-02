export enum UserRole {
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