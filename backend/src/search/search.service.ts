import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchFilter } from './search-filter.enum';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';

@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}

  async search(createSearchDto: CreateSearchDto) {
    const [users, groups, posts] = await Promise.all([
      this.prismaService.user.findMany({
        where: {
          fullName: {
            contains: createSearchDto.input,
            mode: 'insensitive',
          },
        },
        take: 5,
      }),
      this.prismaService.group.findMany({
        where: {
          name: {
            contains: createSearchDto.input,
            mode: 'insensitive',
          },
        },
        take: 5,
      }),
      this.prismaService.post.findMany({
        where: {
          OR: [
            {
              title: {
                contains: createSearchDto.input,
                mode: 'insensitive',
              },
            },
            {
              input: {
                contains: createSearchDto.input,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: 5,
      }),
    ]);

    return {
      users,
      groups,
      posts,
    };
  }

  async searchByFilter(createSearchDto: CreateSearchDto, filter: SearchFilter) {
    switch (filter) {
      case SearchFilter.USERS:
        return await this.prismaService.user.findMany({
          where: {
            fullName: {
              contains: createSearchDto.input,
              mode: 'insensitive',
            },
          },
        });
      case SearchFilter.GROUPS:
        return await this.prismaService.group.findMany({
          where: {
            name: {
              contains: createSearchDto.input,
              mode: 'insensitive',
            },
          },
        });
      case SearchFilter.POSTS:
        return await this.prismaService.post.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: createSearchDto.input,
                  mode: 'insensitive',
                },
              },
              {
                input: {
                  contains: createSearchDto.input,
                  mode: 'insensitive',
                },
              },
            ],
          },
        });
      default:
        throw new BadRequestException(SEARCH_MESSAGES.INVALID_FILTER);
    }
  }
}
