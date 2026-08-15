import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Composite PK (user_id, summary_date). Upserted SYNCHRONOUSLY in the same transaction as the
// meal write (not via a background job) — the arithmetic is cheap and this keeps the home
// dashboard always-consistent, per the plan's explicit design decision (architecture plan §F).
// Weekly/monthly rollups are a separate nightly job that reads from this table, never from raw
// nutrition_logs.
@Entity('daily_nutrition_summary')
export class DailyNutritionSummary {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'date' })
  summaryDate: string;

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

  @Column({ type: 'int', default: 0 })
  totalWaterMl: number;

  @Column({ type: 'int', default: 0 })
  targetCalories: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  targetProteinG: number;

  @Column({ type: 'int', default: 0 })
  mealCount: number;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
