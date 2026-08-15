import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AiRequestType {
  ANALYZE_MEAL_IMAGE = 'analyze_meal_image',
  PARSE_WORKOUT_TEXT = 'parse_workout_text',
}

export enum AiRequestStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// Audit/cost-tracking boundary for every AI call (architecture plan §F, §H). Raw payloads live
// in S3 (inputRef points at a key), never in Postgres, to keep these rows small and queryable.
@Entity('ai_requests')
@Index(['userId', 'createdAt'])
export class AiRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'enum', enum: AiRequestType })
  requestType: AiRequestType;

  @Column({ type: 'varchar', length: 64, nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  model: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  inputRef: string | null;

  @Column({ type: 'enum', enum: AiRequestStatus, default: AiRequestStatus.PENDING })
  status: AiRequestStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
