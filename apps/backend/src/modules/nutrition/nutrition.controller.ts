import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/decorators/current-user.decorator';
import { JwtPrincipal } from '../identity/strategies/jwt.strategy';
import { NutritionService } from './nutrition.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AnalyzeMealImageDto } from './dto/analyze-meal-image.dto';
import { DailyNutritionQueryDto } from './dto/daily-nutrition-query.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('meals')
  createMeal(@CurrentUser() user: JwtPrincipal, @Body() dto: CreateMealDto) {
    return this.nutritionService.createMeal(user.userId, dto);
  }

  @Post('meals/analyze-image')
  analyzeMealImage(@CurrentUser() user: JwtPrincipal, @Body() dto: AnalyzeMealImageDto) {
    return this.nutritionService.analyzeMealImage(user.userId, dto);
  }

  @Get('nutrition/daily')
  getDailySummary(@CurrentUser() user: JwtPrincipal, @Query() query: DailyNutritionQueryDto) {
    return this.nutritionService.getDailySummary(user.userId, query.date);
  }

  @Get('meals')
  getMealsForDate(@CurrentUser() user: JwtPrincipal, @Query() query: DailyNutritionQueryDto) {
    return this.nutritionService.getMealsForDate(user.userId, query.date);
  }

  @Get('meals/:id')
  getMealById(@CurrentUser() user: JwtPrincipal, @Param('id') id: string) {
    return this.nutritionService.getMealById(user.userId, id);
  }

  @Patch('meals/:id')
  updateMeal(
    @CurrentUser() user: JwtPrincipal,
    @Param('id') id: string,
    @Body() dto: CreateMealDto,
  ) {
    return this.nutritionService.updateMeal(user.userId, id, dto);
  }

  @Delete('meals/:id')
  @HttpCode(204)
  deleteMeal(@CurrentUser() user: JwtPrincipal, @Param('id') id: string) {
    return this.nutritionService.deleteMeal(user.userId, id);
  }

  @Post('foods/barcode/:code')
  lookupBarcode(@Param('code') code: string) {
    return this.nutritionService.lookupBarcode(code);
  }
}
