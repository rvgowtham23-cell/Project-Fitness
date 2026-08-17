import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
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
import { PRODUCT_LOOKUP_PROVIDER } from './providers/product-lookup.provider';
import { OpenFoodFactsProvider } from './providers/open-food-facts.provider';

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
    HttpModule,
  ],
  controllers: [NutritionController],
  providers: [
    NutritionService,
    OpenFoodFactsProvider,
    { provide: PRODUCT_LOOKUP_PROVIDER, useExisting: OpenFoodFactsProvider },
  ],
  exports: [NutritionService, TypeOrmModule],
})
export class NutritionModule {}
