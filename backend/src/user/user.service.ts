import { Injectable } from '@nestjs/common';
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
      if (!users) {
        return 'Não há usuários cadastrados.';
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
        return 'Usuário não encontrado.';
      }
      return user;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.hash) {
        updateUserDto.hash = await bcrypt.hash(
          updateUserDto.hash,
          roundsOfHashing,
        );
      }

      const user = await this.prismaService.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      });
      if (!user) {
        return 'Usuário não encontrado.';
      }
      return user;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const user = await this.prismaService.user.delete({
        where: {
          id,
        },
      });
      if (!user) {
        return 'Usuário não encontrado.';
      }
      return user;
    } catch (error) {
      return error;
    }
  }
}
