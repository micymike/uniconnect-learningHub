import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

@Global()
@Module({})
export class SupabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: SupabaseModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'SUPABASE_CLIENT',
          useFactory: (configService: ConfigService): SupabaseClient<Database> => {
            const url = configService.get<string>('SUPABASE_URL');
            const key = configService.get<string>('SUPABASE_KEY');
            
            if (!url || !key) {
              throw new Error('Supabase URL and Key must be provided');
            }
            
            return createClient<Database>(url, key);
          },
          inject: [ConfigService],
        },
      ],
      exports: ['SUPABASE_CLIENT'],
    };
  }
}