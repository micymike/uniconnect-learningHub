import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Lesson } from './interfaces/lesson.interface';
import { CreateLessonDto, UpdateLessonDto } from './dto/lessons.dto';

@Injectable()
export class LessonsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient
  ) {}

  async findOne(id: string): Promise<Lesson> {
    const { data, error } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error('Lesson not found');
    return data;
  }

  async findBySection(sectionId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('section_id', sectionId)
      .order('order', { ascending: true });

    if (error) throw new Error('Failed to fetch lessons');
    return data || [];
  }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { data, error } = await this.supabase
      .from('lessons')
      .insert({
        ...createLessonDto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error('Failed to create lesson');
    return data;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const { data, error } = await this.supabase
      .from('lessons')
      .update({
        ...updateLessonDto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('Failed to update lesson');
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete lesson');
  }
}