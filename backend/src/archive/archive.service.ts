import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    let postGroupId: string | undefined;

    if (data.postId) {
      const post = await this.validator.validatePostExists(data.postId);
      postGroupId = post.groupId;
    }

    if (data.groupId) group = await this.validator.validateGroupExists(data.groupId);
    if (userId) sender = await this.validator.validateUserExists(userId);

    if (data.groupId && postGroupId && data.groupId !== postGroupId) {
      throw new BadRequestException(ARCHIVE_MESSAGES.GROUP_MISMATCH);
    }

    const groupId = data.groupId ?? postGroupId;

    if (groupId) {
      await this.validator.ensureGroupAccess(groupId, userId);

      if (!group) {
        group = await this.validator.validateGroupExists(groupId);
      }
    }

    const createdArchive = await this.prisma.archive.create({
      data: {
        name: data.name,
        mimeType: data.mimeType,
        contentBase64: data.contentBase64,
        userId: userId,
        groupId: data.groupId,
        postId: data.postId,
        type: data.type,
      },
    });

    if (group) {
      const notificationBody = `Novo arquivo enviado no grupo ${group.name}`;

      await this.notificationService.createNotification(
        {
          recipientId: undefined,
          groupId: group.id,
          body: notificationBody,
          type: NotificationType.FIXED,
          groupName: group.name,
          senderName: sender.fullName,
          idContent: createdArchive.id,
        },
        userId,
      );
    }

    return this.mapToResponseDto(createdArchive);
  }

  async getArchiveById(id: string, callerId: string): Promise<ResponseArchiveDto> {
    const archive = await this.prisma.archive.findUnique({
      where: { id },
    });

    if (!archive) {
      throw new NotFoundException(ARCHIVE_MESSAGES.NOT_FOUND);
    }

    const groupIds = new Set<string>();

    if (archive.groupId) groupIds.add(archive.groupId);

    if (archive.postId) {
      const post = await this.validator.validatePostExists(archive.postId);
      groupIds.add(post.groupId);
    }

    if (groupIds.size > 0) {
      await Promise.all(
        [...groupIds].map((groupId) => this.validator.ensureGroupAccess(groupId, callerId)),
      );
    } else if (archive.userId) {
      const { isAdmin } = await this.validator.getAccessibleGroupIds(callerId);
      if (!isAdmin && archive.userId !== callerId) {
        throw new ForbiddenException(ARCHIVE_MESSAGES.UNAUTHORIZED_ACCESS);
      }
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

  async getArchivesByPostId(postId: string, callerId: string): Promise<ResponseArchiveDto[]> {
    const post = await this.validator.validatePostExists(postId);
    await this.validator.ensureGroupAccess(post.groupId, callerId);

    const archives = await this.prisma.archive.findMany({
      where: { postId },
    });

    return archives.map(this.mapToResponseDto);
  }

  async getArchivesByGroupId(groupId: string, callerId: string): Promise<ResponseArchiveDto[]> {
    await this.validator.validateGroupExists(groupId);
    await this.validator.ensureGroupAccess(groupId, callerId);

    const archives = await this.prisma.archive.findMany({
      where: { groupId },
    });

    return archives.map(this.mapToResponseDto);
  }
}
