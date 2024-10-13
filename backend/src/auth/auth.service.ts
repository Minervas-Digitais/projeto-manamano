import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

      const isPasswordValid = await bcrypt.compare(
        createLoginDto.password,
        user.hash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha incorreta.');
      }

      const payload = { email: user.email };
      return {
        accessToken: this.jwtService.sign(payload),
        loggedId: user.id,
      };
    } catch (error) {
      return error;
    }
  }
}
