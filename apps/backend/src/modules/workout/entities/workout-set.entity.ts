import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutExercise } from './workout-exercise.entity';

// userId/exerciseId/performedAt are denormalized directly onto this table — the
// highest-cardinality table in the schema — so progression/PR queries avoid a 3-table join at
// scale. Backing index (user_id, exercise_id, performed_at DESC) is created in the migration
// (architecture plan §F).
@Entity('workout_sets')
export class WorkoutSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  workoutExerciseId: string;

  @ManyToOne(() => WorkoutExercise, (exercise) => exercise.sets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_exercise_id' })
  workoutExercise: WorkoutExercise;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @Column({ type: 'timestamptz' })
  performedAt: Date;

  @Column({ type: 'int' })
  setNumber: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  weightKg: number | null;

  @Column({ type: 'int', nullable: true })
  reps: number | null;

  @Column({ type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ type: 'int', nullable: true })
  restSeconds: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
