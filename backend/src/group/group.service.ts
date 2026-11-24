import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group, PostType, RoleType, UserRole } from '@prisma/client';
import { GROUP_MESSAGES } from 'src/messages/group.messages';
import { INVITE_MESSAGES } from 'src/messages/invite.messages';
import { ValidatorService } from 'src/common/validators/validator.service';
import { isUniqueViolation } from 'src/common/prisma/prisma-errors';
import { GroupPublic, GroupWithInvite } from './group.types';
import { toPublicGroup } from './group.mapper';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { generateInviteCode, INVITE_CODE_MAX_ATTEMPTS } from './invite-code.util';
import { InviteService } from './invite.service';

const defaultCategories = [
  { name: 'Geral', type: PostType.NORMAL },
  { name: 'Avisos', type: PostType.NORMAL },
  { name: 'Eventos', type: PostType.EVENT },
  { name: 'Aulas', type: PostType.CLASS },
];

@Injectable()
export class GroupService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
    private readonly inviteService: InviteService,
  ) {}

  async create(createGroupDto: CreateGroupDto, callerId: string): Promise<GroupWithInvite> {
    // Campo aceito por compatibilidade com clientes antigos, mas ignorado:
    // o código é sempre gerado pelo servidor.
    const { inviteCode: legacyInviteCode, ...groupData } = createGroupDto;
    void legacyInviteCode;

    for (let attempt = 0; attempt < INVITE_CODE_MAX_ATTEMPTS; attempt++) {
      try {
        return await this.prismaService.$transaction(async (prisma) => {
          const code = generateInviteCode();

          // A coluna legada continua obrigatória nesta fase (migration B a remove).
          const group = await prisma.group.create({
            data: {
              ...groupData,
              inviteCode: code,
            },
          });

          await prisma.participant.create({
            data: {
              groupId: group.id,
              userId: callerId,
              role: UserRole.INSTRUCTOR,
            },
          });

          await prisma.category.createMany({
            data: defaultCategories.map((cat) => ({
              ...cat,
              groupId: group.id,
            })),
          });

          const invite = await this.inviteService.createForGroup(prisma, group.id, callerId, code);

          return {
            ...group,
            inviteCode: invite.code,
            inviteExpiresAt: invite.expiresAt,
          };
        });
      } catch (error) {
        if (isUniqueViolation(error)) continue;

        throw error;
      }
    }

    throw new InternalServerErrorException(INVITE_MESSAGES.GENERATION_FAILED);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<Group>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const maxLimit = 20;

    if (limit > maxLimit) {
      throw new BadRequestException(GROUP_MESSAGES.EXCEEDED_LIMIT(maxLimit));
    }

    const [groups, total] = await Promise.all([
      this.prismaService.group.findMany({
        skip,
        take: limit,
      }),
      this.prismaService.group.count(),
    ]);

    return new PaginatedResponseDto<Group>(groups, total, pagination);
  }

  async findOne(groupId: string, callerId: string): Promise<GroupWithInvite | GroupPublic> {
    const group = await this.validator.validateGroupExists(groupId);

    const [caller, participant, activeInvite] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { id: callerId },
        select: { sysRole: true },
      }),
      this.prismaService.participant.findUnique({
        where: { userId_groupId: { userId: callerId, groupId } },
      }),
      this.inviteService.findActive(groupId),
    ]);

    const isAdmin = caller?.sysRole === RoleType.ADMIN;

    // O código de convite só é revelado para membros do grupo ou administradores.
    if (isAdmin || participant) {
      return {
        ...toPublicGroup(group),
        inviteCode: activeInvite?.code ?? null,
        inviteExpiresAt: activeInvite?.expiresAt ?? null,
      };
    }

    return toPublicGroup(group);
  }

  async update(groupId: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    await this.validator.validateGroupExists(groupId);
    return await this.prismaService.group.update({
      where: {
        id: groupId,
      },
      data: updateGroupDto,
    });
  }

  async remove(groupId: string): Promise<{ message: string }> {
    await this.validator.validateGroupExists(groupId);

    await this.prismaService.group.delete({
      where: {
        id: groupId,
      },
    });
    return { message: GROUP_MESSAGES.DELETE_SUCCESS };
  }
}
