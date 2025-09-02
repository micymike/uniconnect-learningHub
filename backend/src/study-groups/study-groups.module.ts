import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { StudyGroupsController } from './study-groups.controller';
import { StudyGroupsService } from './study-groups.service';

@Module({
  imports: [SupabaseModule],
  controllers: [StudyGroupsController],
  providers: [StudyGroupsService],
  exports: [StudyGroupsService],
})
export class StudyGroupsModule {}