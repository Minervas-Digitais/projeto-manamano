import { Injectable } from '@nestjs/common';
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
      const posts = await this.prismaService.post.findMany();
      if (!posts) {
        return 'Não há publicações feitas.';
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
      });
      if (!post) {
        return 'Publicação não encontrada.';
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
        return 'Publicação não encontrada.';
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
        return 'Publicação não encontrada.';
      }
      return post;
    } catch (error) {
      return error;
    }
  }
}
