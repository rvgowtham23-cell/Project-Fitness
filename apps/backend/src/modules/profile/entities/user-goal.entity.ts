import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { FitnessGoal } from '@fitness/shared-types';

export const FITNESS_GOALS: FitnessGoal[] = [
  'weight_loss',
  'fat_loss',
  'weight_maintenance',
  'muscle_gain',
  'strength_improvement',
  'general_fitness',
  'endurance',
  'body_recomposition',
];

export enum GoalSource {
  SYSTEM_CALCULATED = 'system_calculated',
  USER_OVERRIDE = 'user_override',
}

// Append-only: a new row is inserted on every recalculation so goal history is never lost
// (docs/architecture-plan.md §F). `isActive` marks the single current goal per user; the
// partial unique index enforcing that is created in the migration.
@Entity('user_goals')
@Index(['userId', 'isActive'])
export class UserGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: FITNESS_GOALS })
  goalType: FitnessGoal;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  targetWeightKg: number | null;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  weeklyWeightChangeGoalKg: number | null;

  @Column({ type: 'int' })
  calorieTarget: number;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  proteinTargetG: number;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  carbTargetG: number;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  fatTargetG: number;

  @Column({ type: 'numeric', precision: 6, scale: 2 })
  fiberTargetG: number;

  @Column({ type: 'int' })
  waterTargetMl: number;

  @Column({ type: 'enum', enum: GoalSource, default: GoalSource.SYSTEM_CALCULATED })
  source: GoalSource;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
