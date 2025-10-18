import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArchiveDto, ResponseArchiveDto } from './dto/archive.dto';
import { NotificationType } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService, private notificationService: NotificationService) {}

  async createArchive(data: CreateArchiveDto): Promise<ResponseArchiveDto> {
    const createdArchive = await this.prisma.archive.create({
      data: {
        name: data.name,
        mimeType: data.mimeType,
        contentBase64: data.contentBase64,
        userId: data.userId,
        groupId: data.groupId,
        postId: data.postId,
      },
    });

    if (data.groupId) {
      const group = await this.prisma.group.findUnique({
        where: { id: data.groupId },
      });

      const sender = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { fullName: true },
      });

      const notificationBody = `Novo arquivo enviado no grupo ${group?.name ?? 'desconhecido'}`;

      await this.notificationService.createNotification(
        {
          senderId: data.userId,
          recipientId: undefined, 
          groupId: data.groupId,
          body: notificationBody,
          type: NotificationType.FIXED,
          groupName: group?.name ?? null,
          senderName: sender?.fullName ?? null,
          idContent: createdArchive.id,
        }
      );
    }

    return this.mapToResponseDto(createdArchive);
  }

  async getArchiveById(id: string): Promise<ResponseArchiveDto> {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
    });

    if (!archive) {
      throw new NotFoundException('Archive not found');
    }

    return this.mapToResponseDto(archive);
  }

  private mapToResponseDto(archive: any): ResponseArchiveDto {
    return {
      id: archive.id,
      name: archive.name,
      mimeType: archive.mimeType,
      type: archive.type,
      userId: archive.userId,
      groupId: archive.groupId,
      contentBase64: archive.contentBase64,
      postId: archive.postId,
    };
  }

  async getArchivesByPostId(postId: string): Promise<ResponseArchiveDto[]> {
    const archives = await this.prisma.archive.findMany({
      where: { postId },
    });

    return archives.map(this.mapToResponseDto);
  }

  async getArchivesByGroupId(groupId: string): Promise<ResponseArchiveDto[]> {
    const archives = await this.prisma.archive.findMany({
      where: { groupId },
    });

    if (archives.length === 0) {
      throw new NotFoundException('No archives found for this group');
    }

    return archives.map(this.mapToResponseDto);
  }
}
