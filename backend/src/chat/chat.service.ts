import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { ChatMessage, StudyMate, UserStatus } from './interfaces/chat.interface';
import { SendMessageDto, EditMessageDto, AddStudyMateDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
    @Inject('SUPABASE_ADMIN_CLIENT') private adminSupabase: SupabaseClient
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto): Promise<ChatMessage> {
    const { data, error } = await this.adminSupabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        receiver_id: dto.receiverId,
        content: dto.content,
        timestamp: new Date().toISOString(),
        is_edited: false,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw new Error(error.message);
    }
    console.log('Message saved to database:', data);
    return this.mapMessage(data);
  }

  async getMessages(userId: string, otherUserId: string, limit = 50): Promise<ChatMessage[]> {
    console.log('[getMessages] userId:', userId, 'otherUserId:', otherUserId, 'limit:', limit);
    if (!userId || !otherUserId || userId === 'undefined' || otherUserId === 'undefined') {
      return [];
    }

    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .eq('is_deleted', false)
      .order('timestamp', { ascending: false })
      .limit(limit);

    console.log('[getMessages] returned data:', JSON.stringify(data, null, 2), 'error:', error);

    if (error) return [];
    return data ? data.map(this.mapMessage).reverse() : [];
  }

  async editMessage(messageId: string, userId: string, dto: EditMessageDto): Promise<ChatMessage> {
    const { data: message } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .eq('sender_id', userId)
      .single();

    if (!message) throw new Error('Message not found');

    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

    if (diffMinutes > 15) throw new Error('Cannot edit message after 15 minutes');

    const { data, error } = await this.supabase
      .from('chat_messages')
      .update({
        content: dto.content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapMessage(data);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) throw new Error(error.message);
  }

  async addStudyMate(userId: string, dto: AddStudyMateDto): Promise<StudyMate> {
    const { data, error } = await this.supabase
      .from('study_mates')
      .insert({
        user_id: userId,
        study_mate_id: dto.studyMateId,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapStudyMate(data);
  }

  async getStudyMates(userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('study_mates')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error || !data) return [];
    
    const { data: users } = await this.supabase.auth.admin.listUsers();
    if (!users || !Array.isArray(users.users)) return [];
    
    return data.map(sm => {
      const user = (users.users as Array<{ id: string; email: string; user_metadata?: any }>).find(u => u.id === sm.study_mate_id);
      return {
        ...sm,
        user: user || { id: sm.study_mate_id, email: 'Unknown', user_metadata: { full_name: 'Unknown User' } },
        is_online: true,
        last_seen: new Date(),
        is_typing: false
      };
    });
  }

  async searchOnlineUsers(userId: string, query: string): Promise<any[]> {
    const { data: users, error } = await this.supabase.auth.admin.listUsers();
    if (error) return [];
    
    return users.users
      .filter(user => 
        user.id !== userId &&
        user.user_metadata?.full_name?.toLowerCase().includes(query.toLowerCase())
      )
      .map(user => ({
        user,
        is_online: true,
        last_seen: new Date(),
        is_typing: false
      }));
  }

  async updateUserStatus(userId: string, isOnline: boolean, isTyping = false, typingTo?: string): Promise<void> {
    // Bypass RLS by using service role client
    try {
      const { createClient } = require('@supabase/supabase-js');
      const serviceClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await serviceClient
        .from('user_status')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          is_typing: isTyping,
          typing_to: typingTo,
        });
    } catch (error) {
      console.warn('Failed to update user status:', error);
    }
  }

  async getAvailableUsers(): Promise<any[]> {
    const { data, error } = await this.adminSupabase
      .from('user_profiles')
      .select('*')
      .limit(20);

console.log('getAvailableUsers raw user_profiles:', JSON.stringify(data, null, 2));
console.log('getAvailableUsers error:', error);

if (error || !data) return [];
    
return data.map(user => ({
  id: user.id,
  user: {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.full_name && user.full_name.trim().length > 0
        ? user.full_name
        : (user.name || user.username || user.email),
      avatar_url: user.avatar_url || null,
      role: user.role || 'user',
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  },
  is_online: true,
  last_seen: new Date(),
  is_typing: false
}));
  }

  private mapMessage(data: any): ChatMessage {
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      timestamp: new Date(data.timestamp),
      isEdited: data.is_edited,
      editedAt: data.edited_at ? new Date(data.edited_at) : undefined,
      isDeleted: data.is_deleted,
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined,
    };
  }

  async getUserInfo(userId: string): Promise<{ full_name?: string; email?: string } | null> {
    try {
      const { data, error } = await this.adminSupabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
      
      if (error || !data) return null;
      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  private mapStudyMate(data: any): StudyMate {
    return {
      id: data.id,
      userId: data.user_id,
      studyMateId: data.study_mate_id,
      status: data.status,
      createdAt: new Date(data.created_at),
    };
  }

}
