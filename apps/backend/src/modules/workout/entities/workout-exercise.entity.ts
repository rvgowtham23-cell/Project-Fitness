import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkoutSession } from './workout-session.entity';
import { WorkoutSet } from './workout-set.entity';

@Entity('workout_exercises')
export class WorkoutExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  workoutSessionId: string;

  @ManyToOne(() => WorkoutSession, (session) => session.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workout_session_id' })
  session: WorkoutSession;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => WorkoutSet, (set) => set.workoutExercise, { cascade: true })
  sets: WorkoutSet[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
