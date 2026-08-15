import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { SourceType } from '@fitness/shared-types';
import { Meal } from './meal.entity';
import { SOURCE_TYPES } from './source-type.const';

// Nutrition values are denormalized (snapshotted) at log time so a later admin correction to a
// food_nutrition reference row never silently rewrites historical dashboards (architecture plan
// §F). foodItemId is kept for traceability but is never re-joined for display.
@Entity('meal_items')
export class MealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  mealId: string;

  @ManyToOne(() => Meal, (meal) => meal.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @Column({ type: 'uuid', nullable: true })
  foodItemId: string | null;

  @Column({ type: 'varchar', length: 255 })
  foodName: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 32 })
  unit: string;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  weightG: number | null;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  calories: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  proteinG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  carbsG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  fatG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  fiberG: number;

  @Column({ type: 'enum', enum: SOURCE_TYPES })
  sourceType: SourceType;

  @Column({ type: 'numeric', precision: 4, scale: 3, nullable: true })
  confidence: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
