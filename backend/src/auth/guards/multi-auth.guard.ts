import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MultiAuthGuard implements CanActivate {
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

    // Try Supabase validation first
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (!error && user) {
        request.user = {
          userId: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'student',
          sub: user.id,
        };
        return true;
      }
    } catch (e) {
      // Ignore and try backend JWT
    }

    // Fallback to backend JWT validation
    try {
      const secret = process.env.JWT_SECRET || 'default_jwt_secret';
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

      if (typeof payload === 'object' && payload !== null) {
        request.user = {
          userId: (payload as any).userId || (payload as any).sub,
          email: (payload as any).email,
          full_name: (payload as any).full_name,
          role: (payload as any).role,
          avatar_url: (payload as any).avatar_url,
          provider: (payload as any).provider,
          google_id: (payload as any).google_id,
        };
        return true;
      } else {
        throw new UnauthorizedException('Invalid JWT payload');
      }
    } catch (e) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
