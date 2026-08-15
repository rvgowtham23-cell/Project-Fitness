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
import { User } from '../../identity/entities/user.entity';

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active',
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  heightCm: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  currentWeightKg: number;

  @Column({ type: 'enum', enum: ActivityLevel, default: ActivityLevel.MODERATE })
  activityLevel: ActivityLevel;

  @Column({ type: 'jsonb', nullable: true })
  dietaryPreferences: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  allergies: string[] | null;

  @Column({ type: 'varchar', length: 64, default: 'Asia/Kolkata' })
  timezone: string;

  @Column({ type: 'timestamptz', nullable: true })
  onboardingCompletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
