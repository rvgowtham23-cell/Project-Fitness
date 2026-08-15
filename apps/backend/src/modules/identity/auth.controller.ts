import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthTokensDto> {
    return this.authService.register(dto, this.requestMeta(req));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthTokensDto> {
    return this.authService.login(dto, this.requestMeta(req));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto, @Req() req: Request): Promise<AuthTokensDto> {
    return this.authService.refresh(dto.refreshToken, this.requestMeta(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.authService.logout(dto.refreshToken);
  }

  // TODO(architecture-plan.md §D Auth row): implement Google/Apple OAuth exchange (verify
  // provider id_token, upsert User by oauthSubject, then issue the same token pair as
  // login()). Sign in with Apple becomes an App Store requirement once this ships.
  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  loginWithGoogle(): Promise<AuthTokensDto> {
    throw new NotImplementedException('Google OAuth is not yet implemented');
  }

  @Post('oauth/apple')
  @HttpCode(HttpStatus.OK)
  loginWithApple(): Promise<AuthTokensDto> {
    throw new NotImplementedException('Sign in with Apple is not yet implemented');
  }

  private requestMeta(req: Request) {
    return {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
