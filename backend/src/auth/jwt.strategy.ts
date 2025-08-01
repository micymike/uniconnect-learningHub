import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret',
    });
  }

  async validate(payload: any) {
     //validate and fetch user
    const { data: user } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}