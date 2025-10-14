export interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    duration_hours: number;
    price: number;
    is_free: boolean;
    thumbnail_url?: string;
    intro_video_url?: string;
    video_content_url?: string;
    prerequisites?: string;
    learning_objectives: string[];
    tags: string[];
    status: 'draft' | 'published';
    is_featured: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}