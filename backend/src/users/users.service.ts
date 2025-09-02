import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  [x: string]: any;
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
    @Inject('SUPABASE_ADMIN_CLIENT') private supabaseAdmin: SupabaseClient,
  ) {}

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new NotFoundException('User profile not found');
    }

    return data;
  }


  async deleteUser(userId: string) {
    const { error: profileError } = await this.supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    const { error: authError } = await this.supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Failed to delete auth user: ${authError.message}`);
    }

    return { message: 'User deleted successfully' };
  }

  // List all users except the current user and existing study partners
  async listAllUsersExcept(userId: string, offset = 0, limit = 20) {
    // Get existing study partner IDs (bidirectional lookup)
    const { data: partners } = await this.supabase
      .from('study_partners')
      .select('user_id, partner_id')
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`);
    
    const partnerIds = partners?.map(p => 
      p.user_id === userId ? p.partner_id : p.user_id
    ) || [];
    const excludeIds = [userId, ...partnerIds];

    if (excludeIds.length === 1) {
      // Only excluding current user
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url')
        .neq('id', userId)
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      return data;
    } else {
      // Excluding current user and partners
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      return data;
    }
  }

  // Add a study partner relationship
  async addStudyPartner(userId: string, partnerId: string) {
    if (userId === partnerId) {
      throw new Error("You cannot add yourself as a study partner.");
    }
    
    // Check if partnership already exists
    const { data: existing } = await this.supabase
      .from('study_partners')
      .select('*')
      .or(`and(user_id.eq.${userId},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${userId})`);
    
    if (existing && existing.length > 0) {
      // Return a custom error message for frontend to handle gracefully
      throw new Error("This user is already your study partner.");
    }

    // Create single relationship using admin client to bypass RLS
    const { data, error } = await this.supabaseAdmin
      .from('study_partners')
      .insert({ user_id: userId, partner_id: partnerId })
      .select();

    if (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes("duplicate key value violates unique constraint")
      ) {
        throw new Error("This user is already your study partner.");
      }
      throw new Error(`Failed to add study partner: ${error.message}`);
    }

    return data[0];
  }

  // Get user's study partners (bidirectional lookup)
  async getStudyPartners(userId: string) {
    const { data, error } = await this.supabase
      .from('study_partners')
      .select(`
        user_id, partner_id,
        user_profiles!study_partners_partner_id_fkey(id, email, full_name, avatar_url),
        partner_profiles:user_profiles!study_partners_user_id_fkey(id, email, full_name, avatar_url)
      `)
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`);

    if (error) {
      throw new Error(`Failed to fetch study partners: ${error.message}`);
    }

    return data?.map(item => {
      // Return the other person in the partnership
      if (item.user_id === userId) {
        return item.user_profiles;
      } else {
        return item.partner_profiles;
      }
    }).filter(Boolean) || [];
  }
}
