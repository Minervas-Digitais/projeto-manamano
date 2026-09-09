import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidatorService } from 'src/common/validators/validator.service';
import { POST_MESSAGES } from 'src/messages/post.messages';
import { SerializedPost, postInclude } from 'src/post/post.service';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';

const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 10;

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

  async savePost(userId: string, dto: CreateSavedPostDto) {
    await this.validator.validateUserExists(userId);
    const post = await this.validator.validatePostExists(dto.postId);

    if (post.userId === userId) {
      throw new ForbiddenException(POST_MESSAGES.CANNOT_SAVE_OWN);
    }

    const savedPost = await this.prismaService.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: dto.postId,
        },
      },
    });

    if (savedPost) {
      throw new ConflictException(POST_MESSAGES.ALREADY_SAVED);
    }

    return this.prismaService.savedPost.create({
      data: {
        userId,
        postId: dto.postId,
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
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    await this.validator.validateUserExists(userId);

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? DEFAULT_LIMIT;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    const [savedPosts, total] = await Promise.all([
      this.prismaService.savedPost.findMany({
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.savedPost.count({
        where: {
          userId,
        },
      }),
    ]);

    return new PaginatedResponseDto(
      savedPosts.map((savedPost) => this.serializePost(savedPost.post)),
      total,
      { page, limit },
    );
  }
}
