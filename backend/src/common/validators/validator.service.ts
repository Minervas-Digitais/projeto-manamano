import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NOTIFICATION_MESSAGES } from 'src/messages/notification.messages';
import { COMMENT_MESSAGES } from 'src/messages/comment.messages';
import { GROUP_MESSAGES } from 'src/messages/group.messages';
import { POST_MESSAGES } from 'src/messages/post.messages';
import { RoleType } from '@prisma/client';

@Injectable()
export class ValidatorService {
  constructor(private readonly prisma: PrismaService) {}

  async validateUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(NOTIFICATION_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  /**
   * Garante que o usuário pode acessar o conteúdo de um grupo. Administradores
   * do sistema têm acesso irrestrito; os demais precisam ser participantes.
   */
  async ensureGroupAccess(groupId: string, userId: string): Promise<void> {
    const [user, participant] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { sysRole: true },
      }),
      this.prisma.participant.findUnique({
        where: { userId_groupId: { userId, groupId } },
        select: { userId: true },
      }),
    ]);

    if (!user) throw new NotFoundException(NOTIFICATION_MESSAGES.USER_NOT_FOUND);

    if (user.sysRole === RoleType.ADMIN || participant) return;

    throw new ForbiddenException(GROUP_MESSAGES.UNAUTHORIZED_ACCESS);
  }

  /**
   * Retorna os grupos acessíveis pelo usuário. Administradores acessam todos
   * (isAdmin = true); os demais apenas os grupos em que são participantes.
   */
  async getAccessibleGroupIds(userId: string): Promise<{ isAdmin: boolean; groupIds: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { sysRole: true },
    });

    if (!user) throw new NotFoundException(NOTIFICATION_MESSAGES.USER_NOT_FOUND);

    if (user.sysRole === RoleType.ADMIN) {
      return { isAdmin: true, groupIds: [] };
    }

    const participants = await this.prisma.participant.findMany({
      where: { userId },
      select: { groupId: true },
    });

    return { isAdmin: false, groupIds: participants.map((participant) => participant.groupId) };
  }

  async validateGroupExists(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException(GROUP_MESSAGES.NOT_FOUND);
    return group;
  }

  async validatePostExists(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException(POST_MESSAGES.NOT_FOUND);
    return post;
  }

  async validateCommentExists(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException(COMMENT_MESSAGES.NOT_FOUND);
    return comment;
  }

  async validateNotificationExists(notificationId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notif) throw new NotFoundException(NOTIFICATION_MESSAGES.NOT_FOUND);
    return notif;
  }

  async ensureUserIsNotificationRecipient(notifId: string, userId: string) {
    const notification = await this.validateNotificationExists(notifId);

    if (notification.recipientId !== userId) {
      throw new ForbiddenException(NOTIFICATION_MESSAGES.UNAUTHORIZED_NOTIF_UPDATE);
    }
  }

  async ensureUserIsNotificationSender(notificationId: string, userId: string) {
    const notification = await this.validateNotificationExists(notificationId);

    if (notification.senderId !== userId) {
      throw new ForbiddenException(NOTIFICATION_MESSAGES.UNAUTHORIZED_NOTIF_UPDATE);
    }
  }
}
