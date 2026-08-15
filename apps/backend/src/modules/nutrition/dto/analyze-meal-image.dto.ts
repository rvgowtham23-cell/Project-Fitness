import { IsOptional, IsString } from 'class-validator';

// The image itself is uploaded separately via POST /uploads/presign (media module) — this DTO
// only carries the resulting S3 reference, never raw image bytes, to keep this request small
// and the AI Gateway's audit trail (ai_requests.input_ref) meaningful.
export class AnalyzeMealImageDto {
  @IsString()
  imageRef: string;

  @IsOptional()
  @IsString()
  mealTypeHint?: string;
}
