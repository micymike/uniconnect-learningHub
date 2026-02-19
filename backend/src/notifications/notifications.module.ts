import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, SupabaseAuthGuard],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}