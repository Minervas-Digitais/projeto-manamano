import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchFilter } from './search-filter.enum';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';
import { Group, Post, User } from '@prisma/client';
import { omitHash } from 'src/utils/user.util';
import { Prisma } from '@prisma/client';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchResult {
  users: Omit<User, 'hash'>[];
  groups: Group[];
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    users: PaginationMeta;
    groups: PaginationMeta;
    posts: PaginationMeta;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

const SEARCH_DEFAULT_LIMIT = 5;
const FILTER_DEFAULT_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}

  async search(createSearchDto: CreateSearchDto): Promise<SearchResult> {
    const page = createSearchDto.page ?? 1;
    const limit = createSearchDto.limit ?? SEARCH_DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

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
      users: users.map(omitHash),
      groups,
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
  ): Promise<PaginatedResult<Omit<User, 'hash'> | Group | Post>> {
    const page = createSearchDto.page ?? 1;
    const limit = createSearchDto.limit ?? FILTER_DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    switch (filter) {
      case SearchFilter.USERS: {
        const where = this.buildUserWhere(createSearchDto.input);
        const [users, total] = await Promise.all([
          this.prismaService.user.findMany({ where, skip, take: limit }),
          this.prismaService.user.count({ where }),
        ]);
        return {
          data: users.map(omitHash),
          meta: this.buildMeta(page, limit, total),
        };
      }
      case SearchFilter.GROUPS: {
        const where = this.buildGroupWhere(createSearchDto.input);
        const [groups, total] = await Promise.all([
          this.prismaService.group.findMany({ where, skip, take: limit }),
          this.prismaService.group.count({ where }),
        ]);
        return {
          data: groups,
          meta: this.buildMeta(page, limit, total),
        };
      }
      case SearchFilter.POSTS: {
        const where = this.buildPostWhere(createSearchDto.input);
        const [posts, total] = await Promise.all([
          this.prismaService.post.findMany({ where, skip, take: limit }),
          this.prismaService.post.count({ where }),
        ]);
        return {
          data: posts,
          meta: this.buildMeta(page, limit, total),
        };
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

  private buildMeta(page: number, limit: number, total: number): PaginationMeta {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    };
  }
}
