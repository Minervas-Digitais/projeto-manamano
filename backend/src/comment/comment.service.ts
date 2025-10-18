import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType, RoleType } from '@prisma/client';
import { COMMENT_MESSAGES } from 'src/messages/comment.messages';

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {}
  async create(createCommentDto: CreateCommentDto) {
    const comment = await this.prismaService.comment.create({
      data: createCommentDto,
    });

    const post = await this.prismaService.post.findUnique({
      where: { id: createCommentDto.postId },
      include: {
        group: true,
        user: true,
      },
    });

    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGES.POST_NOT_FOUND);
    }

    const sender = await this.prismaService.user.findUnique({
      where: { id: createCommentDto.userId },
      select: { fullName: true },
    });

    if (!sender) {
      throw new NotFoundException(COMMENT_MESSAGES.USER_NOT_FOUND);
    }

    if (post.userId !== createCommentDto.userId) {
      const notificationBody = `${sender.fullName} comentou no seu post no grupo ${post.group.name}`;

      await this.notificationService.createNotification(
        {
          senderId: createCommentDto.userId,
          recipientId: post.userId,
          groupId: post.groupId,
          body: notificationBody,
          type: NotificationType.COMMENT,
          groupName: post.group?.name,
          senderName: sender.fullName,
          idContent: comment.id,
        }
      );
    }

    return comment;
  }

  async remove(id: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGES.NOT_FOUND);
    }
    return await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
