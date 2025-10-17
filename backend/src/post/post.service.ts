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

  private serializePost(post: any) {
    const { user, category, Comment, ...rest } = post;
    return {
      ...rest,
      nameUser: user?.fullName,
      categoryName: category?.name,
      numComments: Comment?.length ?? 0,
      Comment,
    };
  }

  async create(createPostDto: CreatePostDto) {
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
      },
      'USER',
    );

    return post;
  }

  async findAll() {
    const posts = await this.findPosts();

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_LIST);
    }

    return posts.map(this.serializePost);
  }

  async findOne(id: string) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundException(POST_MESSAGES.NOT_FOUND);
    }

    return this.serializePost(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    await this.validatePostExists(id);
    return await this.prismaService.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: string) {
    await this.validatePostExists(id);
    return await this.prismaService.post.delete({
      where: { id },
    });
  }

  async savePost(ids: string) {
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

  async removeSavedPost(ids: string) {
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

  async pinPost(postId: string) {
    await this.validatePostExists(postId);
    return await this.prismaService.post.update({
      where: { id: postId },
      data: { isPinned: true },
    });
  }

  async unpinPost(postId: string) {
    await this.validatePostExists(postId);
    return await this.prismaService.post.update({
      where: { id: postId },
      data: { isPinned: false },
    });
  }

  async getPinnedPosts(groupId: string) {
    const posts = await this.findPosts({ groupId, isPinned: true });

    return posts.map(this.serializePost);
  }

  async getGroupPosts(groupId: string) {
    const posts = await this.findPosts({ groupId });

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_GROUP);
    }

    return posts.map(this.serializePost);
  }

  async getCategoryPosts(categoryId: string) {
    const posts = await this.findPosts({ categoryId });

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_CATEGORY);
    }

    return posts.map(this.serializePost);
  }

  async getUserPosts(userId: string) {
    const posts = await this.findPosts({ userId });

    if (posts.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_POST_IN_USER);
    }

    return posts.map(this.serializePost);
  }

  async getSavedPosts(userId: string, page = 1, pageSize = 10) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { savedPost: true },
    });

    if (!user || user.savedPost.length === 0) {
      throw new NotFoundException(POST_MESSAGES.NO_SAVED_POSTS);
    }

    const postIds = user.savedPost.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    const posts = await this.prismaService.post.findMany({
      where: { id: { in: postIds } },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    });

    return posts.map(this.serializePost);
  }
}
