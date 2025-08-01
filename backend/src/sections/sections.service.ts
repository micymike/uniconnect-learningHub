import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Section } from './interfaces/section.interface';
import { CreateSectionDto, UpdateSectionDto } from './dto/sections.dto';

@Injectable()
export class SectionsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient
  ) {}

  async findAllByCourse(courseId: string): Promise<Section[]> {
    const { data, error } = await this.supabase
      .from('sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order', { ascending: true });

    if (error) throw new Error(`Failed to fetch sections: ${error.message}`);
    return data || [];
  }

  async findOne(id: string): Promise<Section> {
    const { data, error } = await this.supabase
      .from('sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Section not found: ${error.message}`);
    return data;
  }

  async create(createSectionDto: CreateSectionDto): Promise<Section> {
    // order position
    await this.validateOrderPosition(createSectionDto.course_id, createSectionDto.order);

    const { data, error } = await this.supabase
      .from('sections')
      .insert({
        ...createSectionDto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create section: ${error.message}`);
    return data;
  }

  async update(id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    if (updateSectionDto.order !== undefined) {
      const currentSection = await this.findOne(id);
      await this.validateOrderPosition(currentSection.course_id, updateSectionDto.order);
    }

    const { data, error } = await this.supabase
      .from('sections')
      .update({
        ...updateSectionDto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update section: ${error.message}`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sections')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete section: ${error.message}`);
  }

  private async validateOrderPosition(courseId: string, order: number): Promise<void> {
    const { count } = await this.supabase
      .from('sections')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .eq('order', order);

    if (count && count > 0) {
      throw new Error(`Order position ${order} is already taken in this course`);
    }
  }

  async reorderSections(courseId: string, newOrder: string[]): Promise<void> {
    const updates = newOrder.map((id, index) => ({
      id,
      order: index + 1,
      updated_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('sections')
      .upsert(updates)
      .eq('course_id', courseId);

    if (error) throw new Error(`Failed to reorder sections: ${error.message}`);
  }
}