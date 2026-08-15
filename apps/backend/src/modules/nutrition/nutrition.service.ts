import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  AnalyzeMealImageResponse,
  DailyNutritionSummary as DailyNutritionSummaryDto,
} from '@fitness/shared-types';

import { UserGoal } from '../profile/entities/user-goal.entity';
import { AiGatewayService } from '../ai-gateway/ai-gateway.service';
import { FoodNutrition } from './entities/food-nutrition.entity';
import { Meal, MealInputMethod } from './entities/meal.entity';
import { MealItem } from './entities/meal-item.entity';
import { NutritionLog, NutritionLogSource } from './entities/nutrition-log.entity';
import { DailyNutritionSummary } from './entities/daily-nutrition-summary.entity';
import { CreateMealDto, CreateMealItemDto } from './dto/create-meal.dto';
import { AnalyzeMealImageDto } from './dto/analyze-meal-image.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(Meal) private readonly meals: Repository<Meal>,
    @InjectRepository(FoodNutrition) private readonly foodNutrition: Repository<FoodNutrition>,
    @InjectRepository(DailyNutritionSummary)
    private readonly dailySummaries: Repository<DailyNutritionSummary>,
    @InjectRepository(UserGoal) private readonly userGoals: Repository<UserGoal>,
    private readonly aiGateway: AiGatewayService,
  ) {}

  async analyzeMealImage(
    userId: string,
    dto: AnalyzeMealImageDto,
  ): Promise<AnalyzeMealImageResponse> {
    // Draft only — never auto-saved. The client must POST /meals with the (possibly
    // user-corrected) items to actually log them, per the "AI estimates, user confirms"
    // pattern (architecture plan §G).
    return this.aiGateway.analyzeMealImage(dto.imageRef, { userId });
  }

  async createMeal(userId: string, dto: CreateMealDto): Promise<Meal> {
    const loggedAt = new Date(dto.loggedAt);
    const summaryDate = loggedAt.toISOString().slice(0, 10);

    return this.meals.manager.transaction(async (manager) => {
      const resolvedItems = await Promise.all(
        dto.items.map((item) => this.resolveMealItem(manager.getRepository(FoodNutrition), item)),
      );

      const meal = manager.getRepository(Meal).create({
        userId,
        mealType: dto.mealType,
        inputMethod: dto.inputMethod ?? MealInputMethod.MANUAL,
        loggedAt,
        notes: dto.notes ?? null,
        totalCalories: this.sum(resolvedItems, 'calories'),
        totalProteinG: this.sum(resolvedItems, 'proteinG'),
        totalCarbsG: this.sum(resolvedItems, 'carbsG'),
        totalFatG: this.sum(resolvedItems, 'fatG'),
        totalFiberG: this.sum(resolvedItems, 'fiberG'),
      });
      meal.items = resolvedItems.map((item) => manager.getRepository(MealItem).create(item));
      const savedMeal = await manager.getRepository(Meal).save(meal);

      await manager.getRepository(NutritionLog).save(
        manager.getRepository(NutritionLog).create({
          userId,
          loggedAt,
          source: NutritionLogSource.MEAL,
          mealId: savedMeal.id,
          calories: savedMeal.totalCalories,
          proteinG: savedMeal.totalProteinG,
          carbsG: savedMeal.totalCarbsG,
          fatG: savedMeal.totalFatG,
          fiberG: savedMeal.totalFiberG,
        }),
      );

      // Synchronous upsert in the SAME transaction as the meal write — not a background job.
      // The arithmetic is cheap and this keeps the home dashboard always-consistent
      // (architecture plan §F, explicit design decision).
      const summaryRepo = manager.getRepository(DailyNutritionSummary);
      let summary = await summaryRepo.findOne({ where: { userId, summaryDate } });
      const activeGoal = await manager
        .getRepository(UserGoal)
        .findOne({ where: { userId, isActive: true } });

      if (!summary) {
        summary = summaryRepo.create({ userId, summaryDate });
      }
      // A freshly-`create()`d entity only has the fields passed in above — the other
      // columns' DB-side defaults are not reflected on the JS object until after a save+reload,
      // so every field here needs its own `?? 0` rather than trusting Number(undefined).
      summary.totalCalories =
        Number(summary.totalCalories ?? 0) + Number(savedMeal.totalCalories);
      summary.totalProteinG =
        Number(summary.totalProteinG ?? 0) + Number(savedMeal.totalProteinG);
      summary.totalCarbsG = Number(summary.totalCarbsG ?? 0) + Number(savedMeal.totalCarbsG);
      summary.totalFatG = Number(summary.totalFatG ?? 0) + Number(savedMeal.totalFatG);
      summary.totalFiberG = Number(summary.totalFiberG ?? 0) + Number(savedMeal.totalFiberG);
      summary.mealCount = Number(summary.mealCount ?? 0) + 1;
      if (activeGoal) {
        summary.targetCalories = activeGoal.calorieTarget;
        summary.targetProteinG = Number(activeGoal.proteinTargetG);
      }
      await summaryRepo.save(summary);

      return savedMeal;
    });
  }

  async getDailySummary(userId: string, date: string): Promise<DailyNutritionSummaryDto> {
    const summaryDate = date.slice(0, 10);
    const summary = await this.dailySummaries.findOne({ where: { userId, summaryDate } });

    if (!summary) {
      const activeGoal = await this.userGoals.findOne({ where: { userId, isActive: true } });
      return {
        summaryDate,
        totalCalories: 0,
        totalProteinG: 0,
        totalCarbsG: 0,
        totalFatG: 0,
        totalFiberG: 0,
        totalWaterMl: 0,
        targetCalories: activeGoal?.calorieTarget ?? 0,
        targetProteinG: activeGoal ? Number(activeGoal.proteinTargetG) : 0,
        mealCount: 0,
      };
    }

    return {
      summaryDate: summary.summaryDate,
      totalCalories: Number(summary.totalCalories),
      totalProteinG: Number(summary.totalProteinG),
      totalCarbsG: Number(summary.totalCarbsG),
      totalFatG: Number(summary.totalFatG),
      totalFiberG: Number(summary.totalFiberG),
      totalWaterMl: summary.totalWaterMl,
      targetCalories: summary.targetCalories,
      targetProteinG: Number(summary.targetProteinG),
      mealCount: summary.mealCount,
    };
  }

  private async resolveMealItem(
    foodNutritionRepo: Repository<FoodNutrition>,
    item: CreateMealItemDto,
  ): Promise<Partial<MealItem>> {
    if (item.foodItemId) {
      const nutrition = await foodNutritionRepo.findOne({ where: { foodItemId: item.foodItemId } });
      if (!nutrition) {
        throw new NotFoundException(`No nutrition data found for foodItemId ${item.foodItemId}`);
      }
      if (item.weightG === undefined) {
        throw new BadRequestException('weightG is required when logging by foodItemId');
      }
      const factor = item.weightG / 100;
      return {
        foodItemId: item.foodItemId,
        foodName: item.foodName,
        quantity: item.quantity,
        unit: item.unit,
        weightG: item.weightG,
        calories: this.round(Number(nutrition.caloriesPer100g) * factor),
        proteinG: this.round(Number(nutrition.proteinG) * factor),
        carbsG: this.round(Number(nutrition.carbsG) * factor),
        fatG: this.round(Number(nutrition.fatG) * factor),
        fiberG: this.round(Number(nutrition.fiberG) * factor),
        sourceType: item.sourceType ?? nutrition.sourceType,
        confidence: item.confidence ?? null,
      };
    }

    if (
      item.calories === undefined ||
      item.proteinG === undefined ||
      item.carbsG === undefined ||
      item.fatG === undefined
    ) {
      throw new BadRequestException(
        'calories/proteinG/carbsG/fatG are required when foodItemId is not provided (e.g. confirmed AI estimate or custom entry)',
      );
    }

    return {
      foodItemId: null,
      foodName: item.foodName,
      quantity: item.quantity,
      unit: item.unit,
      weightG: item.weightG ?? null,
      calories: item.calories,
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatG: item.fatG,
      fiberG: item.fiberG ?? 0,
      sourceType: item.sourceType ?? 'USER',
      confidence: item.confidence ?? null,
    };
  }

  private sum(
    items: Partial<MealItem>[],
    key: 'calories' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG',
  ): number {
    return this.round(items.reduce((total, item) => total + Number(item[key] ?? 0), 0));
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
