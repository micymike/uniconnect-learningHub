import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SharedNotesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  async getSharedNotes(userId: string, partnerId: string) {
    const { data, error } = await this.supabase
      .from('shared_notes')
      .select(`
        id, title, content, created_by, created_at, updated_at,
        user_profiles!shared_notes_created_by_fkey(full_name)
      `)
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch shared notes: ${error.message}`);

    return data?.map(note => ({
      ...note,
      author_name: (note.user_profiles as any)?.full_name || 'Unknown',
      can_edit: note.created_by === userId
    })) || [];
  }

  async createSharedNote(userId: string, partnerId: string, title: string, content: string) {
    const { data, error } = await this.supabase
      .from('shared_notes')
      .insert({
        title,
        content,
        created_by: userId,
        user1_id: userId,
        user2_id: partnerId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create shared note: ${error.message}`);
    return data;
  }

  async updateSharedNote(noteId: string, userId: string, title: string, content: string) {
    const { data: note } = await this.supabase
      .from('shared_notes')
      .select('created_by')
      .eq('id', noteId)
      .single();

    if (!note || note.created_by !== userId) {
      throw new ForbiddenException('You can only edit your own notes');
    }

    const { data, error } = await this.supabase
      .from('shared_notes')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update shared note: ${error.message}`);
    return data;
  }

  async deleteSharedNote(noteId: string, userId: string) {
    const { data: note } = await this.supabase
      .from('shared_notes')
      .select('created_by')
      .eq('id', noteId)
      .single();

    if (!note || note.created_by !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    const { error } = await this.supabase
      .from('shared_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw new Error(`Failed to delete shared note: ${error.message}`);
  }
}