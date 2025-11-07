import { Injectable } from '@nestjs/common';

// Temporary placeholder class to prevent dependency injection errors
@Injectable()
export class AppleStrategy {
  constructor() {
    console.log('Apple authentication is currently disabled');
  }
}

// Apple Sign In strategy temporarily disabled
/*
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

// Original implementation commented out
@Injectable()
export class AppleStrategyOriginal extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('APPLE_CLIENT_ID'),
      teamID: configService.get('APPLE_TEAM_ID'),
      keyID: configService.get('APPLE_KEY_ID'),
      privateKeyString: configService.get('APPLE_PRIVATE_KEY'),
      callbackURL: configService.get('APPLE_CALLBACK_URL'),
      scope: ['name', 'email'],
      passReqToCallback: true
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    const user = {
      providerId: profile.id,
      email: profile.email,
      name: profile.name ? `${profile.name.firstName} ${profile.name.lastName}` : undefined,
      accessToken
    };
    
    return user;
  }
}
*/

