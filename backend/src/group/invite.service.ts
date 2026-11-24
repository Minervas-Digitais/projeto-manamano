import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Invite, Prisma, RoleType, UserRole } from '@prisma/client';
import { isUniqueViolation } from 'src/common/prisma/prisma-errors';
import { ValidatorService } from 'src/common/validators/validator.service';
import { INVITE_MESSAGES } from 'src/messages/invite.messages';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateInviteCode, INVITE_CODE_MAX_ATTEMPTS } from './invite-code.util';
import { INVITE_TTL_MS } from './invite.constants';

export interface RegeneratedInvite {
  code: string;
  role: UserRole;
  expiresAt: Date;
}

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  defaultExpiresAt(): Date {
    return new Date(Date.now() + INVITE_TTL_MS);
  }

  async createForGroup(
    tx: Prisma.TransactionClient,
    groupId: string,
    createdById?: string,
    code: string = generateInviteCode(),
  ): Promise<Invite> {
    return tx.invite.create({
      data: {
        code,
        groupId,
        role: UserRole.STUDENT,
        expiresAt: this.defaultExpiresAt(),
        createdById,
      },
    });
  }

  async findActive(groupId: string): Promise<Invite | null> {
    return this.prisma.invite.findFirst({
      where: {
        groupId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async regenerate(groupId: string, callerId: string): Promise<RegeneratedInvite> {
    await this.assertCanManage(groupId, callerId);

    for (let attempt = 0; attempt < INVITE_CODE_MAX_ATTEMPTS; attempt++) {
      try {
        const invite = await this.prisma.$transaction(async (tx) => {
          // Serializa regenerates concorrentes: sem isso, dois pedidos podem
          // revogar antes do commit um do outro e terminar com dois ativos.
          await tx.$queryRaw`SELECT "id" FROM "Group" WHERE "id" = ${groupId} FOR UPDATE`;

          await tx.invite.updateMany({
            where: { groupId, revokedAt: null },
            data: { revokedAt: new Date() },
          });

          const created = await this.createForGroup(tx, groupId, callerId);

          // Coluna legada mantida nesta fase para compatibilidade de leitura.
          await tx.group.update({
            where: { id: groupId },
            data: { inviteCode: created.code },
          });

          return created;
        });

        return { code: invite.code, role: invite.role, expiresAt: invite.expiresAt };
      } catch (error) {
        if (isUniqueViolation(error)) continue;

        throw error;
      }
    }

    throw new InternalServerErrorException(INVITE_MESSAGES.GENERATION_FAILED);
  }

  async revoke(groupId: string, callerId: string): Promise<{ revoked: boolean }> {
    await this.assertCanManage(groupId, callerId);

    return this.prisma.$transaction(async (tx) => {
      // Mesma ordem de lock do regenerate para não intercalar revoke/criação.
      await tx.$queryRaw`SELECT "id" FROM "Group" WHERE "id" = ${groupId} FOR UPDATE`;

      const { count } = await tx.invite.updateMany({
        where: { groupId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      return { revoked: count > 0 };
    });
  }

  async assertCanManage(groupId: string, callerId: string): Promise<void> {
    await this.validator.validateGroupExists(groupId);

    const caller = await this.prisma.user.findUnique({
      where: { id: callerId },
      select: { sysRole: true },
    });

    if (caller?.sysRole === RoleType.ADMIN) return;

    const participant = await this.prisma.participant.findUnique({
      where: { userId_groupId: { userId: callerId, groupId } },
    });

    if (!participant || participant.role !== UserRole.INSTRUCTOR) {
      throw new ForbiddenException(INVITE_MESSAGES.FORBIDDEN);
    }
  }
}
