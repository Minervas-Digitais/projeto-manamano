import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entity/auth.entity';
import { RefreshDto } from './dto/refresh.dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';
import { TokenService } from './token.service';

// Hash descartável usado quando o e-mail não existe, para que bcrypt.compare
// tenha o mesmo custo do caminho com usuário real e não vaze a existência da conta.
// O custo (10) precisa ficar alinhado a roundsOfHashing.
export const DUMMY_PASSWORD_HASH = '$2b$10$RpmeAafxmnTkrO1B7ByU7.nwSnXpyjAQFYA7PSNUeceVhisyj5sXS';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async login(createLoginDto: LoginDto): Promise<AuthEntity> {
    const email = createLoginDto.email.trim().toLowerCase();
    const user = await this.prismaService.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
    });

    const isPasswordValid = await bcrypt.compare(
      createLoginDto.password,
      user?.hash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException(BASE_MESSAGES.INVALID_CREDENTIALS);
    }

    const tokens = await this.tokenService.generateTokens(user);

    return {
      ...tokens,
      loggedId: user.id,
    };
  }

  async refresh(refreshLoginDto: RefreshDto) {
    try {
      const payload = this.jwtService.verify(refreshLoginDto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException(BASE_MESSAGES.UNAUTHORIZED_ACCESS);
      }

      const isValid = await this.tokenService.isRefreshTokenValid(
        refreshLoginDto.refreshToken,
        user.refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException(BASE_MESSAGES.UNAUTHORIZED_ACCESS);
      }

      return this.tokenService.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string) {
    await this.tokenService.revokeRefreshToken(userId);

    return { message: BASE_MESSAGES.SUCCESS };
  }
}
