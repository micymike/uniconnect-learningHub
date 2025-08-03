import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient
  ) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN) // Restrict to admin users
  @ApiOperation({ summary: 'Get analytics dashboard summary' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getSummary() {
    try {
      // Verify user session
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        throw new Error('Failed to verify user session');
      }

      return await this.analyticsService.getSummary();
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
}