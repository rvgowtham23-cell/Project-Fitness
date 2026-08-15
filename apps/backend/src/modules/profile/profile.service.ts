import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { NutritionTargets } from '@fitness/shared-types';

import { Gender, User } from '../identity/entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { GoalSource, UserGoal } from './entities/user-goal.entity';
import { CalorieEngineService } from './calorie-engine.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile) private readonly profiles: Repository<UserProfile>,
    @InjectRepository(UserGoal) private readonly goals: Repository<UserGoal>,
    private readonly calorieEngine: CalorieEngineService,
  ) {}

  async getProfile(userId: string): Promise<{ profile: UserProfile; activeGoal: UserGoal | null }> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found — complete onboarding first');
    }
    const activeGoal = await this.goals.findOne({ where: { userId, isActive: true } });
    return { profile, activeGoal };
  }

  async getTargets(userId: string): Promise<NutritionTargets> {
    const activeGoal = await this.goals.findOne({ where: { userId, isActive: true } });
    if (!activeGoal) {
      throw new NotFoundException('No active goal — complete onboarding first');
    }
    return this.toNutritionTargets(activeGoal);
  }

  async completeOnboarding(
    userId: string,
    dto: OnboardingDto,
  ): Promise<{ profile: UserProfile; goal: UserGoal }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.gender) user.gender = dto.gender;
    if (dto.dateOfBirth) user.dateOfBirth = dto.dateOfBirth;
    await this.users.save(user);

    let profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profiles.create({ userId });
    }
    profile.heightCm = dto.heightCm;
    profile.currentWeightKg = dto.currentWeightKg;
    profile.activityLevel = dto.activityLevel;
    profile.dietaryPreferences = dto.dietaryPreferences ?? null;
    profile.allergies = dto.allergies ?? null;
    profile.onboardingCompletedAt = new Date();
    await this.profiles.save(profile);

    const goal = await this.recalculateAndSaveGoal(user, profile, {
      goalType: dto.goalType,
      targetWeightKg: dto.targetWeightKg ?? null,
      weeklyWeightChangeGoalKg: dto.weeklyWeightChangeGoalKg ?? null,
    });

    return { profile, goal };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found — complete onboarding first');
    }
    Object.assign(profile, dto);
    return this.profiles.save(profile);
  }

  async createGoal(userId: string, dto: CreateGoalDto): Promise<UserGoal> {
    const user = await this.users.findOne({ where: { id: userId } });
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!user || !profile) {
      throw new NotFoundException('Profile not found — complete onboarding first');
    }

    const overrideFields = [
      dto.calorieTarget,
      dto.proteinTargetG,
      dto.carbTargetG,
      dto.fatTargetG,
      dto.fiberTargetG,
      dto.waterTargetMl,
    ];
    const anyOverrideProvided = overrideFields.some((f) => f !== undefined);
    const allOverridesProvided = overrideFields.every((f) => f !== undefined);

    if (anyOverrideProvided && !allOverridesProvided) {
      throw new BadRequestException(
        'To override targets, calorieTarget/proteinTargetG/carbTargetG/fatTargetG/fiberTargetG/waterTargetMl must all be provided together',
      );
    }

    if (allOverridesProvided) {
      return this.saveNewActiveGoal(userId, {
        goalType: dto.goalType,
        targetWeightKg: dto.targetWeightKg ?? null,
        weeklyWeightChangeGoalKg: dto.weeklyWeightChangeGoalKg ?? null,
        calorieTarget: dto.calorieTarget!,
        proteinTargetG: dto.proteinTargetG!,
        carbTargetG: dto.carbTargetG!,
        fatTargetG: dto.fatTargetG!,
        fiberTargetG: dto.fiberTargetG!,
        waterTargetMl: dto.waterTargetMl!,
        source: GoalSource.USER_OVERRIDE,
      });
    }

    return this.recalculateAndSaveGoal(user, profile, {
      goalType: dto.goalType,
      targetWeightKg: dto.targetWeightKg ?? null,
      weeklyWeightChangeGoalKg: dto.weeklyWeightChangeGoalKg ?? null,
    });
  }

  private async recalculateAndSaveGoal(
    user: User,
    profile: UserProfile,
    params: {
      goalType: UserGoal['goalType'];
      targetWeightKg: number | null;
      weeklyWeightChangeGoalKg: number | null;
    },
  ): Promise<UserGoal> {
    const age = this.ageFromDateOfBirth(user.dateOfBirth);
    const gender = user.gender ?? Gender.PREFER_NOT_TO_SAY;
    const bmr = this.calorieEngine.calculateBmr({
      weightKg: Number(profile.currentWeightKg),
      heightCm: Number(profile.heightCm),
      ageYears: age,
      gender,
    });
    const tdee = this.calorieEngine.calculateTdee(bmr, profile.activityLevel);
    const targets = this.calorieEngine.calculateNutritionTargets({
      tdee,
      goal: params.goalType,
      weightKg: Number(profile.currentWeightKg),
      gender,
    });

    return this.saveNewActiveGoal(user.id, {
      goalType: params.goalType,
      targetWeightKg: params.targetWeightKg,
      weeklyWeightChangeGoalKg: params.weeklyWeightChangeGoalKg,
      calorieTarget: targets.calorieTarget,
      proteinTargetG: targets.proteinTargetG,
      carbTargetG: targets.carbTargetG,
      fatTargetG: targets.fatTargetG,
      fiberTargetG: targets.fiberTargetG,
      waterTargetMl: targets.waterTargetMl,
      source: GoalSource.SYSTEM_CALCULATED,
    });
  }

  private async saveNewActiveGoal(
    userId: string,
    values: Omit<Partial<UserGoal>, 'userId'> & {
      goalType: UserGoal['goalType'];
      calorieTarget: number;
    },
  ): Promise<UserGoal> {
    return this.goals.manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(UserGoal)
        .set({ isActive: false })
        .where('user_id = :userId AND is_active = true', { userId })
        .execute();

      const goal = manager.getRepository(UserGoal).create({
        userId,
        isActive: true,
        ...values,
      });
      return manager.getRepository(UserGoal).save(goal);
    });
  }

  private toNutritionTargets(goal: UserGoal): NutritionTargets {
    return {
      calorieTarget: goal.calorieTarget,
      proteinTargetG: Number(goal.proteinTargetG),
      carbTargetG: Number(goal.carbTargetG),
      fatTargetG: Number(goal.fatTargetG),
      fiberTargetG: Number(goal.fiberTargetG),
      waterTargetMl: goal.waterTargetMl,
    };
  }

  private ageFromDateOfBirth(dateOfBirth: string | null): number {
    if (!dateOfBirth) return 30; // conservative default when DOB hasn't been collected yet
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)), 13);
  }
}
