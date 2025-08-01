import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Quiz } from './interfaces/quiz.interface';
import { CreateQuizDto, UpdateQuizDto } from './dto/quizzes.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient
  ) {}

  async findOne(id: string): Promise<Quiz> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error('Quiz not found');
    return data;
  }

  async findByLesson(lessonId: string): Promise<Quiz[]> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId);

    if (error) throw new Error('Failed to fetch quizzes');
    return data || [];
  }

  async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .insert({
        ...createQuizDto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create quiz');
    return data;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .update({
        ...updateQuizDto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('Failed to update quiz');
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete quiz');
  }
}