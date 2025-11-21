import { IsString, IsEmail } from 'class-validator';

export class ResetPasswordDto {

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  token: string;
  
  @IsString()
  newPassword: string;
}