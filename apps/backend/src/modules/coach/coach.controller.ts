import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';

import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/decorators/current-user.decorator';
import { JwtPrincipal } from '../identity/strategies/jwt.strategy';
import { CoachService } from './coach.service';

class CoachChatDto {
  @IsString()
  message: string;
}

@UseGuards(JwtAuthGuard)
@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('chat')
  chat(@CurrentUser() user: JwtPrincipal, @Body() dto: CoachChatDto) {
    return this.coachService.chat(user.userId, dto.message);
  }
}
