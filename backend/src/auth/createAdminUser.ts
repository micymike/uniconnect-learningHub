import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

// This script should be run in a NestJS context (e.g. via CLI or bootstrap)
// It checks if the admin user exists, and creates it if not.

async function createAdminUser(authService: AuthService, supabaseAdmin: SupabaseClient) {
  const adminEmail = 'uniconnect693@gmail.com';
  const adminPassword = '@13353Mike ';
  const adminRole = 'admin';
  const adminFullName = 'Admin';

  // Check if user exists in user_profiles
  const { data: existing, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('email', adminEmail)
    .eq('role', adminRole)
    .single();

  if (existing) {
    console.log('Admin user already exists:', existing);
    return;
  }

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = No rows found
    console.error('Error checking for admin user:', error);
    return;
  }

  // Register admin user
  try {
    const result = await authService.register({
      email: adminEmail,
      password: adminPassword,
      role: adminRole,
      fullName: adminFullName,
    });
    console.log('Admin user created:', result);
  } catch (err) {
    console.error('Failed to create admin user:', err);
  }
}

// Example usage (in NestJS bootstrap):
// const authService = app.get(AuthService);
// const supabaseAdmin = app.get('SUPABASE_ADMIN_CLIENT');
// createAdminUser(authService, supabaseAdmin);

export { createAdminUser };
