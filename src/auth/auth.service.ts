import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User, AuthProvider } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { name, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user - password will be automatically hashed by the schema pre-save hook
    let user = await this.usersService.create({
      name,
      email,
      passwordHash: password, // This will be hashed automatically
      provider: AuthProvider.EMAIL,
      verified: true,
    });

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      expiresIn: this.getTokenExpiration(),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has password (not OAuth user)
    if (!user.passwordHash) {
      throw new UnauthorizedException('Please use social login for this account');
    }

    // Verify password using schema helper method
    const isPasswordValid = await (user as any).comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      expiresIn: this.getTokenExpiration(),
    };
  }

  async googleLogin(profile: any): Promise<AuthResponseDto> {
    const { email, name, picture } = profile;

    if (!email) {
      throw new Error('Email is required from Google profile');
    }

    if (!name) {
      throw new Error('Name is required from Google profile');
    }

    // Check if user exists
    let user = await this.usersService.findByEmail(email);
    
    if (user) {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        user = await this.usersService.update(user.id, {
          provider: AuthProvider.GOOGLE,
          verified: true,
        });
      }
    } else {
      // Create new user
      user = await this.usersService.create({
        name: name,
        email: email,
        provider: AuthProvider.GOOGLE,
        verified: true,
      });
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        verified: user.verified,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
      },
      expiresIn: this.getTokenExpiration(),
    };
  }

  async appleLogin(profile: any): Promise<AuthResponseDto> {
    const { email, name, id } = profile;

    // Check if user exists
    let user = await this.usersService.findByEmail(email);
    
    if (user) {
      // Update existing user with Apple info if needed
      if (!user.appleId) {
        user = await this.usersService.update(user.id, {
          appleId: id,
          provider: AuthProvider.APPLE,
          verified: true,
        });
      }
    } else {
      // Create new user
      user = await this.usersService.create({
        name: name || 'Apple User',
        email,
        provider: AuthProvider.APPLE,
        appleId: id,
        verified: true,
      });
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      expiresIn: this.getTokenExpiration(),
    };
  }

  // Email verification removed. Implement forgot/reset password below.
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email exists
      return { message: 'User with that email does not exist' };
    }

    // Generate a 4-digit code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await this.usersService.update(user.id, { resetToken: resetCode, resetTokenExpires: expires });

    try {
      const result = await this.emailService.sendPasswordResetEmail(user.email, resetCode);
      if (result && result.success) {
        return {
          message: 'Password reset code has been sent to your email successfully'
        };
      } else {
        throw new InternalServerErrorException('Failed to send password reset email');
      }
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new InternalServerErrorException('Failed to send password reset email');
    }
  }

    async verifyResetToken(token: string, email: string): Promise<{ valid: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Find user by email and reset token
    const user = await this.usersService.findByEmailAndResetToken(email, token);
    if (!user) {
      throw new BadRequestException('Invalid reset token or email');
    }

    // Check if token has expired
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    return { valid: true, message: 'Reset token is valid' };
  }

  async resetPassword(email:string , code: string, newPassword: string): Promise<{ message: string }> {
    if (!code) {
      throw new BadRequestException('Reset code is required');
    }

    // Find user by reset code
    const user = await this.usersService.findByEmailAndResetToken(email, code);
    if (!user) {
      throw new BadRequestException('Invalid or expired code');
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Reset code has expired');
    }

    // Update password - it will be automatically hashed by the schema pre-save hook
    await this.usersService.update(user.id, { passwordHash: newPassword, resetToken: null, resetTokenExpires: null });

    return { message: 'Password has been reset successfully' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.passwordHash) {
      const isPasswordValid = await (user as any).comparePassword(password);
      if (isPasswordValid) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  private getTokenExpiration(): number {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '7d');
    // Convert to seconds
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    return parseInt(expiresIn);
  }
}
