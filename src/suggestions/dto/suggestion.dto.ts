import { IsEnum, IsOptional, IsString, MaxLength, IsNotEmpty, IsMongoId, IsEmail, IsArray } from 'class-validator';
import { SuggestionType, SuggestionStatus } from '../entities/suggestion.entity';

// For gemstone identification feedback
export class CreateGemstoneFeedbackDto {
  @IsMongoId()
  @IsNotEmpty()
  gemstoneRef: string;

  @IsEnum(SuggestionType)
  @IsNotEmpty()
  type: SuggestionType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  errorField?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  suggestedIdentification?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
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
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SuggestionResponseDto {
  id: string;
  userId: string;
  gemstoneRef?: string;
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