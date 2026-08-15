import { Injectable } from '@nestjs/common';
import type { FitnessGoal, NutritionTargets } from '@fitness/shared-types';
import { Gender } from '../identity/entities/user.entity';
import { ActivityLevel } from './entities/user-profile.entity';

export interface BmrInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: Gender;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.ACTIVE]: 1.725,
  [ActivityLevel.VERY_ACTIVE]: 1.9,
};

// Calorie adjustment vs. TDEE per goal. Deficits/surpluses kept modest and evidence-aligned
// rather than aggressive, since this feeds a health-adjacent product (see architecture plan
// §M coach-safety risk — the same conservatism applies here even without the coach's hard
// clamps, because this is the number every other target derives from).
const GOAL_CALORIE_MULTIPLIERS: Record<FitnessGoal, number> = {
  weight_loss: 0.8,
  fat_loss: 0.8,
  body_recomposition: 0.9,
  weight_maintenance: 1.0,
  general_fitness: 1.0,
  endurance: 1.0,
  strength_improvement: 1.05,
  muscle_gain: 1.1,
};

// Protein g/kg bodyweight per goal — higher in a deficit to preserve lean mass.
const GOAL_PROTEIN_G_PER_KG: Record<FitnessGoal, number> = {
  weight_loss: 2.0,
  fat_loss: 2.0,
  body_recomposition: 2.0,
  weight_maintenance: 1.6,
  general_fitness: 1.6,
  endurance: 1.4,
  strength_improvement: 1.8,
  muscle_gain: 1.8,
};

const FAT_CALORIE_FRACTION = 0.25;
const KCAL_PER_G_PROTEIN = 4;
const KCAL_PER_G_CARB = 4;
const KCAL_PER_G_FAT = 9;
const FIBER_G_PER_1000_KCAL = 14;
const WATER_ML_PER_KG = 35;

// Minimum safe calorie floors (mirrors the coach's hard-clamp philosophy in §H — this is the
// same "never let a formula recommend a clinically unsafe number" boundary, applied at the
// calorie-engine layer rather than the coach layer).
const MIN_CALORIE_FLOOR_MALE = 1500;
const MIN_CALORIE_FLOOR_FEMALE = 1200;

@Injectable()
export class CalorieEngineService {
  /** Mifflin-St Jeor BMR — the standard evidence-based equation (architecture plan §F). */
  calculateBmr(input: BmrInput): number {
    const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.ageYears;
    if (input.gender === Gender.MALE) return base + 5;
    if (input.gender === Gender.FEMALE) return base - 161;
    // No validated third-category offset exists in the Mifflin-St Jeor literature; average the
    // two known offsets rather than silently defaulting to one gender's formula.
    return base - 78;
  }

  calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
    return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
  }

  calculateNutritionTargets(params: {
    tdee: number;
    goal: FitnessGoal;
    weightKg: number;
    gender: Gender;
  }): NutritionTargets {
    const { tdee, goal, weightKg, gender } = params;

    const floor = gender === Gender.FEMALE ? MIN_CALORIE_FLOOR_FEMALE : MIN_CALORIE_FLOOR_MALE;
    const calorieTarget = Math.max(Math.round(tdee * GOAL_CALORIE_MULTIPLIERS[goal]), floor);

    const proteinTargetG = Math.round(weightKg * GOAL_PROTEIN_G_PER_KG[goal]);
    const fatTargetG = Math.round((calorieTarget * FAT_CALORIE_FRACTION) / KCAL_PER_G_FAT);

    const proteinKcal = proteinTargetG * KCAL_PER_G_PROTEIN;
    const fatKcal = fatTargetG * KCAL_PER_G_FAT;
    const remainingKcal = Math.max(calorieTarget - proteinKcal - fatKcal, 0);
    const carbTargetG = Math.round(remainingKcal / KCAL_PER_G_CARB);

    const fiberTargetG = Math.round((calorieTarget / 1000) * FIBER_G_PER_1000_KCAL);
    const waterTargetMl = Math.round(weightKg * WATER_ML_PER_KG);

    return {
      calorieTarget,
      proteinTargetG,
      carbTargetG,
      fatTargetG,
      fiberTargetG,
      waterTargetMl,
    };
  }
}
