import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../identity/entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserGoal } from './entities/user-goal.entity';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { CalorieEngineService } from './calorie-engine.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, UserGoal])],
  controllers: [ProfileController],
  providers: [ProfileService, CalorieEngineService],
  exports: [ProfileService, CalorieEngineService, TypeOrmModule],
})
export class ProfileModule {}
