import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchFilter } from './search-filter.enum';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';
import { Post } from '@prisma/client';
import { toPublicUser } from 'src/user/user.mapper';
import { GroupPublic } from 'src/group/group.types';
import { toPublicGroup } from 'src/group/group.mapper';
import { UserPublicFields } from 'src/user/user.types';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { BASE_MESSAGES } from 'src/messages/base.messages';

export interface SearchPaginationMeta {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface SearchResult {
  users: UserPublicFields[];
  groups: GroupPublic[];
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    users: SearchPaginationMeta;
    groups: SearchPaginationMeta;
    posts: SearchPaginationMeta;
  };
}

// Mantido para compatibilidade de tipagem legada, mas novo código deve usar PaginatedResponseDto
export interface PaginatedResult<T> {
  data: T[];
  meta: SearchPaginationMeta;
}

const SEARCH_DEFAULT_LIMIT = 5;
const FILTER_DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;

@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}

  async search(createSearchDto: CreateSearchDto, pagination: PaginationDto): Promise<SearchResult> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? SEARCH_DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    const userWhere = this.buildUserWhere(createSearchDto.input);
    const groupWhere = this.buildGroupWhere(createSearchDto.input);
    const postWhere = this.buildPostWhere(createSearchDto.input);

    const [users, groups, posts, totalUsers, totalGroups, totalPosts] = await Promise.all([
      this.prismaService.user.findMany({
        where: userWhere,
        skip,
        take: limit,
      }),
      this.prismaService.group.findMany({
        where: groupWhere,
        skip,
        take: limit,
      }),
      this.prismaService.post.findMany({
        where: postWhere,
        skip,
        take: limit,
      }),
      this.prismaService.user.count({ where: userWhere }),
      this.prismaService.group.count({ where: groupWhere }),
      this.prismaService.post.count({ where: postWhere }),
    ]);

    return {
      users: users.map(toPublicUser),
      groups: groups.map(toPublicGroup),
      posts,
      pagination: {
        page,
        limit,
        users: this.buildMeta(page, limit, totalUsers),
        groups: this.buildMeta(page, limit, totalGroups),
        posts: this.buildMeta(page, limit, totalPosts),
      },
    };
  }

  async searchByFilter(
    createSearchDto: CreateSearchDto,
    filter: SearchFilter,
    pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<UserPublicFields | GroupPublic | Post>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? FILTER_DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(BASE_MESSAGES.EXCEEDED_LIMIT(MAX_LIMIT));
    }

    switch (filter) {
      case SearchFilter.USERS: {
        const where = this.buildUserWhere(createSearchDto.input);
        const [users, total] = await Promise.all([
          this.prismaService.user.findMany({ where, skip, take: limit }),
          this.prismaService.user.count({ where }),
        ]);
        return new PaginatedResponseDto(users.map(toPublicUser), total, {
          page,
          limit,
        });
      }
      case SearchFilter.GROUPS: {
        const where = this.buildGroupWhere(createSearchDto.input);
        const [groups, total] = await Promise.all([
          this.prismaService.group.findMany({ where, skip, take: limit }),
          this.prismaService.group.count({ where }),
        ]);
        return new PaginatedResponseDto(groups.map(toPublicGroup), total, { page, limit });
      }
      case SearchFilter.POSTS: {
        const where = this.buildPostWhere(createSearchDto.input);
        const [posts, total] = await Promise.all([
          this.prismaService.post.findMany({ where, skip, take: limit }),
          this.prismaService.post.count({ where }),
        ]);
        return new PaginatedResponseDto(posts, total, { page, limit });
      }
      default:
        throw new BadRequestException(SEARCH_MESSAGES.INVALID_FILTER);
    }
  }

  private buildUserWhere(input: string): Prisma.UserWhereInput {
    return {
      fullName: {
        contains: input,
        mode: 'insensitive',
      },
    };
  }

  private buildGroupWhere(input: string): Prisma.GroupWhereInput {
    return {
      name: {
        contains: input,
        mode: 'insensitive',
      },
    };
  }

  private buildPostWhere(input: string): Prisma.PostWhereInput {
    return {
      OR: [
        {
          title: {
            contains: input,
            mode: 'insensitive',
          },
        },
        {
          input: {
            contains: input,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  private buildMeta(page: number, limit: number, total: number): SearchPaginationMeta {
    return {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }
}
