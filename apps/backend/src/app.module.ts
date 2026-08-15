import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { IdentityModule } from './modules/identity/identity.module';
import { ProfileModule } from './modules/profile/profile.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { AiGatewayModule } from './modules/ai-gateway/ai-gateway.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CoachModule } from './modules/coach/coach.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        ssl: config.get<string>('DATABASE_SSL') === 'true',
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
        // Migrations are the source of truth for schema (src/migrations) — never true outside
        // a throwaway local sandbox.
        synchronize: false,
      }),
    }),
    IdentityModule,
    ProfileModule,
    NutritionModule,
    WorkoutModule,
    AiGatewayModule,
    MediaModule,
    NotificationModule,
    SubscriptionModule,
    AdminModule,
    AnalyticsModule,
    CoachModule,
  ],
})
export class AppModule {}
