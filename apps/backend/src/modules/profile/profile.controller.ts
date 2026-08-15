import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import type { NutritionTargets } from '@fitness/shared-types';

import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/decorators/current-user.decorator';
import { JwtPrincipal } from '../identity/strategies/jwt.strategy';
import { ProfileService } from './profile.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateGoalDto } from './dto/create-goal.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: JwtPrincipal) {
    return this.profileService.getProfile(user.userId);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtPrincipal, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.userId, dto);
  }

  @Post('profile/onboarding')
  completeOnboarding(@CurrentUser() user: JwtPrincipal, @Body() dto: OnboardingDto) {
    return this.profileService.completeOnboarding(user.userId, dto);
  }

  @Get('profile/targets')
  getTargets(@CurrentUser() user: JwtPrincipal): Promise<NutritionTargets> {
    return this.profileService.getTargets(user.userId);
  }

  @Post('goals')
  createGoal(@CurrentUser() user: JwtPrincipal, @Body() dto: CreateGoalDto) {
    return this.profileService.createGoal(user.userId, dto);
  }
}
