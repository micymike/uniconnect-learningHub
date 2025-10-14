import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { UserRole } from '../../users/interfaces/user.interface';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

  
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No user found in request. Is JwtAuthGuard applied?');
    }

    if (!user.sub) {
      throw new ForbiddenException('Invalid user payload (missing sub).');
    }

    // Super admin bypass
    if (user.email === 'mosesmichael878@gmail.com') {
      request.user.role = 'admin';
      return requiredRoles.includes(UserRole.ADMIN);
    }

    const { data: dbUser, error } = await this.supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.sub)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new ForbiddenException('Error fetching user from database.');
    }

    if (!dbUser) {
      throw new ForbiddenException('User not found in database.');
    }

    if (!requiredRoles.includes(dbUser.role)) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    request.user.role = dbUser.role;

    return true;
  }
}
