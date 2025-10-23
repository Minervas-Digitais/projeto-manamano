import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSearchDto } from './dto/create-search.dto';

@Injectable()
export class SearchService {
  constructor(private prismaService: PrismaService) {}

  async search(createSearchDto: CreateSearchDto) {
    try {
      const result = {};
      const users = await this.prismaService.user.findMany({
        where: {
          fullName: {
            contains: createSearchDto.input,
            mode: 'insensitive',
          },
        },
        take: 5,
      });

      const groups = await this.prismaService.group.findMany({
        where: {
          name: {
            contains: createSearchDto.input,
            mode: 'insensitive',
          },
        },
        take: 5,
      });

      const posts = await this.prismaService.post.findMany({
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

        include: {
          user: {
            select: {
              fullName: true,
            },
          },
          _count: {
            select: {
              Comment: true,
            },
          },
        }
      });

      result['users'] = users;
      result['groups'] = groups;
      result['posts'] = posts;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async searchByFilter(createSearchDto: CreateSearchDto, filter: string) {
    try {
      const page = createSearchDto.page ? Number(createSearchDto.page) : 1;
      const limit = createSearchDto.limit ? Number(createSearchDto.limit) : 20;
      const skip = (page - 1) * limit;


      switch (filter) {
        case 'users':
          return await this.prismaService.user.findMany({
            where: {
              fullName: {
                contains: createSearchDto.input,
                mode: 'insensitive',
              },
            },
            skip: skip,
            take: limit,
          });
        case 'groups':
          return await this.prismaService.group.findMany({
            where: {
              name: {
                contains: createSearchDto.input,
                mode: 'insensitive',
              },
            },
            skip: skip,
            take: limit,
          });
        case 'posts':
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

            skip: skip,
            take: limit,

            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
              _count: {
                select: {
                  Comment: true,
                },
              }
            }
          });
        default:
          throw new BadRequestException('Invalid filter');
      }
    } catch (error) {
      throw error;
    }
  }
}
