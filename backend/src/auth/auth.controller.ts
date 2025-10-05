import { Controller, Post, Body, Get, UseGuards, Request, Param, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { Response, Request as ExpressRequest } from 'express';
import { UseGuards as PassportUseGuards } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

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

  // Google OAuth endpoints
  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuthRedirect(@Req() req: ExpressRequest, @Res() res: Response) {
    try {
      // req.user is populated by GoogleStrategy
      const user = req.user as any;
      // Issue JWT or session using AuthService
      const tokens = await this.authService.googleLogin(user);
      // Redirect to frontend with tokens (or set cookie/session)
      const frontendUrl = process.env.FRONTEND_URLS?.split(',')[0] || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?access_token=${tokens.access_token}`);
    } catch (error) {
      console.error('Google auth error:', error);
      const frontendUrl = process.env.FRONTEND_URLS?.split(',')[0] || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=Authentication failed. Please try again.`);
    }
  }
}
