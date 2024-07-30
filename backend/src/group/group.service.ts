import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(private prismaService: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      return await this.prismaService.group.create({
        data: createGroupDto,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const groups = await this.prismaService.group.findMany();
      if (!groups) {
        return 'Não há grupos cadastrados.';
      }
      return groups;
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const group = await this.prismaService.group.findUnique({
        where: {
          id,
        },
      });
      if (!group) {
        return 'Grupo não encontrado.';
      }
      return group;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      const group = await this.prismaService.group.update({
        where: {
          id,
        },
        data: updateGroupDto,
      });
      if (!group) {
        return 'Grupo não encontrado.';
      }
      return group;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const group = await this.prismaService.group.delete({
        where: {
          id,
        },
      });
      if (!group) {
        return 'Grupo não encontrado.';
      }
      return group;
    } catch (error) {
      return error;
    }
  }
}
