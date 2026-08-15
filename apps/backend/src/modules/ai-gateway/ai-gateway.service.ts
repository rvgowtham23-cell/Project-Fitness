import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import type { AnalyzeMealImageResponse, ParsedWorkoutResponse } from '@fitness/shared-types';

import { AiRequest, AiRequestStatus, AiRequestType } from './entities/ai-request.entity';
import { AiResponse, AiValidationStatus } from './entities/ai-response.entity';
import {
  AnalyzeMealImageResponseValidationDto,
  ParsedWorkoutResponseValidationDto,
} from './dto/ai-response-validation.dto';

export interface AiUserContext {
  userId: string;
}

// The AI service wraps its result in a thin envelope carrying usage/cost metadata so the
// gateway can populate ai_responses without the AI service needing to know about Postgres.
interface AiServiceEnvelope<T> {
  result: T;
  provider?: string;
  model?: string;
  usage?: {
    tokensInput?: number;
    tokensOutput?: number;
    costUsd?: number;
  };
}

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(AiRequest) private readonly aiRequests: Repository<AiRequest>,
    @InjectRepository(AiResponse) private readonly aiResponses: Repository<AiResponse>,
  ) {
    this.baseUrl = this.config.get<string>('AI_SERVICE_URL') ?? 'http://localhost:8000';
    this.timeoutMs = Number(this.config.get<string>('AI_SERVICE_TIMEOUT_MS') ?? 15000);
  }

  async analyzeMealImage(
    imageRef: string,
    userContext: AiUserContext,
  ): Promise<AnalyzeMealImageResponse> {
    const aiRequest = await this.aiRequests.save(
      this.aiRequests.create({
        userId: userContext.userId,
        requestType: AiRequestType.ANALYZE_MEAL_IMAGE,
        inputRef: imageRef,
        status: AiRequestStatus.PENDING,
      }),
    );

    const started = Date.now();
    let envelope: AiServiceEnvelope<unknown>;
    try {
      const response = await firstValueFrom(
        this.http.post<AiServiceEnvelope<unknown>>(
          `${this.baseUrl}/v1/vision/analyze-meal`,
          { imageRef, aiRequestId: aiRequest.id, userContext },
          { timeout: this.timeoutMs },
        ),
      );
      envelope = response.data;
    } catch (err) {
      await this.markFailed(aiRequest);
      this.logger.error(`analyzeMealImage call failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('AI service is unavailable');
    }
    const latencyMs = Date.now() - started;

    const validated = await this.validateOrFail(
      AnalyzeMealImageResponseValidationDto,
      envelope.result,
      aiRequest,
      envelope,
      latencyMs,
    );

    return validated as unknown as AnalyzeMealImageResponse;
  }

  async parseWorkoutText(text: string, userContext: AiUserContext): Promise<ParsedWorkoutResponse> {
    const aiRequest = await this.aiRequests.save(
      this.aiRequests.create({
        userId: userContext.userId,
        requestType: AiRequestType.PARSE_WORKOUT_TEXT,
        status: AiRequestStatus.PENDING,
      }),
    );

    const started = Date.now();
    let envelope: AiServiceEnvelope<unknown>;
    try {
      const response = await firstValueFrom(
        this.http.post<AiServiceEnvelope<unknown>>(
          `${this.baseUrl}/v1/parse/workout-text`,
          { text, aiRequestId: aiRequest.id, userContext },
          { timeout: this.timeoutMs },
        ),
      );
      envelope = response.data;
    } catch (err) {
      await this.markFailed(aiRequest);
      this.logger.error(`parseWorkoutText call failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('AI service is unavailable');
    }
    const latencyMs = Date.now() - started;

    const validated = await this.validateOrFail(
      ParsedWorkoutResponseValidationDto,
      envelope.result,
      aiRequest,
      envelope,
      latencyMs,
    );

    return validated as unknown as ParsedWorkoutResponse;
  }

  private async validateOrFail<T extends object>(
    cls: new () => T,
    payload: unknown,
    aiRequest: AiRequest,
    envelope: AiServiceEnvelope<unknown>,
    latencyMs: number,
  ): Promise<T> {
    const instance = plainToInstance(cls, payload);
    const errors = await validate(instance, { whitelist: true, forbidUnknownValues: true });

    if (errors.length > 0) {
      aiRequest.status = AiRequestStatus.FAILED;
      aiRequest.provider = envelope.provider ?? null;
      aiRequest.model = envelope.model ?? null;
      await this.aiRequests.save(aiRequest);
      await this.aiResponses.save(
        this.aiResponses.create({
          aiRequestId: aiRequest.id,
          latencyMs,
          validationStatus: AiValidationStatus.INVALID,
        }),
      );
      this.logger.warn(`AI response failed schema validation: ${JSON.stringify(errors)}`);
      throw new BadGatewayException('AI service returned an invalid response shape');
    }

    aiRequest.status = AiRequestStatus.SUCCESS;
    aiRequest.provider = envelope.provider ?? null;
    aiRequest.model = envelope.model ?? null;
    await this.aiRequests.save(aiRequest);
    await this.aiResponses.save(
      this.aiResponses.create({
        aiRequestId: aiRequest.id,
        tokensInput: envelope.usage?.tokensInput ?? null,
        tokensOutput: envelope.usage?.tokensOutput ?? null,
        costUsd: envelope.usage?.costUsd ?? null,
        latencyMs,
        validationStatus: AiValidationStatus.VALID,
      }),
    );

    return instance;
  }

  private async markFailed(aiRequest: AiRequest): Promise<void> {
    aiRequest.status = AiRequestStatus.FAILED;
    await this.aiRequests.save(aiRequest);
  }
}
