import { IsISO8601 } from 'class-validator';

export class DailyNutritionQueryDto {
  @IsISO8601({ strict: false })
  date: string;
}
