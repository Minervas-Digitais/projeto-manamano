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

@Injectable()
export class CommentService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
    private readonly validator: ValidatorService,
  ) {}
  async create(createCommentDto: CreateCommentDto, currentUserId: string) {
    if (createCommentDto.userId !== currentUserId) {
      throw new ForbiddenException(COMMENT_MESSAGES.UNAUTHORIZED_CREATE);
    }

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

    const senderUser = await this.validator.validateUserExists(createCommentDto.userId)
    
    const comment = await this.prismaService.comment.create({
      data: createCommentDto,
    });

    const senderName = senderUser.fullName;

    if (post.userId !== createCommentDto.userId) {
      const notificationBody = `${senderName} comentou no seu post no grupo ${post.group.name}`;

      await this.notificationService.createNotification({
        senderId: createCommentDto.userId,
        recipientId: post.userId,
        groupId: post.groupId,
        body: notificationBody,
        type: NotificationType.COMMENT,
        groupName: post.group.name,
        senderName: senderName,
        idContent: comment.id,
      });
    }

    return comment;
  }

  async remove(id: string, currentUserId: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGES.NOT_FOUND);
    }

    if (comment.userId !== currentUserId) {
      throw new ForbiddenException(COMMENT_MESSAGES.UNAUTHORIZED_DELETE);
    }

    return await this.prismaService.comment.delete({
      where: { id },
    });
  }
}
