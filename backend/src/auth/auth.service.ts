import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthEntity } from './entity/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
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

      if (user.hash !== createLoginDto.password) {
        throw new UnauthorizedException('Senha incorreta.');
      }

      const payload = { email: user.email };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      return error;
    }
  }
}
