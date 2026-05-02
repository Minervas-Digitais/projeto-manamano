import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group, UserRole } from '@prisma/client';
import { GROUP_MESSAGES } from 'src/messages/group.messages';
import { ValidatorService } from 'src/common/validators/validator.service';

@Injectable()
export class GroupService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    callerId: string,
  ): Promise<Group> {
    const inviteCode = await this.generateUniqueInviteCode();

    return await this.prismaService.$transaction(async (prisma) => {
      const group = await prisma.group.create({
        data: {
          ...createGroupDto,
          inviteCode,
        },
      });

      await prisma.participant.create({
        data: {
          groupId: group.id,
          userId: callerId,
          role: UserRole.INSTRUCTOR,
        },
      });
      return group;
    });
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.prismaService.group.findMany();
    if (groups.length === 0) {
      throw new NotFoundException(GROUP_MESSAGES.EMPTY_GROUPS);
    }
    return groups;
  }

  async findOne(groupId: string): Promise<Group> {
    const group = await this.validator.validateGroupExists(groupId);
    return group;
  }

  async update(
    groupId: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    await this.validator.validateGroupExists(groupId);
    return await this.prismaService.group.update({
      where: {
        id: groupId,
      },
      data: updateGroupDto,
    });
  }

  async remove(groupId: string): Promise<{ message: string }> {
    await this.validator.validateGroupExists(groupId);

    await this.prismaService.group.delete({
      where: {
        id: groupId,
      },
    });
    return { message: GROUP_MESSAGES.DELETE_SUCCESS };
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
    const group = await this.prismaService.group.findUnique({
      where: { inviteCode },
    });
    return !group;
  }

  private async generateUniqueInviteCode(length: number = 8) {
    let inviteCode: string;
    let isUnique = false;

    do {
      inviteCode = this.generateInviteCode(length);
      isUnique = await this.isInviteCodeUnique(inviteCode);
    } while (!isUnique);

    return inviteCode;
  }
}
