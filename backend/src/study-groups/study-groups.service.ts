import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StudyGroupsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  async getGroupMembers(userId: string, partnerId: string) {
    const { data, error } = await this.supabase
      .from('study_group_members')
      .select(`
        member_id,
        user_profiles!study_group_members_member_id_fkey(
          id, email, full_name, avatar_url
        )
      `)
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`);

    if (error) throw new Error(`Failed to fetch group members: ${error.message}`);

    return data?.map(item => ({
      id: (item.user_profiles as any).id,
      email: (item.user_profiles as any).email,
      full_name: (item.user_profiles as any).full_name,
      avatar_url: (item.user_profiles as any).avatar_url
    })) || [];
  }

  async inviteToGroup(userId: string, partnerId: string, invitedUserId: string) {
    // Check if user is part of the partnership
    const { data: partnership } = await this.supabase
      .from('study_partners')
      .select('*')
      .or(`and(user_id.eq.${userId},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${userId})`)
      .single();

    if (!partnership) {
      throw new ForbiddenException('You can only invite to groups you are part of');
    }

    // Check if user is already in the group
    const { data: existing } = await this.supabase
      .from('study_group_members')
      .select('*')
      .eq('member_id', invitedUserId)
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
      .single();

    if (existing) {
      throw new Error('User is already in this study group');
    }

    const { data, error } = await this.supabase
      .from('study_group_members')
      .insert({
        user1_id: userId,
        user2_id: partnerId,
        member_id: invitedUserId,
        invited_by: userId
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to invite to group: ${error.message}`);
    return data;
  }

  async removeFromGroup(userId: string, partnerId: string, memberId: string) {
    // Check if user has permission to remove (either the inviter or the member themselves)
    const { data: member } = await this.supabase
      .from('study_group_members')
      .select('invited_by')
      .eq('member_id', memberId)
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`)
      .single();

    if (!member || (member.invited_by !== userId && memberId !== userId)) {
      throw new ForbiddenException('You can only remove members you invited or remove yourself');
    }

    const { error } = await this.supabase
      .from('study_group_members')
      .delete()
      .eq('member_id', memberId)
      .or(`and(user1_id.eq.${userId},user2_id.eq.${partnerId}),and(user1_id.eq.${partnerId},user2_id.eq.${userId})`);

    if (error) throw new Error(`Failed to remove from group: ${error.message}`);
  }
}