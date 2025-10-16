import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Participant, UserRole } from '@prisma/client';
import { PARTICIPANT_MESSAGES } from 'src/messages/participant.messages';

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
  constructor(private prismaService: PrismaService) {}

  private parseId(id: string): UserGroupId {
    const [userId, groupId] = id.split(',');
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
      throw new NotFoundException(PARTICIPANT_MESSAGES.GROUP_NOT_FOUND);
    }

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

    const allPosts = groups.flatMap((g) => g.group.posts);
    const allPostIds = allPosts.map((p) => p.id);

    const commentCounts = await this.prismaService.comment.groupBy({
      by: ['postId'],
      _count: true,
      where: {
        postId: {
          in: allPostIds,
        },
      },
    });

    const commentCountMap = new Map(
      commentCounts.map((item) => [item.postId, item._count]),
    );

    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const participantCount = await this.prismaService.participant.count({
          where: { groupId: group.groupId },
        });

        const postsWithCommentsCount = group.group.posts.map((post) => ({
          ...post,
          commentsCount: commentCountMap.get(post.id) || 0,
        }));

        return {
          ...group,
          participantCount,
          group: {
            ...group.group,
            posts: postsWithCommentsCount,
          },
        };
      }),
    );

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
