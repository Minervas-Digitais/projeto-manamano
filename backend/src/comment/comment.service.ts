import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService, private notificationService: NotificationService) {}
  async create(createCommentDto: CreateCommentDto) {
  try {
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

    const sender = await this.prismaService.user.findUnique({
      where: { id: createCommentDto.userId },
      select: { fullName: true },
    });

    if (post?.userId && post.userId !== createCommentDto.userId) {
      const notificationBody = `${sender?.fullName ?? 'Alguém'} comentou no seu post no grupo ${post.group?.name ?? 'desconhecido'}`;

      await this.notificationService.createNotification({
        senderId: createCommentDto.userId,
        recipientId: post.userId, 
        groupId: post.groupId,
        body: notificationBody,
        type: NotificationType.COMMENT,
        groupName: post.group?.name,
        senderName: sender?.fullName ?? 'Usuário desconhecido',
        idContent: comment.id,
      }, 'USER');
    }

    return comment;
    } catch (error) {
        throw error;
    }
  }

  async remove(id: string) {
    try {
      const comment = await this.prismaService.comment.findUnique({
        where: { id },
      });
      if (!comment) {
        throw new NotFoundException('Comentário não encontrado.');
      }
      return await this.prismaService.comment.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
