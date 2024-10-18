import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}
  async create(createCommentDto: CreateCommentDto) {
    try {
      return await this.prismaService.comment.create({
        data: createCommentDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const comment = await this.prismaService.comment.findUnique({
        where: { id },
      });
      if (!comment) {
        throw new NotFoundException('Comentário não encontrado.');
      }
      return await this.prismaService.comment.delete({
        where: { id },
      });
    } catch (error) {
      return error;
    }
  }
}
