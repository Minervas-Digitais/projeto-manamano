import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArchiveDto, ResponseArchiveDto } from './dto/archive.dto';
import { NotificationType } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { ARCHIVE_MESSAGES } from 'src/messages/archive.messages';
import { ValidatorService } from 'src/common/validators/validator.service';

@Injectable()
export class ArchiveService {
  constructor(
    private readonly prisma: PrismaService,
    private notificationService: NotificationService,
    private readonly validator: ValidatorService,
  ) {}

  async createArchive(data: CreateArchiveDto, userId: string): Promise<ResponseArchiveDto> {
    let group = null;
    let sender = null;

    if (data.postId) await this.validator.validatePostExists(data.postId);
    if (data.groupId)
      group = await this.validator.validateGroupExists(data.groupId);
    if (userId)
      sender = await this.validator.validateUserExists(userId);

    const createdArchive = await this.prisma.archive.create({
      data: {
        name: data.name,
        mimeType: data.mimeType,
        contentBase64: data.contentBase64,
        userId: userId,
        groupId: data.groupId,
        postId: data.postId,
      },
    });

    const notificationBody = `Novo arquivo enviado no grupo ${group.name}`;

    await this.notificationService.createNotification({
      recipientId: undefined,
      groupId: data.groupId,
      body: notificationBody,
      type: NotificationType.FIXED,
      groupName: group.name,
      senderName: sender.fullName,
      idContent: createdArchive.id,
    }, userId);

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
    await this.validator.validatePostExists(postId);

    const archives = await this.prisma.archive.findMany({
      where: { postId },
    });

    return archives.map(this.mapToResponseDto);
  }

  async getArchivesByGroupId(groupId: string): Promise<ResponseArchiveDto[]> {
    await this.validator.validateGroupExists(groupId);

    const archives = await this.prisma.archive.findMany({
      where: { groupId },
    });

    return archives.map(this.mapToResponseDto);
  }
}
