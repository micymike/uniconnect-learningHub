import { Injectable, UnauthorizedException, Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { RegisterDto, LoginDto } from '../dto';

@Injectable()
export class AuthGuard {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
    @Inject('SUPABASE_ADMIN_CLIENT') private supabaseAdmin: SupabaseClient,
    private config: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
        options: {
          data: { 
            role: registerDto.role,
            full_name: registerDto.fullName || '',
          },
          emailRedirectTo: this.config.get('EMAIL_REDIRECT_URL'),
        },
      });

      if (authError) {
        throw new UnauthorizedException(`Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new UnauthorizedException('User creation failed');
      }



      // profile check
      const { data: existingProfile, error: checkError } = await this.supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();


      if (existingProfile) {
        console.log('Profile already exists, returning existing profile');
        return {
          user: authData.user,
          profile: existingProfile,
          session: authData.session,
          message: 'Registration successful. Please check your email to confirm your account.',
        };
      }

      // Upsert

      const { data: profileData, error: profileError } = await this.supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          email: authData.user.email,
          role: registerDto.role,
          full_name: registerDto.fullName || '',
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        console.error('Full profile error object:', JSON.stringify(profileError, null, 2));
        
        // Clean up the auth user if profile creation fails
        await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        
        throw new BadRequestException(`Profile creation failed: ${profileError.message}`);
      }



      return {
        user: authData.user,
        profile: profileData,
        session: authData.session,
        message: 'Registration successful. Please check your email to confirm your account.',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedException('Login failed');
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      return {
        user: data.user,
        session: data.session,
        profile: profile || null,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return {
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required');
      }

      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException(`Token refresh failed: ${error.message}`);
      }

      if (!data.session || !data.user) {
        throw new UnauthorizedException('Failed to refresh session');
      }

      // Get updated profile
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        user: data.user,
        session: data.session,
        profile: profile || null,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async getCurrentUser(accessToken: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(accessToken);
      
      if (error || !user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Get user profile
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        user,
        profile: profile || null,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: this.config.get('PASSWORD_RESET_REDIRECT_URL'),
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(accessToken: string, newPassword: string) {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser(accessToken);
      
      if (userError || !user) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      // Establish password reset session
      const { data: sessionData, error: sessionError } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '', 
      });

      if (sessionError) {
        throw new UnauthorizedException('Failed to establish session for password reset');
      }

      // Update password
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<{ full_name: string; role: string }>) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Profile update failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}