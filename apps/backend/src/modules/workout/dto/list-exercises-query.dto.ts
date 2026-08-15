import { IsOptional, IsString } from 'class-validator';

export class ListExercisesQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
