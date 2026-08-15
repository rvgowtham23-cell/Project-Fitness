import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meal } from './meal.entity';

// Only the S3 key is stored — the image bytes themselves live in S3, never Postgres
// (architecture plan §D Object storage row).
@Entity('meal_images')
export class MealImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  mealId: string;

  @ManyToOne(() => Meal, (meal) => meal.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meal_id' })
  meal: Meal;

  @Column({ type: 'varchar', length: 512 })
  s3Key: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalFilename: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  contentType: string | null;

  @Column({ type: 'int', nullable: true })
  sizeBytes: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
