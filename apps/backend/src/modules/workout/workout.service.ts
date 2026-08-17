import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Repository } from 'typeorm';

import { Exercise } from './entities/exercise.entity';
import { WorkoutSession, WorkoutSource } from './entities/workout-session.entity';
import { WorkoutExercise } from './entities/workout-exercise.entity';
import { WorkoutSet } from './entities/workout-set.entity';
import { PersonalRecord, PersonalRecordType } from './entities/personal-record.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(Exercise) private readonly exercises: Repository<Exercise>,
    @InjectRepository(WorkoutSession) private readonly sessions: Repository<WorkoutSession>,
  ) {}

  listExercises(query?: string): Promise<Exercise[]> {
    if (query) {
      return this.exercises.find({ where: { name: ILike(`%${query}%`) }, take: 50 });
    }
    return this.exercises.find({ take: 200, order: { name: 'ASC' } });
  }

  async getSessionsForDate(userId: string, date: string): Promise<WorkoutSession[]> {
    const dayStart = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
    const dayEnd = new Date(`${date.slice(0, 10)}T23:59:59.999Z`);
    return this.sessions.find({
      where: { userId, startedAt: Between(dayStart, dayEnd) },
      relations: ['exercises', 'exercises.sets'],
      order: { startedAt: 'ASC' },
    });
  }

  async createWorkout(userId: string, dto: CreateWorkoutDto): Promise<WorkoutSession> {
    const exerciseIds = dto.exercises.map((e) => e.exerciseId);
    const found = await this.exercises.find({ where: { id: In(exerciseIds) } });
    if (found.length !== new Set(exerciseIds).size) {
      throw new BadRequestException('One or more exerciseId values do not exist');
    }

    const startedAt = new Date(dto.startedAt);

    return this.sessions.manager.transaction(async (manager) => {
      const session = manager.getRepository(WorkoutSession).create({
        userId,
        startedAt,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
        notes: dto.notes ?? null,
        source: WorkoutSource.MANUAL,
      });

      session.exercises = dto.exercises.map((exerciseDto, index) => {
        const workoutExercise = manager.getRepository(WorkoutExercise).create({
          exerciseId: exerciseDto.exerciseId,
          orderIndex: exerciseDto.orderIndex ?? index,
          notes: exerciseDto.notes ?? null,
        });
        workoutExercise.sets = exerciseDto.sets.map((setDto) =>
          manager.getRepository(WorkoutSet).create({
            userId,
            exerciseId: exerciseDto.exerciseId,
            performedAt: startedAt,
            setNumber: setDto.setNumber,
            weightKg: setDto.weightKg ?? null,
            reps: setDto.reps ?? null,
            durationSeconds: setDto.durationSeconds ?? null,
            restSeconds: setDto.restSeconds ?? null,
          }),
        );
        return workoutExercise;
      });

      const savedSession = await manager.getRepository(WorkoutSession).save(session);

      for (const exerciseDto of dto.exercises) {
        await this.updatePersonalRecords(
          manager.getRepository(PersonalRecord),
          userId,
          exerciseDto.exerciseId,
          exerciseDto.sets,
          startedAt,
        );
      }

      return savedSession;
    });
  }

  private async updatePersonalRecords(
    prRepo: Repository<PersonalRecord>,
    userId: string,
    exerciseId: string,
    sets: CreateWorkoutDto['exercises'][number]['sets'],
    achievedAt: Date,
  ): Promise<void> {
    const maxWeight = sets.reduce(
      (max, s) => (s.weightKg && s.weightKg > max ? s.weightKg : max),
      0,
    );
    if (maxWeight <= 0) return;

    const current = await prRepo.findOne({
      where: { userId, exerciseId, recordType: PersonalRecordType.MAX_WEIGHT, isCurrent: true },
    });

    if (current && Number(current.value) >= maxWeight) return;

    if (current) {
      current.isCurrent = false;
      await prRepo.save(current);
    }

    await prRepo.save(
      prRepo.create({
        userId,
        exerciseId,
        recordType: PersonalRecordType.MAX_WEIGHT,
        value: maxWeight,
        achievedAt,
        isCurrent: true,
      }),
    );
  }

  async deleteWorkout(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessions.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      throw new NotFoundException('Workout session not found');
    }
    // Cascades to workout_exercises -> workout_sets via DB FK. Unlike meals, there's no
    // daily_workout_summary to adjust. Known gap: if a deleted session held the current PR
    // for an exercise, personal_records.is_current is left pointing at a value that's no
    // longer backed by any set — recomputing it would mean rescanning that exercise's full
    // remaining history, which is more than this delete operation should take on; deferred.
    await this.sessions.remove(session);
  }
}
