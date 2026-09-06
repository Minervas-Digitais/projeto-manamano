import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidatorService } from 'src/common/validators/validator.service';
import { POST_MESSAGES } from 'src/messages/post.messages';
import { SerializedPost, postInclude } from 'src/post/post.service';

@Injectable()
export class SavedPostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

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

  async savePost(userId: string, postId: string) {
    await this.validator.validateUserExists(userId);
    const post = await this.validator.validatePostExists(postId);

    if (post.userId === userId) {
      throw new ForbiddenException(POST_MESSAGES.CANNOT_SAVE_OWN);
    }

    const savedPost = await this.prismaService.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (savedPost) {
      throw new ConflictException(POST_MESSAGES.ALREADY_SAVED);
    }

    return this.prismaService.savedPost.create({
      data: {
        userId,
        postId,
      },
    });
  }

  async removeSavedPost(userId: string, postId: string) {
    await this.validator.validateUserExists(userId);
    await this.validator.validatePostExists(postId);

    const savedPost = await this.prismaService.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!savedPost) {
      throw new NotFoundException(POST_MESSAGES.POST_NOT_SAVED);
    }

    return this.prismaService.savedPost.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async getSavedPosts(
    userId: string,
    page = 1,
    pageSize = 10,
    all = false,
  ): Promise<SerializedPost[]> {
    await this.validator.validateUserExists(userId);

    const savedPosts = await this.prismaService.savedPost.findMany({
      where: {
        userId,
      },
      include: {
        post: {
          include: postInclude,
        },
      },
      orderBy: {
        savedAt: 'desc',
      },
      ...(all
        ? {}
        : {
            skip: (page - 1) * pageSize,
            take: pageSize,
          }),
    });

    return savedPosts.map((savedPost) => this.serializePost(savedPost.post));
  }
}
