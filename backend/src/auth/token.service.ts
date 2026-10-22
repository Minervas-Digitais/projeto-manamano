import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

const ACCESS_TOKEN_EXPIRATION: string = '15m';
const REFRESH_TOKEN_EXPIRATION: string = '7d';

export type TokenSubject = Pick<User, 'id' | 'email' | 'sysRole'>;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Emissão, validação e revogação dos tokens de sessão. Fica separado do
 * AuthService para que outros módulos (ex.: troca de senha no UserModule)
 * possam rotacionar a sessão sem criar dependência circular com o AuthModule.
 */
@Injectable()
export class TokenService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Gera um novo par de tokens e grava o hash SHA-256 do refresh token.
   * Como só existe um refresh token por usuário, isso revoga qualquer sessão anterior.
   */
  async generateTokens(user: TokenSubject): Promise<TokenPair> {
    // jti garante tokens distintos mesmo quando emitidos no mesmo segundo
    // (sem ele, a rotação logo após o login reemitiria o mesmo refresh token).
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

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: this.hashRefreshToken(refreshToken) },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Valida o refresh token comparando seu hash SHA-256 em tempo constante.
   */
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
