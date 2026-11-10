import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

const ACCESS_TOKEN_EXPIRATION: string = '15m';
const REFRESH_TOKEN_EXPIRATION: string = '7d';

export type TokenSubject = Pick<User, 'id' | 'email' | 'sysRole'>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateTokens(
    user: TokenSubject,
    tx: Prisma.TransactionClient = this.prismaService,
  ): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      sysRole: user.sysRole,
      jti: randomUUID(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    await tx.user.update({
      where: { id: user.id },
      data: { refreshToken: this.hashRefreshToken(refreshToken) },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async isRefreshTokenValid(refreshToken: string, storedHash: string): Promise<boolean> {
    const stored = Buffer.from(storedHash, 'hex');
    const candidate = Buffer.from(this.hashRefreshToken(refreshToken), 'hex');

    return stored.length === candidate.length && timingSafeEqual(stored, candidate);
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
}
