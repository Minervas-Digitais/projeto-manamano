import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entity/auth.entity';
import { RefreshDto } from './dto/refresh.dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async login(createLoginDto: LoginDto): Promise<AuthEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: createLoginDto.email,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const isPasswordValid = await bcrypt.compare(createLoginDto.password, user.hash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha incorreta.');
      }

      const tokens = await this.tokenService.generateTokens(user);

      return {
        ...tokens,
        loggedId: user.id,
      };
    } catch (error) {
      throw error;
    }
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
