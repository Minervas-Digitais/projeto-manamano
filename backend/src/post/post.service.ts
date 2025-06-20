import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prismaService: PrismaService) {}

  private serializePost(post: any) {
    const { user, category, Comment, ...rest } = post;
    return {
      ...rest,
      nameUser: user?.fullName,
      categoryName: category?.name,
      numComments: Comment?.length ?? 0,
      Comment,
    };
  }

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
          Comment: {
            include: {
              user: {
                select: {
                  fullName: true,
                  id: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!posts || posts.length === 0) {
        throw new NotFoundException('Nenhuma publicação encontrada.');
      }

      return posts.map(this.serializePost);
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const post = await this.prismaService.post.findUnique({
        where: { id },
        include: {
          Comment: {
            include: {
              user: {
                select: {
                  fullName: true,
                  id: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
      });

      if (!post) {
        throw new NotFoundException('Publicação não encontrada.');
      }

      return this.serializePost(post);
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      await this.findOne(id);
      return await this.prismaService.post.update({
        where: { id },
        data: updatePostDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return await this.prismaService.post.delete({
        where: { id },
      });
    } catch (error) {
      return error;
    }
  }

  async savePost(ids: string) {
    try {
      const [postId, userId] = ids.split(',');
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const post = await this.prismaService.post.findUnique({
        where: { id: postId },
      });
      if (post.userId === userId) {
        throw new NotFoundException(
          'Você não pode salvar sua própria publicação.',
        );
      }

      return await this.prismaService.user.update({
        where: { id: userId },
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
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }
      return await this.prismaService.user.update({
        where: { id: userId },
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
      await this.findOne(postId);
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
      await this.findOne(postId);
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
      const posts = await this.prismaService.post.findMany({
        where: {
          groupId,
          isPinned: true,
        },
        include: {
          Comment: {
            include: {
              user: {
                select: {
                  fullName: true,
                  id: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return posts.map(this.serializePost);
    } catch (error) {
      return error;
    }
  }

  async getGroupPosts(groupId: string) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: { groupId },
        include: {
          Comment: {
            include: {
              user: {
                select: {
                  fullName: true,
                  id: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!posts || posts.length === 0) {
        throw new NotFoundException(
          'Nenhuma publicação encontrada neste grupo.',
        );
      }

      return posts.map(this.serializePost);
    } catch (error) {
      return error;
    }
  }

  async getCategoryPosts(categoryId: string) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: { categoryId },
        include: {
          Comment: {
            include: {
              user: {
                select: {
                  fullName: true,
                  id: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!posts || posts.length === 0) {
        throw new NotFoundException(
          'Nenhuma publicação encontrada nesta categoria.',
        );
      }

      return posts.map(this.serializePost);
    } catch (error) {
      return error;
    }
  }

  async getUserPosts(userId: string) {
    try {
      const posts = await this.prismaService.post.findMany({
        where: { userId },
        include: {
          Comment: {
            include: {
              user: {
                select: {
                  fullName: true,
                  id: true,
                },
              },
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!posts || posts.length === 0) {
        throw new NotFoundException(
          'Nenhuma publicação encontrada para este usuário.',
        );
      }

      return posts.map(this.serializePost);
    } catch (error) {
      return error;
    }
  }
}
