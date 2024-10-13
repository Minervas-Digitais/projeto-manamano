import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(
        createUserDto.hash,
        roundsOfHashing,
      );

      createUserDto.hash = hashedPassword;
      createUserDto.savedPost = [];

      return await this.prismaService.user.create({
        data: createUserDto,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const users = await this.prismaService.user.findMany();
      if (users.length === 0) {
        throw new NotFoundException('Não há usuários cadastrados.');
      }
      return users;
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }
      return user;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      if (typeof user === 'object' && user instanceof Error) {
        return user;
      }
      return await this.prismaService.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.findOne(id);
      if (typeof user === 'object' && user instanceof Error) {
        return user;
      }
      await this.prismaService.user.delete({
        where: {
          id,
        },
      });
      return 'Usuário deletado com sucesso.';
    } catch (error) {
      return error;
    }
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.hash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha inválida.');
      }

      const hashedPassword = await bcrypt.hash(newPassword, roundsOfHashing);

      return await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          hash: hashedPassword,
        },
      });
    } catch (error) {
      return error;
    }
  }
}
