import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Course } from './interfaces/course.interface';
import { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';
import { Database } from '../types/supabase';

@Injectable()
export class CoursesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient<Database>
  ) {}

  async findAll(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
    return data || [];
  }

  async create(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .insert({
        ...courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
    return data;
  }

  async update(id: string, updateData: UpdateCourseDto): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update course: ${error.message}`);
    }
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }
}