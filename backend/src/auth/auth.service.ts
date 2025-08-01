import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/interfaces/user.interface';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject('SUPABASE_CLIENT') private supabase: SupabaseClient
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (!passwordMatch) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };
  }

  async register(
    email: string, 
    password: string, 
    role: UserRole = UserRole.STUDENT
  ) {
    // Checks user existence
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(email, hashed, role);
    const { password: _, ...userWithoutPassword } = user;
    return this.login(userWithoutPassword);
  }
}