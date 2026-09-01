import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, PostType, Prisma, User, UserRole } from '@prisma/client';
import { POST_MESSAGES } from '../messages/post.messages';
import { omitHash } from 'src/utils/user.util';
import { ValidatorService } from 'src/common/validators/validator.service';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';

const MAX_LIMIT = 20;
const DEFAULT_POST_LIMIT = 10;

const postInclude: Prisma.PostInclude = {
  Comment: {
    include: {
      user: {
        select: {
          fullName: true,
          id: true,
        },
      },
    },
  },
  category: {
    select: {
      name: true,
    },
  },
  user: {
    select: {
      fullName: true,
    },
  },
};

export interface SerializedPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  groupId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  nameUser?: string;
  categoryName?: string;
  numComments?: number;
  Comment?: any[];
  type: PostType;
  schedule?: Date;
  urlLive?: string;
}

@Injectable()
export class PostService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
    private readonly validator: ValidatorService,
  ) {}

  private async findPosts(where?: Prisma.PostWhereInput) {
    const posts = await this.prismaService.post.findMany({
      where,
      include: postInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  }

  private serializePost(post: any): SerializedPost {
    const { user, category, Comment, type, schedule, urlLive, ...rest } = post;

    return {
      ...rest,
      nameUser: user?.fullName,
      categoryName: category?.name,
      numComments: Comment?.length ?? 0,
      Comment,
      type,
      schedule,
      urlLive,
    };
  }

  async create(createPostDto: CreatePostDto, userId: string): Promise<SerializedPost> {
    const group = await this.validator.validateGroupExists(createPostDto.groupId);

    await this.validator.validateUserExists(userId);

    const post = await this.prismaService.post.create({
      data: {
        ...createPostDto,
        userId,
      },
      include: {
        user: true,
      },
    });

    const notificationBody = `Novo post em ${group.name}`;

    await this.notificationService.createNotification(
      {
        recipientId: undefined,
        groupId: createPostDto.groupId,
        body: notificationBody,
        type: NotificationType.FIXED,
        groupName: group.name,
        senderName: post.user.fullName,
        idContent: post.id,
      },
      userId,
    );

    return this.serializePost(post);
  }

  async findAll(): Promise<SerializedPost[]> {
    const posts = await this.findPosts();

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_LIST);
    }

    return posts.map(this.serializePost);
  }

  async findOne(id: string): Promise<SerializedPost> {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundException(POST_MESSAGES.NOT_FOUND);
    }

    return this.serializePost(post);
  }

  async update(
    callerId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<SerializedPost> {
    const existing = await this.validator.validatePostExists(postId);

    const groupIdToCheck = existing.groupId;

    const callerParticipant = await this.prismaService.participant.findFirst({
      where: {
        userId: callerId,
        groupId: groupIdToCheck,
      },
    });

    if (!callerParticipant || callerParticipant.role !== UserRole.INSTRUCTOR) {
      throw new ForbiddenException(POST_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    const updated = await this.prismaService.post.update({
      where: { id: postId },
      data: updatePostDto,
      include: postInclude,
    });
    return this.serializePost(updated);
  }

  async remove(callerId: string, postId: string): Promise<SerializedPost> {
    const postData = await this.validator.validatePostExists(postId);

    const callerParticipant = await this.prismaService.participant.findFirst({
      where: {
        userId: callerId,
        groupId: postData.groupId,
      },
    });

    if (!callerParticipant || callerParticipant.role !== UserRole.INSTRUCTOR) {
      throw new ForbiddenException(POST_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    const deleted = await this.prismaService.post.delete({
      where: { id: postId },
      include: postInclude,
    });
    return this.serializePost(deleted);
  }

  async savePost(userId: string, postId: string): Promise<Omit<User, 'hash'>> {
    const user = await this.validator.validateUserExists(userId);
    const post = await this.validator.validatePostExists(postId);

    if (post.userId === userId) {
      throw new ForbiddenException(POST_MESSAGES.CANNOT_SAVE_OWN);
    }

    if (user.savedPost.includes(postId)) {
      throw new ConflictException(POST_MESSAGES.ALREADY_SAVED);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        savedPost: {
          push: postId,
        },
      },
    });

    return omitHash(updatedUser);
  }

  async removeSavedPost(userId: string, postId: string): Promise<Omit<User, 'hash'>> {
    const user = await this.validator.validateUserExists(userId);
    await this.validator.validatePostExists(postId);

    if (!user.savedPost.includes(postId)) {
      throw new NotFoundException(POST_MESSAGES.POST_NOT_SAVED);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        savedPost: user.savedPost.filter((id) => id !== postId),
      },
    });

    return omitHash(updatedUser);
  }

  async setPinStatus(postId: string, pinned: boolean): Promise<SerializedPost> {
    const post = await this.validator.validatePostExists(postId);

    if (post.isPinned === pinned) {
      throw new NotFoundException(POST_MESSAGES.POST_PINNED_STATUS_UNCHANGED);
    }

    const updatedPost = await this.prismaService.post.update({
      where: { id: postId },
      data: { isPinned: pinned },
      include: postInclude,
    });
    return this.serializePost(updatedPost);
  }

  async getPinnedPosts(groupId: string): Promise<SerializedPost[]> {
    const posts = await this.findPosts({ groupId, isPinned: true });

    return posts.map(this.serializePost);
  }

  async getGroupPosts(
    groupId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? DEFAULT_POST_LIMIT;
    const skip = (page - 1) * limit;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: { groupId },
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.post.count({ where: { groupId } }),
    ]);

    return new PaginatedResponseDto(posts.map(this.serializePost), total, { page, limit });
  }

  async getCategoryPosts(
    categoryId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? DEFAULT_POST_LIMIT;
    const skip = (page - 1) * limit;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: { categoryId },
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.post.count({ where: { categoryId } }),
    ]);

    return new PaginatedResponseDto(posts.map(this.serializePost), total, { page, limit });
  }

  async getUserPosts(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? DEFAULT_POST_LIMIT;
    const skip = (page - 1) * limit;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: { userId },
        include: postInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.post.count({ where: { userId } }),
    ]);

    return new PaginatedResponseDto(posts.map(this.serializePost), total, { page, limit });
  }

  async getSavedPosts(
    userId: string,
    pagination: PaginationDto,
    all = false,
  ): Promise<PaginatedResponseDto<SerializedPost> | SerializedPost[]> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { savedPost: true },
    });

    if (!user) {
      throw new NotFoundException(POST_MESSAGES.USER_NOT_FOUND);
    }

    if (all) {
      if (user.savedPost.length === 0) {
        return [];
      }
      const posts = await this.prismaService.post.findMany({
        where: { id: { in: user.savedPost } },
        include: postInclude,
        orderBy: { createdAt: 'desc' },
      });
      return posts.map(this.serializePost);
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? DEFAULT_POST_LIMIT;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    const total = user.savedPost.length;
    const paginatedIds = user.savedPost.slice((page - 1) * limit, page * limit);

    if (paginatedIds.length === 0) {
      return new PaginatedResponseDto([], total, { page, limit });
    }

    const posts = await this.prismaService.post.findMany({
      where: { id: { in: paginatedIds } },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });

    const ordered = paginatedIds.map((id) => posts.find((p) => p.id === id)).filter(Boolean);

    return new PaginatedResponseDto((ordered as any[]).map(this.serializePost), total, {
      page,
      limit,
    });
  }
}
