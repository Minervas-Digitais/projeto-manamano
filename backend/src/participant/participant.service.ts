import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantService {
  constructor(private prismaService: PrismaService) {}

  async create(createParticipantDto: CreateParticipantDto) {
    try {
      return await this.prismaService.participant.create({
        data: createParticipantDto,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const participants = await this.prismaService.participant.findMany();
      if (participants.length < 1) {
        return { message: 'Nenhum participante encontrado.' };
      }
      return participants;
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
        return { message: 'Participante não encontrado.' };
      }
      return participant;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto) {
    try {
      const participant = await this.prismaService.participant.update({
        where: {
          userId_groupId: {
            userId: id.split(',')[0],
            groupId: id.split(',')[1],
          },
        },
        data: updateParticipantDto,
      });
      if (!participant) {
        return { message: 'Participante não encontrado.' };
      }
      return participant;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const participant = await this.prismaService.participant.delete({
        where: {
          userId_groupId: {
            userId: id.split(',')[0],
            groupId: id.split(',')[1],
          },
        },
      });
      if (!participant) {
        return { message: 'Participante não encontrado.' };
      }
      return;
    } catch (error) {
      return error;
    }
  }
}
