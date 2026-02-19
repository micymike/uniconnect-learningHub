import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret';
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Support both 'userId' and 'sub' as user ID
    return {
      userId: payload.userId || payload.sub,
      email: payload.email,
      full_name: payload.full_name,
      role: payload.role,
      avatar_url: payload.avatar_url,
      provider: payload.provider,
      google_id: payload.google_id,
    };
  }
}
