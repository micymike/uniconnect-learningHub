export enum UserRole {
    STUDENT = 'student',
    ADMIN = 'admin',
  }
  
  export interface User {
    id: string; 
    email: string;
    password: string; 
    role: UserRole;
    created_at: string; 
    updated_at: string;
  }
  
  export interface UserQueryResult {
    data: User | null;
    error: any;
  }