import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Participant, UserRole } from '@prisma/client';
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
  ): Promise<Participant> {
    const group = await this.prismaService.group.findUnique({
      where: {
        inviteCode: createParticipantDto.inviteCode,
      },
    });

    if (!group) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.INVALID_INVITE_CODE);
    }

    await this.validator.validateUserExists(createParticipantDto.userId);

    const participant = await this.prismaService.participant.findUnique({
      where: {
        userId_groupId: {
          userId: createParticipantDto.userId,
          groupId: group.id,
        },
      },
    });

    if (participant) {
      throw new ConflictException(PARTICIPANT_MESSAGES.ALREADY_IN_GROUP);
    }

    const { userId, role } = createParticipantDto;

    const participantBody = {
      groupId: group.id,
      userId,
      role: role ?? UserRole.STUDENT,
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

  async findOne(id: string): Promise<Participant> {
    const participant = await this.prismaService.participant.findUnique({
      where: {
        userId_groupId: this.parseId(id),
      },
    });
    if (!participant) {
      throw new NotFoundException(PARTICIPANT_MESSAGES.NOT_FOUND);
    }
    return participant;
  }

  async update(
    id: string,
    updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    await this.findOne(id);
    return await this.prismaService.participant.update({
      where: {
        userId_groupId: this.parseId(id),
      },
      data: updateParticipantDto,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.prismaService.participant.delete({
      where: {
        userId_groupId: this.parseId(id),
      },
    });
    return { message: PARTICIPANT_MESSAGES.DELETE_SUCCESS };
  }
}
