export interface Quiz {
    id: string; 
    title: string;
    lesson_id: string; 
    questions: {
      question: string;
      options: string[];
      answer: string;
    }[];
    created_at: string;
    updated_at: string;
  }