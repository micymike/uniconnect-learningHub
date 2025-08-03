import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../users/interfaces/user.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient
  ) {}

  async getSummary() {
    try {
      // number of platform users
      const { count: totalUsers } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // number of students
      const { count: totalStudents } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', UserRole.STUDENT);

      // number of admins
      const { count: totalAdmins } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', UserRole.ADMIN);

      // nuber of courses
      const { count: totalCourses } = await this.supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalCourses,
      };
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
}
