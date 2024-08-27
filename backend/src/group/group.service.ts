import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(private prismaService: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const newGroup = await this.prismaService.group.create({
        data: createGroupDto,
      });

      return await this.generateInvite(newGroup.id);
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

  private async generateInvite(groupId: string) {
    try {
      const inviteCode = await this.generateUniqueInviteCode();

      const updatedGroup = await this.prismaService.group.update({
        where: { id: groupId },
        data: { inviteCode },
      });

      return updatedGroup;
    } catch (error) {
      return error;
    }
  }
}
