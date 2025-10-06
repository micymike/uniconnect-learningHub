import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const SUPABASE_JWKS_URI = 'https://wahinecnedhlrpicuswp.supabase.co/auth/v1/keys'; // Replace with your Supabase project JWKS endpoint

@Injectable()
export class JwtMultiAuthStrategy extends PassportStrategy(Strategy, 'jwt-multiauth') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_jwt_secret', // Used for manual JWTs
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Try manual JWT validation first
    try {
      // If token is valid with backend secret, return payload
      return {
        userId: payload.userId || payload.sub,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role,
        avatar_url: payload.avatar_url,
        provider: payload.provider,
        google_id: payload.google_id,
      };
    } catch (err) {
      // If manual validation fails, try Supabase JWT validation
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!token) throw new UnauthorizedException('No token found');

      // Decode header to get kid
      const decodedHeader = jwt.decode(token, { complete: true })?.header;
      if (!decodedHeader || !decodedHeader.kid) throw new UnauthorizedException('Invalid token header');

      // Fetch signing key from Supabase JWKS
      const client = jwksClient({ jwksUri: SUPABASE_JWKS_URI });
      const getKey = (header: any, callback: any) => {
        client.getSigningKey(header.kid, (err, key) => {
          if (err) return callback(err);
          if (!key) return callback(new Error('Signing key not found'));
          const signingKey = key.getPublicKey();
          callback(null, signingKey);
        });
      };

      // Verify token with Supabase public key
      return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {}, (err, decoded: any) => {
          if (err) return reject(new UnauthorizedException('Invalid Supabase token'));
          resolve({
            userId: decoded.sub,
            email: decoded.email,
            full_name: decoded.full_name,
            role: decoded.role,
            avatar_url: decoded.avatar_url,
            provider: decoded.provider,
            google_id: decoded.google_id,
          });
        });
      });
    }
  }
}
