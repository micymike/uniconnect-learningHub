import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StudySessionsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  async getStudySessions(userId: string, partnerId: string) {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .select(`
        id, title, description, start_time, end_time, status, created_by,
        user_profiles!study_sessions_created_by_fkey(full_name)
      `)
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
      .order('start_time', { ascending: true });

    if (error) throw new Error(`Failed to fetch study sessions: ${error.message}`);

    return data?.map(session => ({
      ...session,
      created_by_name: (session.user_profiles as any)?.full_name || 'Unknown',
      participants: [userId, partnerId]
    })) || [];
  }

  async createStudySession(
    userId: string, 
    partnerId: string, 
    title: string, 
    description: string, 
    startTime: string, 
    endTime: string
  ) {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert({
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        created_by: userId,
        user1_id: userId,
        user2_id: partnerId,
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create study session: ${error.message}`);
    return data;
  }

  async updateSessionStatus(sessionId: string, userId: string, status: string) {
    const { data: session } = await this.supabase
      .from('study_sessions')
      .select('user1_id, user2_id')
      .eq('id', sessionId)
      .single();

    if (!session || (session.user1_id !== userId && session.user2_id !== userId)) {
      throw new ForbiddenException('You can only update sessions you are part of');
    }

    const { data, error } = await this.supabase
      .from('study_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update study session: ${error.message}`);
    return data;
  }

  async deleteStudySession(sessionId: string, userId: string) {
    const { data: session } = await this.supabase
      .from('study_sessions')
      .select('created_by')
      .eq('id', sessionId)
      .single();

    if (!session || session.created_by !== userId) {
      throw new ForbiddenException('You can only delete sessions you created');
    }

    const { error } = await this.supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw new Error(`Failed to delete study session: ${error.message}`);
  }
}