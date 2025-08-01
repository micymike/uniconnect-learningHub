export interface Lesson {
    id: string;
    title: string;
    content?: string;
    order: number;
    section_id: string;
    quiz_ids?: string[];
    created_at: string;
    updated_at: string;
  }