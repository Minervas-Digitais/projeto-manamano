import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from '@prisma/client';
import { COMMENT_MESSAGES } from 'src/messages/comment.messages';
import { ValidatorService } from 'src/common/validators/validator.service';
import { use } from 'passport';

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
    private readonly validator: ValidatorService,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
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

    const senderUser = await this.validator.validateUserExists(userId);

    const comment = await this.prismaService.comment.create({
      data: { ...createCommentDto, userId },
    });

    const senderName = senderUser.fullName;

    if (post.userId !== userId) {
      const notificationBody = `${senderName} comentou no seu post no grupo ${post.group.name}`;

      await this.notificationService.createNotification(
        {
          recipientId: post.userId,
          groupId: post.groupId,
          body: notificationBody,
          type: NotificationType.COMMENT,
          groupName: post.group.name,
          senderName: senderName,
          idContent: comment.id,
        },
        userId,
      );
    }

    return comment;
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGES.NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(COMMENT_MESSAGES.UNAUTHORIZED_DELETE);
    }

    return await this.prismaService.comment.delete({
      where: { id: commentId },
    });
  }
}
