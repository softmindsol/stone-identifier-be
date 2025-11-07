import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
      prompt: 'select_account',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    try {
      if (!profile.emails || !profile.emails.length) {
        throw new UnauthorizedException('No email provided from Google');
      }

      const userData = {
        email: profile.emails[0].value,
        name: profile.displayName || profile.emails[0].value.split('@')[0],
        picture: '', // Set empty string instead of using Google profile image
        googleId: profile.id,
        accessToken,
      };
      
      return await this.authService.googleLogin(userData);
    } catch (error) {
      console.error('Google validation error:', error);
      throw new UnauthorizedException('Failed to validate Google user');
    }
  }
}