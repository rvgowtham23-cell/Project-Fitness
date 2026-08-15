import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PersonalRecordType {
  MAX_WEIGHT = 'max_weight',
  MAX_REPS = 'max_reps',
  MAX_VOLUME = 'max_volume',
  MAX_DURATION = 'max_duration',
}

// Append-only with a partial unique index enforcing one "current" PR per
// (user_id, exercise_id, record_type) — created in the migration (architecture plan §F).
@Entity('personal_records')
@Index(['userId', 'exerciseId', 'recordType'])
export class PersonalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  exerciseId: string;

  @Column({ type: 'enum', enum: PersonalRecordType })
  recordType: PersonalRecordType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'timestamptz' })
  achievedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  workoutSetId: string | null;

  @Column({ type: 'boolean', default: true })
  isCurrent: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
