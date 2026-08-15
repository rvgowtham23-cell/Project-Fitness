import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiRequest } from './ai-request.entity';

export enum AiValidationStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  NOT_VALIDATED = 'not_validated',
}

@Entity('ai_responses')
export class AiResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  aiRequestId: string;

  @OneToOne(() => AiRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ai_request_id' })
  aiRequest: AiRequest;

  @Column({ type: 'int', nullable: true })
  tokensInput: number | null;

  @Column({ type: 'int', nullable: true })
  tokensOutput: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 6, nullable: true })
  costUsd: number | null;

  @Column({ type: 'int', nullable: true })
  latencyMs: number | null;

  // AI output is treated as untrusted input, never a source of truth by itself — every
  // response is schema-validated before any other module sees it (architecture plan §E).
  @Column({ type: 'enum', enum: AiValidationStatus, default: AiValidationStatus.NOT_VALIDATED })
  validationStatus: AiValidationStatus;

  @Column({ type: 'varchar', length: 512, nullable: true })
  rawResponseRef: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
