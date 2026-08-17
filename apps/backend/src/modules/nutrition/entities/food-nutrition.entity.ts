import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { SourceType } from '@fitness/shared-types';
import { FoodItem } from './food-item.entity';
import { SOURCE_TYPES } from './source-type.const';

// Per-100g reference values. Meal-time consumption values are always computed from this plus
// the logged quantity/weight, then snapshotted onto meal_items — never read live from here at
// display time (architecture plan §F).
@Entity('food_nutrition')
export class FoodNutrition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  foodItemId: string;

  @OneToOne(() => FoodItem, (foodItem) => foodItem.nutrition, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'food_item_id' })
  foodItem: FoodItem;

  // Explicit name: SnakeNamingStrategy converts "Per100g" to "per100g" (it splits on
  // uppercase-letter boundaries, not letter/digit ones), which doesn't match this migration's
  // hand-written "calories_per_100g" column — left implicit, every read/write 500s.
  @Column({ type: 'numeric', precision: 8, scale: 2, name: 'calories_per_100g' })
  caloriesPer100g: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  proteinG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  carbsG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  fatG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  fiberG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  sugarG: number | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  sodiumMg: number | null;

  @Column({ type: 'enum', enum: SOURCE_TYPES })
  sourceType: SourceType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
