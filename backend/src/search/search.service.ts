import { Injectable } from '@nestjs/common';
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
      });

      result['users'] = users;
      result['groups'] = groups;
      result['posts'] = posts;
      return result;
    } catch (error) {
      return error;
    }
  }

  async searchByFilter(createSearchDto: CreateSearchDto, filter: string) {
    try {
      switch (filter) {
        case 'users':
          return await this.prismaService.user.findMany({
            where: {
              fullName: {
                contains: createSearchDto.input,
                mode: 'insensitive',
              },
            },
          });
        case 'groups':
          return await this.prismaService.group.findMany({
            where: {
              name: {
                contains: createSearchDto.input,
                mode: 'insensitive',
              },
            },
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
          });
        default:
          throw new Error('Invalid filter');
      }
    } catch (error) {
      return error;
    }
  }
}
