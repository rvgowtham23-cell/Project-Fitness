import { CalorieEngineService } from './calorie-engine.service';
import { Gender } from '../identity/entities/user.entity';
import { ActivityLevel } from './entities/user-profile.entity';

describe('CalorieEngineService', () => {
  const service = new CalorieEngineService();

  describe('calculateBmr (Mifflin-St Jeor)', () => {
    it('computes BMR for a male', () => {
      const bmr = service.calculateBmr({
        weightKg: 80,
        heightCm: 180,
        ageYears: 30,
        gender: Gender.MALE,
      });
      // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBeCloseTo(1780, 5);
    });

    it('computes BMR for a female', () => {
      const bmr = service.calculateBmr({
        weightKg: 60,
        heightCm: 165,
        ageYears: 28,
        gender: Gender.FEMALE,
      });
      // 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25
      expect(bmr).toBeCloseTo(1330.25, 5);
    });
  });

  describe('calculateTdee', () => {
    it('applies the moderate-activity multiplier', () => {
      expect(service.calculateTdee(1780, ActivityLevel.MODERATE)).toBeCloseTo(2759, 5);
    });

    it('applies the sedentary multiplier', () => {
      expect(service.calculateTdee(1780, ActivityLevel.SEDENTARY)).toBeCloseTo(2136, 5);
    });
  });

  describe('calculateNutritionTargets', () => {
    it('applies a 20% deficit for weight_loss and derives macros from it', () => {
      const targets = service.calculateNutritionTargets({
        tdee: 2759,
        goal: 'weight_loss',
        weightKg: 80,
        gender: Gender.MALE,
      });

      expect(targets.calorieTarget).toBe(Math.round(2759 * 0.8));
      expect(targets.proteinTargetG).toBe(160); // 2.0 g/kg * 80kg
      expect(targets.fatTargetG).toBeGreaterThan(0);
      expect(targets.carbTargetG).toBeGreaterThan(0);
      expect(targets.fiberTargetG).toBe(Math.round((targets.calorieTarget / 1000) * 14));
      expect(targets.waterTargetMl).toBe(80 * 35);
    });

    it('never recommends below the clinically safe calorie floor', () => {
      const targets = service.calculateNutritionTargets({
        tdee: 1200,
        goal: 'weight_loss',
        weightKg: 45,
        gender: Gender.FEMALE,
      });
      expect(targets.calorieTarget).toBeGreaterThanOrEqual(1200);
    });

    it('applies a surplus for muscle_gain', () => {
      const targets = service.calculateNutritionTargets({
        tdee: 2500,
        goal: 'muscle_gain',
        weightKg: 70,
        gender: Gender.MALE,
      });
      expect(targets.calorieTarget).toBe(Math.round(2500 * 1.1));
    });
  });
});
