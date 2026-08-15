import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import type { FitnessGoal } from '@fitness/shared-types';
import { Gender } from '../../identity/entities/user.entity';
import { ActivityLevel } from '../entities/user-profile.entity';
import { FITNESS_GOALS } from '../entities/user-goal.entity';

export class OnboardingDto {
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(272)
  heightCm: number;

  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(400)
  currentWeightKg: number;

  @IsEnum(ActivityLevel)
  activityLevel: ActivityLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsIn(FITNESS_GOALS)
  goalType: FitnessGoal;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetWeightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weeklyWeightChangeGoalKg?: number;
}
