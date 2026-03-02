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
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(now.getDate() - 14);

      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

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

      const { count: totalLessons } = await this.supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      const { count: totalQuizzes } = await this.supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true });

      // Platform overview metrics derived from user_profiles timestamps
      const { count: activeStudents } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', UserRole.STUDENT)
        .gte('updated_at', thirtyDaysAgo.toISOString());

      const { count: newStudentsThisWeek } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', UserRole.STUDENT)
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: newStudentsPreviousWeek } = await this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', UserRole.STUDENT)
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      const prev = newStudentsPreviousWeek || 0;
      const current = newStudentsThisWeek || 0;
      const platformGrowthPct = prev === 0
        ? (current > 0 ? 100 : 0)
        : Math.round(((current - prev) / prev) * 100);

      return {
        totalUsers,
        totalStudents,
        totalAdmins,
        totalCourses,
        totalLessons,
        totalQuizzes,
        activeStudents,
        newStudentsThisWeek,
        platformGrowthPct,
        completionRatePct: null,
      };
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
}
