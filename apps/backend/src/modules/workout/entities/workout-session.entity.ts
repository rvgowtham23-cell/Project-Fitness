import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkoutExercise } from './workout-exercise.entity';

export enum WorkoutSource {
  MANUAL = 'manual',
  TEXT_PARSE = 'text_parse',
  VOICE_PARSE = 'voice_parse',
}

@Entity('workout_sessions')
@Index(['userId', 'startedAt'])
export class WorkoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'enum', enum: WorkoutSource, default: WorkoutSource.MANUAL })
  source: WorkoutSource;

  @OneToMany(() => WorkoutExercise, (exercise) => exercise.session, { cascade: true })
  exercises: WorkoutExercise[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
