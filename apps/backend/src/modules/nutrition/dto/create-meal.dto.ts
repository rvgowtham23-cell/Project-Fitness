import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { SourceType } from '@fitness/shared-types';
import { MealInputMethod, MealType } from '../entities/meal.entity';
import { SOURCE_TYPES } from '../entities/source-type.const';

export class CreateMealItemDto {
  @IsOptional()
  @IsUUID()
  foodItemId?: string;

  @IsString()
  @MaxLength(255)
  foodName: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsString()
  @MaxLength(32)
  unit: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightG?: number;

  // Required when foodItemId is not resolvable against the catalog (e.g. a confirmed AI-photo
  // estimate, which already carries computed macros) — see nutrition.service.ts.
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  calories?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbsG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fiberG?: number;

  @IsOptional()
  @IsIn(SOURCE_TYPES)
  sourceType?: SourceType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  confidence?: number;
}

export class CreateMealDto {
  @IsEnum(MealType)
  mealType: MealType;

  @IsOptional()
  @IsEnum(MealInputMethod)
  inputMethod?: MealInputMethod;

  @IsISO8601()
  loggedAt: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMealItemDto)
  items: CreateMealItemDto[];
}
