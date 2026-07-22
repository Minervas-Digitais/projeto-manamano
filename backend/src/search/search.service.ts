import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchFilter } from './search-filter.enum';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';
import { Group, Post, User } from '@prisma/client';
import { omitHash } from 'src/utils/user.util';

@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}

  async search(createSearchDto: CreateSearchDto) {
    const { input = '', page = 1, limit = 10 } = createSearchDto;
    const skip = (page - 1) * limit;

    const [users, groups, posts, totalUsers, totalGroups, totalPosts] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          fullName: {
            contains: input,
            mode: 'insensitive',
          },
        },
        skip,
        take: Number(limit),
      }),
      this.prismaService.group.findMany({
        where: {
          name: {
            contains: input,
            mode: 'insensitive',
          },
        },
        skip,
        take: Number(limit),
      }),
      this.prismaService.post.findMany({
        where: {
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
        },
        skip,
        take: Number(limit),
      }),
      this.prismaService.user.count({
        where: { fullName: { contains: input, mode: 'insensitive' } },
      }),
      this.prismaService.group.count({
        where: { name: { contains: input, mode: 'insensitive' } },
      }),
      this.prismaService.post.count({
        where: {
          OR: [
            { title: { contains: input, mode: 'insensitive' } },
            { input: { contains: input, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const total = totalUsers + totalGroups + totalPosts;

    return {
      data: {
        users: users.map(omitHash),
        groups,
        posts,
      },
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchByFilter(createSearchDto: CreateSearchDto, filter: SearchFilter) {
    const { input = '', page = 1, limit = 10 } = createSearchDto;
    const skip = (page - 1) * limit;

    let data: Omit<User, 'hash'>[] | Group[] | Post[];
    let total = 0;

    switch (filter) {
      case SearchFilter.USERS:
        const [users, totalUsersCount] = await Promise.all([
          this.prismaService.user.findMany({
            where: {
              fullName: { contains: input, mode: 'insensitive' },
            },
            skip,
            take: Number(limit),
          }),
          this.prismaService.user.count({
            where: { fullName: { contains: input, mode: 'insensitive' } },
          }),
        ]);
        data = users.map(omitHash);
        total = totalUsersCount;
        break;

      case SearchFilter.GROUPS:
        const [groups, totalGroupsCount] = await Promise.all([
          this.prismaService.group.findMany({
            where: {
              name: { contains: input, mode: 'insensitive' },
            },
            skip,
            take: Number(limit),
          }),
          this.prismaService.group.count({
            where: { name: { contains: input, mode: 'insensitive' } },
          }),
        ]);
        data = groups;
        total = totalGroupsCount;
        break;

      case SearchFilter.POSTS:
        const wherePost = {
          OR: [
            { title: { contains: input, mode: 'insensitive' as const } },
            { input: { contains: input, mode: 'insensitive' as const } },
          ],
        };
        const [posts, totalPostsCount] = await Promise.all([
          this.prismaService.post.findMany({
            where: wherePost,
            skip,
            take: Number(limit),
          }),
          this.prismaService.post.count({ where: wherePost }),
        ]);
        data = posts;
        total = totalPostsCount;
        break;

      default:
        throw new BadRequestException(SEARCH_MESSAGES.INVALID_FILTER);
    }

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
