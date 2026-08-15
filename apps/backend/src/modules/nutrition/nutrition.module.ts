import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';
import { UserGoal } from '../profile/entities/user-goal.entity';
import { FoodItem } from './entities/food-item.entity';
import { FoodNutrition } from './entities/food-nutrition.entity';
import { Meal } from './entities/meal.entity';
import { MealItem } from './entities/meal-item.entity';
import { MealImage } from './entities/meal-image.entity';
import { NutritionLog } from './entities/nutrition-log.entity';
import { DailyNutritionSummary } from './entities/daily-nutrition-summary.entity';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodItem,
      FoodNutrition,
      Meal,
      MealItem,
      MealImage,
      NutritionLog,
      DailyNutritionSummary,
      UserGoal,
    ]),
    AiGatewayModule,
  ],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService, TypeOrmModule],
})
export class NutritionModule {}
