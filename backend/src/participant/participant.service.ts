import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantService {
  constructor(private prismaService: PrismaService) {}

  async joinGroupWithInvite(createParticipantDto: CreateParticipantDto) {
    try {
      const group = await this.prismaService.group.findUnique({
        where: {
          inviteCode: createParticipantDto.inviteCode,
        },
      });
      if (!group) {
        throw new NotFoundException('Código de convite inválido.');
      }

      const participant = await this.prismaService.participant.findUnique({
        where: {
          userId_groupId: {
            userId: createParticipantDto.userId,
            groupId: group.id,
          },
        },
      });
      if (participant) {
        throw new Error('Você já está neste grupo.');
      }

      const participantBody = {
        groupId: createParticipantDto.groupId,
        userId: createParticipantDto.userId,
        role: createParticipantDto.role,
      };
      participantBody.role = 'MEMBER';

      return await this.prismaService.participant.create({
        data: participantBody,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const participants = await this.prismaService.participant.findMany();
      if (participants.length < 1) {
        throw new NotFoundException('Não há usuários em grupos.');
      }
      return participants;
    } catch (error) {
      return error;
    }
  }

  async findUsersInGroup(groupId: string) {
    try {
      const users = await this.prismaService.participant.findMany({
        where: {
          groupId,
        },
        select: {
          role: true,
          userId: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
      });
      if (users.length < 1) {
        throw new NotFoundException('Não há usuários neste grupo.');
      }
      return users;
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const participant = await this.prismaService.participant.findUnique({
        where: {
          userId_groupId: {
            userId: id.split(',')[0],
            groupId: id.split(',')[1],
          },
        },
      });
      if (!participant) {
        throw new NotFoundException('Participante não encontrado.');
      }
      return participant;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto) {
    try {
      const participant = await this.findOne(id);
      if (typeof participant === 'object' && participant instanceof Error) {
        return participant;
      }
      return await this.prismaService.participant.update({
        where: {
          userId_groupId: {
            userId: id.split(',')[0],
            groupId: id.split(',')[1],
          },
        },
        data: updateParticipantDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const participant = await this.findOne(id);
      if (typeof participant === 'object' && participant instanceof Error) {
        return participant;
      }
      return await this.prismaService.participant.delete({
        where: {
          userId_groupId: {
            userId: id.split(',')[0],
            groupId: id.split(',')[1],
          },
        },
      });
    } catch (error) {
      return error;
    }
  }
}
