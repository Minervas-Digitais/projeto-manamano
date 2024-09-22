import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(private prismaService: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const inviteCode = await this.generateUniqueInviteCode();
      const newGroup = await this.prismaService.group.create({
        data: {
          ...createGroupDto,
          inviteCode,
        },
      });

      return newGroup;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const groups = await this.prismaService.group.findMany();
      if (groups.length === 0) {
        throw new NotFoundException('Não há grupos cadastrados.');
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
        throw new NotFoundException('Grupo não encontrado.');
      }
      return group;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      const group = await this.findOne(id);
      if (typeof group === 'object' && group instanceof Error) {
        return group;
      }
      return await this.prismaService.group.update({
        where: {
          id,
        },
        data: updateGroupDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const group = await this.findOne(id);
      if (typeof group === 'object' && group instanceof Error) {
        return group;
      }
      await this.prismaService.group.delete({
        where: {
          id,
        },
      });
      return 'Grupo deletado com sucesso.';
    } catch (error) {
      return error;
    }
  }

  /* Funções auxiliares */
  private generateInviteCode(length: number = 8) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private async isInviteCodeUnique(inviteCode: string) {
    try {
      const group = await this.prismaService.group.findUnique({
        where: { inviteCode },
      });
      return !group;
    } catch (error) {
      return error;
    }
  }

  private async generateUniqueInviteCode(length: number = 8) {
    try {
      let inviteCode: string;
      let isUnique = false;

      do {
        inviteCode = this.generateInviteCode(length);
        isUnique = await this.isInviteCodeUnique(inviteCode);
      } while (!isUnique);

      return inviteCode;
    } catch (error) {
      return error;
    }
  }
}
