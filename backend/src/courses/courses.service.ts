import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Course } from './interfaces/course.interface';
import { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';
import { Database } from '../types/supabase';
import { User } from 'src/users/interfaces/user.interface';

@Injectable()
export class CoursesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient<Database>,
    @Inject('SUPABASE_ADMIN_CLIENT') private readonly supabaseAdmin: SupabaseClient<Database>, // admin client
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

  async findOne(id: string): Promise<Course> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch course: ${error.message}`);
    }
    return data;
  }

  async findPublished(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch published courses: ${error.message}`);
    }
    return data || [];
  }

  async findFeatured(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch featured courses: ${error.message}`);
    }
    return data || [];
  }

  async findByCategory(category: string): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch courses by category: ${error.message}`);
    }
    return data || [];
  }

  async create(courseData: CreateCourseDto, userId: string): Promise<Course> {
    const cleanedData = {
      ...courseData,
      learning_objectives: courseData.learning_objectives.filter(obj => obj.trim() !== ''),
      tags: courseData.tags.filter(tag => tag.trim() !== ''),
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('courses')
      .insert(cleanedData)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }
    return data;
  }

  async update(id: string, updateData: UpdateCourseDto): Promise<Course> {
    const cleanedData = { ...updateData };
    if (updateData.learning_objectives) {
      cleanedData.learning_objectives = updateData.learning_objectives.filter(obj => obj.trim() !== '');
    }
    if (updateData.tags) {
      cleanedData.tags = updateData.tags.filter(tag => tag.trim() !== '');
    }

    const { data, error } = await this.supabase
      .from('courses')
      .update({
        ...cleanedData,
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

  // admin-only delete using service role client
  async remove(id: string, user: User): Promise<void> {
    // double-check admin identity in application (email check is OK if you control it)
    if (user?.email !== 'mosesmichael878@gmail.com') {
      // you can throw a proper Forbidden exception instead
      throw new Error('Unauthorized');
    }

    // Perform delete with admin client (bypasses RLS)
    const { error } = await this.supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      // Prefer throwing a typed error so controller can map to HTTP code
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }
}
