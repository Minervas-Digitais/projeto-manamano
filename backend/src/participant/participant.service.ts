import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Participant, RoleType, UserRole } from '@prisma/client';
import { PARTICIPANT_MESSAGES } from 'src/messages/participant.messages';
import { ValidatorService } from 'src/common/validators/validator.service';

export interface PostWithCommentsCount {
  id: string;
  title: string;
  input: string;
  createdAt: Date;
  user: { fullName: string };
  commentsCount: number;
}

export interface GroupWithDetails {
  role: UserRole;
  groupId: string;
  participantCount: number;
  group: {
    name: string;
    posts: PostWithCommentsCount[];
  };
}

export interface UserInGroup {
  role: UserRole;
  userId: string;
  user: {
    fullName: string;
  };
}

interface UserGroupId {
  userId: string;
  groupId: string;
}

@Injectable()
export class ParticipantService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  private parseId(id: string): UserGroupId {
    const [userId, groupId] = id.split(',');

    if (!userId || !groupId) {
      throw new BadRequestException(PARTICIPANT_MESSAGES.INVALID_ID_FORMAT);
    }

    return { userId, groupId };
  }

  async joinGroupWithInvite(
    createParticipantDto: CreateParticipantDto,
    userId: string,
  ): Promise<Participant> {
    const group = await this.prismaService.group.findUnique({
      where: {
        inviteCode: createParticipantDto.inviteCode,
      },
    });

    if (!group) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.INVALID_INVITE_CODE);
    }

    await this.validator.validateUserExists(userId);

    const participant = await this.prismaService.participant.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: group.id,
        },
      },
    });

    if (participant) {
      throw new ConflictException(PARTICIPANT_MESSAGES.ALREADY_IN_GROUP);
    }

    const participantBody = {
      groupId: group.id,
      userId,
      role: createParticipantDto.role ?? UserRole.STUDENT,
    };

    return await this.prismaService.participant.create({
      data: participantBody,
    });
  }

  async findAll(): Promise<Participant[]> {
    const participants = await this.prismaService.participant.findMany();
    if (participants.length === 0) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.EMPTY_GROUP);
    }
    return participants;
  }

  async findUserGroups(userId: string): Promise<GroupWithDetails[]> {
    const groups = await this.prismaService.participant.findMany({
      where: { userId },
      select: {
        role: true,
        groupId: true,
        group: {
          select: {
            name: true,
            posts: {
              select: {
                id: true,
                title: true,
                input: true,
                createdAt: true,
                user: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (groups.length === 0) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NOT_IN_GROUPS);
    }

    const allPostIds = groups.flatMap((g) => g.group.posts.map((p) => p.id));
    const allGroupIds = groups.map((g) => g.groupId);

    const commentCounts = await this.prismaService.comment.groupBy({
      by: ['postId'],
      _count: true,
      where: {
        postId: {
          in: allPostIds,
        },
      },
    });

    const commentCountMap = new Map<string, number>(
      commentCounts.map((item) => [item.postId, item._count]),
    );

    const participantCounts = await this.prismaService.participant.groupBy({
      by: ['groupId'],
      _count: true,
      where: {
        groupId: {
          in: allGroupIds,
        },
      },
    });

    const participantCountMap = new Map<string, number>(
      participantCounts.map((item) => [item.groupId, item._count]),
    );

    const groupsWithCounts: GroupWithDetails[] = groups.map((group) => {
      const postsWithCommentsCount: PostWithCommentsCount[] =
        group.group.posts.map((post) => ({
          ...post,
          commentsCount: commentCountMap.get(post.id) || 0,
        }));

      return {
        role: group.role,
        groupId: group.groupId,
        participantCount: participantCountMap.get(group.groupId) || 0,
        group: {
          name: group.group.name,
          posts: postsWithCommentsCount,
        },
      };
    });

    return groupsWithCounts;
  }

  async findUserGroupsPostsPaginated(
    userId: string,
    page: number = 1,
    limit: number = 15,
  ) {
    try {
      // Buscar os grupos do usuário (sem posts)
      const userGroups = await this.prismaService.participant.findMany({
        where: { userId },
        select: {
          groupId: true,
          role: true,
          group: {
            select: {
              name: true,
            },
          },
        },
      });

      if (userGroups.length === 0) {
        return {
          posts: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        };
      }

      const groupIds = userGroups.map((group) => group.groupId);

      // Contar total de posts nos grupos do usuário
      const totalPosts = await this.prismaService.post.count({
        where: {
          groupId: {
            in: groupIds,
          },
        },
      });

      // Buscar posts paginados com suas informações
      const posts = await this.prismaService.post.findMany({
        where: {
          groupId: {
            in: groupIds,
          },
        },
        select: {
          id: true,
          title: true,
          input: true,
          createdAt: true,
          groupId: true,
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          group: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Adicionar contagem de comentários para cada post
      const postsWithCommentsCount = await Promise.all(
        posts.map(async (post) => {
          const commentsCount = await this.prismaService.comment.count({
            where: { postId: post.id },
          });
          return {
            ...post,
            commentsCount,
          };
        }),
      );

      const totalPages = Math.ceil(totalPosts / limit);

      return {
        posts: postsWithCommentsCount,
        pagination: {
          page,
          limit,
          total: totalPosts,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async findUsersInGroup(groupId: string): Promise<UserInGroup[]> {
    const users = await this.prismaService.participant.findMany({
      where: {
        groupId,
      },
      select: {
        role: true,
        userId: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });
    if (users.length === 0) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NO_USERS_IN_GROUP);
    }
    return users;
  }

  async findOne(userId: string, groupId: string): Promise<Participant> {
    const participant = await this.prismaService.participant.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });
    if (!participant) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NOT_FOUND);
    }
    return participant;
  }

  async update(
    userId: string,
    groupId: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    await this.findOne(userId, groupId);
    return await this.prismaService.participant.update({
      where: {
        userId_groupId: { userId, groupId },
      },
      data: updateParticipantDto,
    });
  }

  async removeSelf(
    userId: string,
    groupId: string,
  ): Promise<{ message: string }> {
    await this.findOne(userId, groupId);
    await this.prismaService.participant.delete({
      where: {
        userId_groupId: { userId, groupId },
      },
    });
    return { message: PARTICIPANT_MESSAGES.DELETE_SUCCESS };
  }

  async removeUser(callerId: string, targetId: string, groupId: string) {
    await this.findOne(targetId, groupId);

    const callerUser = await this.prismaService.user.findUnique({
      where: { id: callerId },
    });

    if (!callerUser) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.USER_NOT_FOUND);
    }

    const callerParticipant = await this.prismaService.participant.findUnique({
      where: { userId_groupId: { userId: callerUser.id, groupId } },
    });

    if (!callerParticipant) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NOT_FOUND);
    }

    if (
      callerUser.sysRole != RoleType.ADMIN &&
      callerParticipant.role != UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException(PARTICIPANT_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    await this.prismaService.participant.delete({
      where: {
        userId_groupId: { userId: targetId, groupId },
      },
    });

    return { message: PARTICIPANT_MESSAGES.DELETE_SUCCESS };
  }
}
