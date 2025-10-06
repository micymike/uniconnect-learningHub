import { Injectable, Inject, NotFoundException, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
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

  // Create a study partner request
  async createStudyPartnerRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      throw new BadRequestException("You cannot send a request to yourself.");
    }

    // Check for existing pending request
    const { data: existing } = await this.supabase
      .from('study_partner_requests')
      .select('*')
      .eq('requester_id', requesterId)
      .eq('recipient_id', recipientId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      throw new ConflictException("A pending request already exists.");
    }

    // Insert new request
    const { data, error } = await this.supabaseAdmin
      .from('study_partner_requests')
      .insert({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending'
      })
      .select()
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to create request: ${error.message}`);
    }

    return data;
  }

  // List incoming study partner requests
  async getIncomingPartnerRequests(userId: string) {
    const { data, error } = await this.supabase
      .from('study_partner_requests')
      .select(`
        id, requester_id, recipient_id, status, created_at,
        requester:requester_id(id, email, full_name, avatar_url)
      `)
      .eq('recipient_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to fetch requests: ${error.message}`);
    }

    return data;
  }

  // Respond to a study partner request
  async respondToPartnerRequest(userId: string, requestId: string, action: 'accept' | 'decline') {
    // Get the request
    const { data: request, error: reqError } = await this.supabase
      .from('study_partner_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (reqError || !request) {
      throw new NotFoundException("Request not found.");
    }
    if (request.recipient_id !== userId) {
      throw new UnauthorizedException("You are not authorized to respond to this request.");
    }
    if (request.status !== 'pending') {
      throw new BadRequestException("Request is not pending.");
    }

    // Check for duplicate request with new status
    const { data: duplicate } = await this.supabase
      .from('study_partner_requests')
      .select('*')
      .eq('requester_id', request.requester_id)
      .eq('recipient_id', request.recipient_id)
      .eq('status', action === 'accept' ? 'accepted' : 'declined')
      .maybeSingle();

    if (duplicate) {
      throw new ConflictException(`A request with this status already exists for these users.`);
    }

    // Update request status
    const { error: updateError } = await this.supabaseAdmin
      .from('study_partner_requests')
      .update({
        status: action === 'accept' ? 'accepted' : 'declined',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('status', 'pending');

    if (updateError) {
      throw new BadRequestException(`Failed to update request: ${updateError.message}`);
    }

    // If accepted, add to study_partners
    if (action === 'accept') {
      // Check if already partners
      const { data: existing } = await this.supabase
        .from('study_partners')
        .select('*')
        .or(`and(user_id.eq.${request.requester_id},partner_id.eq.${request.recipient_id}),and(user_id.eq.${request.recipient_id},partner_id.eq.${request.requester_id})`);

      if (!existing || existing.length === 0) {
        // Insert partnership
        const { error: partnerError } = await this.supabaseAdmin
          .from('study_partners')
          .insert([
            { user_id: request.requester_id, partner_id: request.recipient_id }
          ]);
        
        if (partnerError && !partnerError.message.includes('duplicate key')) {
          throw new BadRequestException(`Failed to create partnership: ${partnerError.message}`);
        }
      }
    }

    return { status: action, requester_id: request.requester_id, recipient_id: request.recipient_id };
  }

  async deleteUser(userId: string) {
    const { error: profileError } = await this.supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw new BadRequestException(`Failed to delete profile: ${profileError.message}`);
    }

    const { error: authError } = await this.supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      throw new BadRequestException(`Failed to delete auth user: ${authError.message}`);
    }

    return { message: 'User deleted successfully' };
  }

  // List all users except the current user, existing study partners, and pending requests
  async listAllUsersExcept(userId: string, offset = 0, limit = 20) {
    // Get existing study partner IDs (bidirectional lookup)
    const { data: partners } = await this.supabase
      .from('study_partners')
      .select('user_id, partner_id')
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`);
    
    // Get pending request IDs (both sent and received)
    const { data: pendingRequests } = await this.supabase
      .from('study_partner_requests')
      .select('requester_id, recipient_id')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'pending');
    
    const partnerIds = partners?.map(p => 
      p.user_id === userId ? p.partner_id : p.user_id
    ) || [];
    
    const pendingIds = pendingRequests?.map(r => 
      r.requester_id === userId ? r.recipient_id : r.requester_id
    ) || [];
    
    const excludeIds = [userId, ...partnerIds, ...pendingIds];

    if (excludeIds.length === 1) {
      // Only excluding current user
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url')
        .neq('id', userId)
        .range(offset, offset + limit - 1);

      if (error) {
        throw new BadRequestException(`Failed to fetch users: ${error.message}`);
      }
      return data;
    } else {
      // Excluding current user, partners, and pending requests
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .range(offset, offset + limit - 1);

      if (error) {
        throw new BadRequestException(`Failed to fetch users: ${error.message}`);
      }
      return data;
    }
  }

  // Add a study partner relationship
  async addStudyPartner(userId: string, partnerId: string) {
    if (userId === partnerId) {
      throw new BadRequestException("You cannot add yourself as a study partner.");
    }
    
    // Check if partnership already exists
    const { data: existing } = await this.supabase
      .from('study_partners')
      .select('*')
      .or(`and(user_id.eq.${userId},partner_id.eq.${partnerId}),and(user_id.eq.${partnerId},partner_id.eq.${userId})`);
    
    if (existing && existing.length > 0) {
      // Return a custom error message for frontend to handle gracefully
      throw new ConflictException("This user is already your study partner.");
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
        throw new ConflictException("This user is already your study partner.");
      }
      throw new BadRequestException(`Failed to add study partner: ${error.message}`);
    }

    return data[0];
  }

  // Get user's study partners (bidirectional lookup)
  async getStudyPartners(userId: string) {
    console.log('getStudyPartners called with userId:', userId);
    
    // Simple approach: get all partnerships and then fetch user profiles separately
    const { data: partnerships, error } = await this.supabase
      .from('study_partners')
      .select('user_id, partner_id')
      .or(`user_id.eq.${userId},partner_id.eq.${userId}`);

    console.log('Partnerships query result:', { partnerships, error });

    if (error) {
      console.error('Error fetching partnerships:', error);
      throw new BadRequestException(`Failed to fetch study partners: ${error.message}`);
    }

    if (!partnerships || partnerships.length === 0) {
      console.log('No partnerships found for user:', userId);
      return [];
    }

    // Get the partner IDs
    const partnerIds = partnerships.map(p => 
      p.user_id === userId ? p.partner_id : p.user_id
    );
    
    console.log('Partner IDs:', partnerIds);

    // Fetch user profiles for these partners
    const { data: profiles, error: profileError } = await this.supabase
      .from('user_profiles')
      .select('id, email, full_name, avatar_url')
      .in('id', partnerIds);

    console.log('Profiles query result:', { profiles, profileError });

    if (profileError) {
      console.error('Error fetching partner profiles:', profileError);
      throw new BadRequestException(`Failed to fetch partner profiles: ${profileError.message}`);
    }

    return profiles || [];
  }
}
