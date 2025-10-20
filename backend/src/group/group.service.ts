import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from '@prisma/client';
import { GROUP_MESSAGES } from 'src/messages/group.messages';
import { ValidatorService } from 'src/common/validators/validator.service';

@Injectable()
export class GroupService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const inviteCode = await this.generateUniqueInviteCode();
    const newGroup = await this.prismaService.group.create({
      data: {
        ...createGroupDto,
        inviteCode,
      },
    });

    return newGroup;
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.prismaService.group.findMany();
    if (groups.length === 0) {
      throw new NotFoundException(GROUP_MESSAGES.EMPTY_GROUPS);
    }
    return groups;
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.validator.validateGroupExists(id)
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    await this.validator.validateGroupExists(id);
    return await this.prismaService.group.update({
      where: {
        id,
      },
      data: updateGroupDto,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.validator.validateGroupExists(id);

    await this.prismaService.group.delete({
      where: {
        id,
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
