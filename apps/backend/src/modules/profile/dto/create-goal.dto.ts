import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import type { FitnessGoal } from '@fitness/shared-types';
import { FITNESS_GOALS } from '../entities/user-goal.entity';

export class CreateGoalDto {
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

  // If the user supplies their own calorie/macro targets instead of accepting the
  // system-calculated ones, all five must be provided together (see profile.service.ts) —
  // the goal row is persisted with source = user_override.
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  calorieTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  proteinTargetG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  carbTargetG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fatTargetG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fiberTargetG?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  waterTargetMl?: number;
}
