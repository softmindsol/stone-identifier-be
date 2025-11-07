import { IsString, IsOptional, IsArray, IsNumber, IsDateString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class StoneSizeDto {
  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  serialNo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @IsOptional()
  @IsNumber()
  acquisitionPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StoneSizeDto)
  stoneSize?: StoneSizeDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  gemstoneRef?: string;

  @IsOptional()
  @IsString()
  identifiedAs?: string;

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  serialNo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @IsOptional()
  @IsNumber()
  acquisitionPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StoneSizeDto)
  stoneSize?: StoneSizeDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CollectionResponseDto {
  id: string;
  userId: string;
  name: string;
  serialNo?: string;
  photos: string[];
  acquisitionDate?: Date;
  acquisitionPrice?: number;
  currency?: string;
  locality?: string;
  type?: string;
  stoneSize?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  notes?: string;
  gemstoneRef?: string;
  identifiedAs?: string;
  confidence?: number;
  tags?: string[];
  isWishlisted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CollectionListResponseDto extends CollectionResponseDto {
  // Same as CollectionResponseDto for now
}

export class SaveGemstoneToCollectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  serialNo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsDateString()
  acquisitionDate?: string;

  @IsOptional()
  @IsNumber()
  acquisitionPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StoneSizeDto)
  stoneSize?: StoneSizeDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}