import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/decorators/current-user.decorator';
import { JwtPrincipal } from '../identity/strategies/jwt.strategy';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly')
  weekly(@CurrentUser() user: JwtPrincipal) {
    return this.analyticsService.getWeeklyProgress(user.userId);
  }
}
