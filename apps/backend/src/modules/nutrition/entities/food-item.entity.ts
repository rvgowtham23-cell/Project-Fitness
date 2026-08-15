import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { SourceType } from '@fitness/shared-types';
import { FoodNutrition } from './food-nutrition.entity';
import { SOURCE_TYPES } from './source-type.const';

// `pg_trgm` GIN index on `name` (created in the migration) backs fuzzy food search
// (GET /foods/search) without standing up a dedicated search engine — see architecture plan §D.
@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand: string | null;

  @Index({ unique: true, where: 'barcode IS NOT NULL' })
  @Column({ type: 'varchar', length: 64, nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  category: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  servingSizeG: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  servingUnit: string | null;

  // Trust level of this catalog entry — every nutrition value's provenance is always visible
  // (architecture plan §F).
  @Column({ type: 'enum', enum: SOURCE_TYPES })
  sourceType: SourceType;

  @Column({ type: 'varchar', length: 128, nullable: true })
  externalId: string | null;

  @OneToOne(() => FoodNutrition, (nutrition) => nutrition.foodItem)
  nutrition: FoodNutrition;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
