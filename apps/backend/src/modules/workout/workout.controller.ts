import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsISO8601 } from 'class-validator';

import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/decorators/current-user.decorator';
import { JwtPrincipal } from '../identity/strategies/jwt.strategy';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';

class WorkoutsForDateQueryDto {
  @IsISO8601({ strict: false })
  date: string;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get('exercises')
  listExercises(@Query() query: ListExercisesQueryDto) {
    return this.workoutService.listExercises(query.q);
  }

  @Get('workouts')
  getWorkoutsForDate(@CurrentUser() user: JwtPrincipal, @Query() query: WorkoutsForDateQueryDto) {
    return this.workoutService.getSessionsForDate(user.userId, query.date);
  }

  @Post('workouts')
  createWorkout(@CurrentUser() user: JwtPrincipal, @Body() dto: CreateWorkoutDto) {
    return this.workoutService.createWorkout(user.userId, dto);
  }
}
