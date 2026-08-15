import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Exercise } from './entities/exercise.entity';
import { WorkoutSession } from './entities/workout-session.entity';
import { WorkoutExercise } from './entities/workout-exercise.entity';
import { WorkoutSet } from './entities/workout-set.entity';
import { PersonalRecord } from './entities/personal-record.entity';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exercise,
      WorkoutSession,
      WorkoutExercise,
      WorkoutSet,
      PersonalRecord,
    ]),
  ],
  controllers: [WorkoutController],
  providers: [WorkoutService],
  exports: [WorkoutService, TypeOrmModule],
})
export class WorkoutModule {}
