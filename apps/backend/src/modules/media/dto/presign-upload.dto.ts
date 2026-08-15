import { IsIn, IsString, MaxLength } from 'class-validator';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export class PresignUploadDto {
  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsIn(ALLOWED_CONTENT_TYPES)
  contentType: string;
}
