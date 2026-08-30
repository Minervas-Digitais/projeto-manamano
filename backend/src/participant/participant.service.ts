import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantRoleDto } from './dto/update-participant.dto';
import { Participant, RoleType, UserRole } from '@prisma/client';
import { PARTICIPANT_MESSAGES } from 'src/messages/participant.messages';
import { ValidatorService } from 'src/common/validators/validator.service';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';

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
      role: UserRole.STUDENT,
    };

    return await this.prismaService.participant.create({
      data: participantBody,
    });
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<Participant>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const maxLimit = 20;

    if (limit > maxLimit) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(maxLimit));
    }

    const [participants, total] = await Promise.all([
      this.prismaService.participant.findMany({
        skip,
        take: limit,
      }),
      this.prismaService.participant.count(),
    ]);

    if (participants.length === 0) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.EMPTY_GROUP);
    }
    return new PaginatedResponseDto(participants, total, pagination);
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

    const [commentCounts, participantCounts] = await Promise.all([
      this.prismaService.comment.groupBy({
        by: ['postId'],
        _count: true,
        where: { postId: { in: allPostIds } },
      }),
      this.prismaService.participant.groupBy({
        by: ['groupId'],
        _count: true,
        where: { groupId: { in: allGroupIds } },
      }),
    ]);

    const commentCountMap = new Map<string, number>(
      commentCounts.map((item) => [item.postId, item._count]),
    );

    const participantCountMap = new Map<string, number>(
      participantCounts.map((item) => [item.groupId, item._count]),
    );

    const groupsWithCounts: GroupWithDetails[] = groups.map((group) => {
      const postsWithCommentsCount: PostWithCommentsCount[] = group.group.posts.map((post) => ({
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
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 15;
    const skip = (page - 1) * limit;

    const maxLimit = 20;
    if (limit > maxLimit) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(maxLimit));
    }

    const userGroups = await this.prismaService.participant.findMany({
      where: { userId },
      select: {
        groupId: true,
        role: true,
        group: { select: { name: true } },
      },
    });

    if (userGroups.length === 0) {
      return new PaginatedResponseDto([], 0, { page, limit });
    }

    const groupIds = userGroups.map((g) => g.groupId);

    const [totalPosts, posts] = await Promise.all([
      this.prismaService.post.count({
        where: { groupId: { in: groupIds } },
      }),
      this.prismaService.post.findMany({
        where: { groupId: { in: groupIds } },
        select: {
          id: true,
          title: true,
          input: true,
          createdAt: true,
          groupId: true,
          user: { select: { id: true, fullName: true } },
          group: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const postsWithCommentsCount = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await this.prismaService.comment.count({
          where: { postId: post.id },
        });
        return { ...post, commentsCount };
      }),
    );

    return new PaginatedResponseDto(postsWithCommentsCount, totalPosts, { page, limit });
  }

  async findUsersInGroup(
    groupId: string,
    callerId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<UserInGroup>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const maxLimit = 20;
    if (limit > maxLimit) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(maxLimit));
    }

    const [callerUser, callerParticipant] = await Promise.all([
      this.validator.validateUserExists(callerId),
      this.prismaService.participant.findUnique({
        where: { userId_groupId: { userId: callerId, groupId } },
      }),
    ]);
    await this.validator.validateGroupExists(groupId);

    // Quem chamou a rota deve ser ou ADMIN ou deve pertencer ao grupo
    if (callerUser.sysRole != RoleType.ADMIN && !callerParticipant) {
      throw new ForbiddenException(PARTICIPANT_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    const [users, total] = await Promise.all([
      this.prismaService.participant.findMany({
        where: { groupId },
        select: {
          role: true,
          userId: true,
          user: { select: { fullName: true } },
        },
        skip,
        take: limit,
      }),
      this.prismaService.participant.count({ where: { groupId } }),
    ]);

    if (users.length === 0) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NO_USERS_IN_GROUP);
    }
    return new PaginatedResponseDto<UserInGroup>(users as UserInGroup[], total, pagination);
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
    callerId: string,
    targetUserId: string,
    groupId: string,
    updateParticipantDto: UpdateParticipantRoleDto,
  ): Promise<Participant> {
    await this.validator.validateGroupExists(groupId);
    await this.validator.validateUserExists(targetUserId);
    await this.findOne(targetUserId, groupId);
    const callerUser = await this.validator.validateUserExists(callerId);

    const callerParticipant = await this.prismaService.participant.findUnique({
      where: { userId_groupId: { userId: callerId, groupId } },
    });

    if (!callerParticipant) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NOT_FOUND);
    }

    const isAdmin = callerUser.sysRole === RoleType.ADMIN;
    const isInstructor = callerParticipant?.role === UserRole.INSTRUCTOR;

    // Quem chamou a rota deve ser ou ADMIN ou deve ser Instrutor do grupo
    if (!isAdmin && !isInstructor) {
      throw new ForbiddenException(PARTICIPANT_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    return await this.prismaService.participant.update({
      where: {
        userId_groupId: { userId: targetUserId, groupId },
      },
      data: updateParticipantDto,
    });
  }

  async removeSelf(userId: string, groupId: string): Promise<{ message: string }> {
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

    if (callerUser.sysRole != RoleType.ADMIN && callerParticipant.role != UserRole.INSTRUCTOR) {
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
