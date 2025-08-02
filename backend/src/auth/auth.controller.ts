import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  @Post('refresh')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('access_token') accessToken: string,
    @Body('new_password') newPassword: string,
  ) {
    return this.authService.resetPassword(accessToken, newPassword);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.headers.authorization?.split(' ')[1]);
  }

  @Post('update-profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updates: { full_name?: string; role?: string },
  ) {
    return this.authService.updateProfile(req.user.id, updates);
  }
}