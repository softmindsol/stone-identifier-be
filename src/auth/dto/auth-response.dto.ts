
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  provider: string;
  verified: boolean;
  profileImageUrl?: string;
  createdAt: Date;
}

export class AuthResponseDto {
  accessToken?: string;
  user: UserResponseDto;
  expiresIn?: number;
  message?: string;
}
