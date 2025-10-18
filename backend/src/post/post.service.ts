import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, Prisma } from '@prisma/client';
import { POST_MESSAGES } from '../messages/post.messages';

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
}

@Injectable()
export class PostService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
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

  private async validatePostExists(id: string) {
    const exists = await this.prismaService.post.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(POST_MESSAGES.NOT_FOUND);
    }
  }

  private serializePost(post: any): SerializedPost {
    const { user, category, Comment, ...rest } = post;
    return {
      ...rest,
      nameUser: user?.fullName,
      categoryName: category?.name,
      numComments: Comment?.length ?? 0,
      Comment,
    };
  }

  async create(createPostDto: CreatePostDto): Promise<SerializedPost> {
    const post = await this.prismaService.post.create({
      data: createPostDto,
    });

    const group = await this.prismaService.group.findUnique({
      where: { id: createPostDto.groupId },
    });

    const senderUser = await this.prismaService.user.findUnique({
      where: { id: createPostDto.userId },
    });

    const notificationBody = `Novo post em ${group?.name ?? 'desconhecido'}`;

    await this.notificationService.createNotification(
      {
        senderId: createPostDto.userId,
        recipientId: undefined,
        groupId: createPostDto.groupId,
        body: notificationBody,
        type: NotificationType.FIXED,
        groupName: group?.name ?? null,
        senderName: senderUser?.fullName ?? null,
        idContent: post.id,
      }
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
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<SerializedPost> {
    await this.validatePostExists(id);
    const updated = await this.prismaService.post.update({
      where: { id },
      data: updatePostDto,
      include: postInclude,
    });
    return this.serializePost(updated);
  }

  async remove(id: string): Promise<SerializedPost> {
    await this.validatePostExists(id);
    const deleted = await this.prismaService.post.delete({
      where: { id },
      include: postInclude,
    });
    return this.serializePost(deleted);
  }

  async savePost(ids: string): Promise<any> {
    const [postId, userId] = ids.split(',');
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(POST_MESSAGES.USER_NOT_FOUND);
    }

    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (post.userId === userId) {
      throw new NotFoundException(POST_MESSAGES.CANNOT_SAVE_OWN);
    }

    return await this.prismaService.user.update({
      where: { id: userId },
      data: {
        savedPost: [...user.savedPost, postId],
      },
    });
  }

  async removeSavedPost(ids: string): Promise<any> {
    const [postId, userId] = ids.split(',');
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(POST_MESSAGES.USER_NOT_FOUND);
    }
    return await this.prismaService.user.update({
      where: { id: userId },
      data: {
        savedPost: user.savedPost.filter((id) => id !== postId),
      },
    });
  }

  async pinPost(postId: string): Promise<SerializedPost> {
    await this.validatePostExists(postId);
    const post = await this.prismaService.post.update({
      where: { id: postId },
      data: { isPinned: true },
      include: postInclude,
    });
    return this.serializePost(post);
  }

  async unpinPost(postId: string): Promise<SerializedPost> {
    await this.validatePostExists(postId);
    const post = await this.prismaService.post.update({
      where: { id: postId },
      data: { isPinned: false },
      include: postInclude,
    });
    return this.serializePost(post);
  }

  async getPinnedPosts(groupId: string): Promise<SerializedPost[]> {
    const posts = await this.findPosts({ groupId, isPinned: true });

    return posts.map(this.serializePost);
  }

  async getGroupPosts(groupId: string): Promise<SerializedPost[]> {
    const posts = await this.findPosts({ groupId });

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_GROUP);
    }

    return posts.map(this.serializePost);
  }

  async getCategoryPosts(categoryId: string): Promise<SerializedPost[]> {
    const posts = await this.findPosts({ categoryId });

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_CATEGORY);
    }

    return posts.map(this.serializePost);
  }

  async getUserPosts(userId: string): Promise<SerializedPost[]> {
    const posts = await this.findPosts({ userId });

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_USER);
    }

    return posts.map(this.serializePost);
  }

  async getSavedPosts(
    userId: string,
    page = 1,
    pageSize = 10,
    all = false,
  ): Promise<SerializedPost[]> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { savedPost: true },
    });

    if (!user || user.savedPost.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_SAVED_POSTS);
    }

    const postIds = all
      ? user.savedPost
      : user.savedPost.slice((page - 1) * pageSize, page * pageSize);

    const posts = await this.prismaService.post.findMany({
      where: { id: { in: postIds } },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });

    return posts.map(this.serializePost);
  }
}
