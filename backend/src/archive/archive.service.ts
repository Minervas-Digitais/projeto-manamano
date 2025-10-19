import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArchiveDto, ResponseArchiveDto } from './dto/archive.dto';
import { Archive, NotificationType } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { ARCHIVE_MESSAGES } from 'src/messages/archive.messages';

@Injectable()
export class ArchiveService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createArchive(data: CreateArchiveDto): Promise<ResponseArchiveDto> {
    let group = null;
    let sender = null;

    if (data.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: data.postId },
      });
      if (!post) throw new NotFoundException(ARCHIVE_MESSAGES.POST_NOT_FOUND);
    }

    if (data.groupId) {
      group = await this.prisma.group.findUnique({
        where: { id: data.groupId },
      });
      if (!group) throw new NotFoundException(ARCHIVE_MESSAGES.GROUP_NOT_FOUND);
    }

    if (data.userId) {
      sender = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { fullName: true },
      });
      if (!sender) throw new NotFoundException(ARCHIVE_MESSAGES.USER_NOT_FOUND);
    }
    
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

    const notificationBody = `Novo arquivo enviado no grupo ${group.name}`;

    await this.notificationService.createNotification({
      senderId: data.userId,
      recipientId: undefined,
      groupId: data.groupId,
      body: notificationBody,
      type: NotificationType.FIXED,
      groupName: group.name,
      senderName: sender.fullName,
      idContent: createdArchive.id,
    });

    return this.mapToResponseDto(createdArchive);
  }

  async getArchiveById(id: string): Promise<ResponseArchiveDto> {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
    });

    if (!archive) {
      throw new NotFoundException(ARCHIVE_MESSAGES.NOT_FOUND);
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
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException(ARCHIVE_MESSAGES.POST_NOT_FOUND);
    }

    const archives = await this.prisma.archive.findMany({
      where: { postId },
    });

    return archives.map(this.mapToResponseDto);
  }

  async getArchivesByGroupId(groupId: string): Promise<ResponseArchiveDto[]> {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(ARCHIVE_MESSAGES.GROUP_NOT_FOUND);
    }

    const archives = await this.prisma.archive.findMany({
      where: { groupId },
    });

    if (archives.length === 0) {
      throw new NotFoundException(ARCHIVE_MESSAGES.EMPTY_ARCHIVES);
    }

    return archives.map(this.mapToResponseDto);
  }
}
