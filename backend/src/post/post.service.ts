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
      const post = await this.findOne(id);
      if (typeof post === 'object' && post instanceof Error) {
        return post;
      }
      return await this.prismaService.post.update({
        where: {
          id,
        },
        data: updatePostDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const post = await this.findOne(id);
      if (typeof post === 'object' && post instanceof Error) {
        return post;
      }
      return await this.prismaService.post.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async savePost(ids: string) {
    try {
      const [postId, userId] = ids.split(',');
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (post.userId === userId) {
        throw new NotFoundException(
          'Você não pode salvar sua própria publicação.',
        );
      }

      return await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          savedPost: [...user.savedPost, postId],
        },
      });
    } catch (error) {
      return error;
    }
  }

  async removeSavedPost(ids: string) {
    try {
      const [postId, userId] = ids.split(',');
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }
      return await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          savedPost: user.savedPost.filter((id) => id !== postId),
        },
      });
    } catch (error) {
      return error;
    }
  }

  async pinPost(postId: string) {
    try {
      const post = await this.findOne(postId);
      if (typeof post === 'object' && post instanceof Error) {
        return post;
      }
      return await this.prismaService.post.update({
        where: { id: postId },
        data: { isPinned: true },
      });
    } catch (error) {
      return error;
    }
  }

  async unpinPost(postId: string) {
    try {
      const post = await this.findOne(postId);
      if (typeof post === 'object' && post instanceof Error) {
        return post;
      }
      return await this.prismaService.post.update({
        where: { id: postId },
        data: { isPinned: false },
      });
    } catch (error) {
      return error;
    }
  }

  async getPinnedPosts(groupId: string) {
    try {
      return this.prismaService.post.findMany({
        where: {
          groupId,
          isPinned: true,
        },
      });
    } catch (error) {
      return error;
    }
  }

  async getGroupPosts(groupId: string) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          groupId,
        },
        orderBy: {
          createdAt: 'desc',
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

  async getCategoryPosts(categoryId: string) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: {
          categoryId,
        },
        orderBy: {
          createdAt: 'desc',
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
}
