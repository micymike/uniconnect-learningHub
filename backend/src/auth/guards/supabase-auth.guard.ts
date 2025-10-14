import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Determine role - super admin gets admin role
      let userRole = user.user_metadata?.role || 'student';
      if (user.email === 'mosesmichael878@gmail.com') {
        userRole = 'admin';
      }

      // Attach user to request
      request.user = {
        id: user.id,
        userId: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role: userRole,
        sub: user.id,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}