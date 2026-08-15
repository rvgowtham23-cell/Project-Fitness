import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { SourceType } from '@fitness/shared-types';
import { SOURCE_TYPES } from '../../nutrition/entities/food-item.entity';

// Runtime validation of the AI service's response shape — mirrors AnalyzeMealImageResponse /
// MealItemEstimate from @fitness/shared-types. AI output is untrusted input (architecture plan
// §E, §H): this is what "mandatory schema validation of every response before it's trusted
// downstream" (§H AI Gateway) actually means in code.
export class MealItemEstimateValidationDto {
  @IsString()
  foodName: string;

  @IsNumber()
  estimatedWeightG: number;

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  estimatedWeightRangeG: [number, number];

  @IsString()
  unit: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  proteinG: number;

  @IsNumber()
  @Min(0)
  carbsG: number;

  @IsNumber()
  @Min(0)
  fatG: number;

  @IsNumber()
  @Min(0)
  fiberG: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsIn(SOURCE_TYPES)
  source: SourceType;
}

export class AnalyzeMealImageResponseValidationDto {
  @IsUUID()
  aiRequestId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemEstimateValidationDto)
  items: MealItemEstimateValidationDto[];

  @IsNumber()
  @Min(0)
  @Max(1)
  overallConfidence: number;
}

export class WorkoutSetInputValidationDto {
  @IsString()
  exerciseName: string;

  @IsInt()
  @Min(1)
  setNumber: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  restSeconds?: number;
}

export class ParsedWorkoutResponseValidationDto {
  @IsUUID()
  aiRequestId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutSetInputValidationDto)
  sets: WorkoutSetInputValidationDto[];

  @IsBoolean()
  needsConfirmation: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ambiguousFields?: string[];
}
