import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    try {
      // Validate payload structure
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Find user by ID from token
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Verify email matches
      if (user.email !== payload.email) {
        throw new UnauthorizedException('Token email mismatch');
      }

      // Return user without sensitive data
      const safeUser = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        verified: user.verified,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return safeUser;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
