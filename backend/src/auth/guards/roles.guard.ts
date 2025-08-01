import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { UserRole } from '../../users/interfaces/user.interface';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient
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

    // Verify user and role
    if (!user?.sub) {
      throw new ForbiddenException('Invalid user');
    }

    const { data: dbUser, error } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', user.sub)
      .single();

    if (error || !dbUser) {
      throw new ForbiddenException('User not found');
    }

    if (!requiredRoles.includes(dbUser.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    request.user.role = dbUser.role;
    return true;
  }
}