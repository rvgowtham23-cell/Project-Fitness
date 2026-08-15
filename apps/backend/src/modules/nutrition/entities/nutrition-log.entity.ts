import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum NutritionLogSource {
  MEAL = 'meal',
  WATER = 'water',
}

// The fine-grained, append-only event ledger. daily_nutrition_summary is the pre-aggregated
// rollup dashboards actually read from — this table exists for audit/recompute purposes, and
// is deliberately never scanned directly by the dashboard (architecture plan §F).
@Entity('nutrition_logs')
@Index(['userId', 'loggedAt'])
export class NutritionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  loggedAt: Date;

  @Column({ type: 'enum', enum: NutritionLogSource })
  source: NutritionLogSource;

  @Column({ type: 'uuid', nullable: true })
  mealId: string | null;

  @Column({ type: 'uuid', nullable: true })
  mealItemId: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  calories: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  proteinG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  carbsG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  fatG: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  fiberG: number;

  @Column({ type: 'int', default: 0 })
  waterMl: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
