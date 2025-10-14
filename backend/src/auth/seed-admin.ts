import * as dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const config = app.get(ConfigService);

  const adminEmail = 'mosesmichael878@gmail.com';
  const adminPassword = '@TempSupaAdminPass1'; // Set a secure temp password, should be changed by user
  const adminRole = 'supaadmin';
  const adminFullName = 'Supaadmin User';

  // Check if user exists in Supabase Auth
  const supabaseAdmin = authService['supabaseAdmin'];
  const { data: userList, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
  const existing = userList?.users?.find((u: any) => u.email === adminEmail);

  if (existing) {
    // Ensure role is admin in user_profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: adminRole })
      .eq('id', existing.id)
      .select()
      .single();
    if (profileError) {
      console.error('Failed to update admin role:', profileError);
      process.exit(1);
    }
    console.log('Admin user already exists. Role updated if needed.');
    process.exit(0);
  }

  // Register new admin user
  try {
    await authService.register({
      email: adminEmail,
      password: adminPassword,
      role: adminRole,
      fullName: adminFullName,
    });
    console.log('Admin user created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exit(1);
  }
}

seedAdmin();
