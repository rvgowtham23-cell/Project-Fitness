import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiRequest } from './entities/ai-request.entity';
import { AiResponse } from './entities/ai-response.entity';
import { AiGatewayService } from './ai-gateway.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([AiRequest, AiResponse])],
  providers: [AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
