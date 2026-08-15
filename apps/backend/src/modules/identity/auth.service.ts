import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';

interface AccessTokenPayload {
  sub: string;
  email: string;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, meta: RequestMeta = {}): Promise<AuthTokensDto> {
    const existing = await this.users.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth ?? null,
    });
    await this.users.save(user);

    return this.issueTokenPair(user, meta);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.users.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    return user;
  }

  async login(dto: LoginDto, meta: RequestMeta = {}): Promise<AuthTokensDto> {
    const user = await this.validateUser(dto.email, dto.password);
    return this.issueTokenPair(user, meta);
  }

  async refresh(rawRefreshToken: string, meta: RequestMeta = {}): Promise<AuthTokensDto> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshTokenPayload>(rawRefreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const existing = await this.refreshTokens.findOne({ where: { id: payload.jti } });
    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt) {
      // Reuse of an already-rotated token means the token chain was likely stolen — burn the
      // whole session rather than just this token (docs/architecture-plan.md §D Auth row).
      await this.revokeAllForUser(existing.userId);
      throw new UnauthorizedException('Refresh token reuse detected — session revoked');
    }

    const presentedHash = this.hashToken(rawRefreshToken);
    if (presentedHash !== existing.tokenHash) {
      await this.revokeAllForUser(existing.userId);
      throw new UnauthorizedException('Refresh token mismatch — session revoked');
    }

    const user = await this.users.findOne({ where: { id: existing.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is unavailable');
    }

    const tokens = await this.issueTokenPair(user, meta);
    const newTokenPayload = (await this.jwt.decode(tokens.refreshToken)) as RefreshTokenPayload;

    existing.revokedAt = new Date();
    existing.replacedByTokenId = newTokenPayload.jti;
    await this.refreshTokens.save(existing);

    return tokens;
  }

  async logout(rawRefreshToken: string): Promise<void> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwt.decode(rawRefreshToken) as RefreshTokenPayload;
    } catch {
      return;
    }
    if (!payload?.jti) return;

    const existing = await this.refreshTokens.findOne({ where: { id: payload.jti } });
    if (existing && !existing.revokedAt) {
      existing.revokedAt = new Date();
      await this.refreshTokens.save(existing);
    }
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute();
  }

  private async issueTokenPair(user: User, meta: RequestMeta): Promise<AuthTokensDto> {
    const accessExpiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: accessExpiresIn,
    });

    const jti = uuidv4();
    const refreshPayload: RefreshTokenPayload = { sub: user.id, jti };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn,
    });

    const refreshRow = this.refreshTokens.create({
      id: jti,
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: this.addDuration(refreshExpiresIn),
      createdByIp: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    });
    await this.refreshTokens.save(refreshRow);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.durationToSeconds(accessExpiresIn),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private durationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) return 900;
    const value = Number(match[1]);
    const unit = match[2];
    const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1;
    return value * multiplier;
  }

  private addDuration(duration: string): Date {
    const seconds = this.durationToSeconds(duration);
    return new Date(Date.now() + seconds * 1000);
  }
}
