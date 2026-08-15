import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MealItem } from './meal-item.entity';
import { MealImage } from './meal-image.entity';

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
}

export enum MealInputMethod {
  MANUAL = 'manual',
  AI_PHOTO = 'ai_photo',
  BARCODE = 'barcode',
}

@Entity('meals')
@Index(['userId', 'loggedAt'])
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: MealType })
  mealType: MealType;

  @Column({ type: 'enum', enum: MealInputMethod, default: MealInputMethod.MANUAL })
  inputMethod: MealInputMethod;

  @Column({ type: 'timestamptz' })
  loggedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // Aggregate snapshot of this meal's items, computed once at save time (same values feed the
  // daily_nutrition_summary upsert in the same transaction — see nutrition.service.ts).
  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  totalCalories: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  totalProteinG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  totalCarbsG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  totalFatG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  totalFiberG: number;

  @OneToMany(() => MealItem, (item) => item.meal, { cascade: true })
  items: MealItem[];

  @OneToMany(() => MealImage, (image) => image.meal, { cascade: true })
  images: MealImage[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
