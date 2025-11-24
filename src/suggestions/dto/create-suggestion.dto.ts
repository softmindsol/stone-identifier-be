import { IsEnum, IsOptional, IsString, MaxLength, IsNotEmpty, IsEmail, IsArray } from 'class-validator';
import { SuggestionType, SuggestionStatus } from '../entities/suggestion.entity';

// For bird identification feedback
export class CreateBirdFeedbackDto {
  @IsString()
  @IsNotEmpty()
  birdRef: string;

  @IsEnum(SuggestionType)
  @IsNotEmpty()
  type: SuggestionType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}

// For general app suggestions
export class CreateAppSuggestionDto {
  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}

export class SuggestionResponseDto {
  id: string;
  userId: string;
  birdRef?: string;
  type: SuggestionType;
  status: SuggestionStatus;
  content?: string;
  title?: string;
  userEmail?: string;
  errorField?: string;
  suggestedIdentification?: string;
  photos?: string[];
  tags?: string[];
  adminResponse?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
