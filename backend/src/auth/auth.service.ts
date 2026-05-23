import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entity/auth.entity';
import { RefreshDto } from './dto/refresh.dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';
import { LogoutDto } from './dto/logout.dto';

const ACCESS_TOKEN_EXPIRATION: string = '15m';
const REFRESH_TOKEN_EXPIRATION: string = '7d';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      sysRole: user.sysRole,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

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

      const tokens = await this.generateTokens(user);

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

      const isValid = await bcrypt.compare(refreshLoginDto.refreshToken, user.refreshToken);

      if (!isValid) {
        throw new UnauthorizedException(BASE_MESSAGES.UNAUTHORIZED_ACCESS);
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(logoutDto: LogoutDto) {
    await this.prismaService.user.update({
      where: { id: logoutDto.userId },
      data: { refreshToken: null },
    });

    return { message: BASE_MESSAGES.SUCCESS };
  }
}
