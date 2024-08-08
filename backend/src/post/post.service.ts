import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    try {
      return await this.prismaService.post.create({
        data: createPostDto,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const posts = await this.prismaService.post.findMany({
        include: {
          Comment: true,
        },
      });
      if (!posts) {
        throw new NotFoundException('Nenhuma publicação encontrada.');
      }
      return posts;
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: {
          id,
        },
        include: {
          Comment: true,
        },
      });
      if (!post) {
        throw new NotFoundException('Publicação não encontrada.');
      }
      return post;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const post = await this.prismaService.post.update({
        where: {
          id,
        },
        data: updatePostDto,
      });
      if (!post) {
        throw new NotFoundException('Publicação não encontrada.');
      }
      return post;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const post = await this.prismaService.post.delete({
        where: {
          id,
        },
      });
      if (!post) {
        throw new NotFoundException('Publicação não encontrada.');
      }
      return post;
    } catch (error) {
      return error;
    }
  }
}
