import { IsEmail, IsString } from 'class-validator';

export class VerifyResetTokenDto {

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Token must be a valid string' })
  token: string;
}
