import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { VerifyResetTokenDto } from './dto/verify-reset-token.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
// import { AppleAuthGuard } from './guards/apple-auth.guard'; // Temporarily disabled
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('verify-reset-token')
  async verifyResetToken(@Body() verifyResetTokenDto: VerifyResetTokenDto) {
    return this.authService.verifyResetToken(verifyResetTokenDto.token,verifyResetTokenDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.email, resetPasswordDto.token, resetPasswordDto.newPassword);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: Request) {
    // This route will redirect to Google OAuth
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  // Apple authentication routes temporarily disabled
  /*
  @Get('apple')
  @UseGuards(AppleAuthGuard)
  async appleAuth(@Req() req: Request) {
    // This route will redirect to Apple OAuth
  }

  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.appleLogin(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }
  */

  // Email verification removed; using forgot/reset password flow instead

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<UserResponseDto> {
    const user = req.user as any;
    const userId = user._id || user.id;
    return this.userService.getUserProfile(userId);
  }
}
