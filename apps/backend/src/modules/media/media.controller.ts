import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/decorators/current-user.decorator';
import { JwtPrincipal } from '../identity/strategies/jwt.strategy';
import { MediaService } from './media.service';
import { PresignUploadDto } from './dto/presign-upload.dto';

@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  presign(@CurrentUser() user: JwtPrincipal, @Body() dto: PresignUploadDto) {
    return this.mediaService.presignMealImageUpload(user.userId, dto);
  }
}
