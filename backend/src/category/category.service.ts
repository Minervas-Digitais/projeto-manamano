import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prismaService.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    try {
      const categories = await this.prismaService.category.findMany();
      if (!categories) {
        throw new NotFoundException('Não há categorias cadastradas.');
      }
      return categories;
    } catch (error) {
      return error;
    }
  }

  async findCategoriesInGroup(groupId: string) {
    try {
      const categories = await this.prismaService.category.findMany({
        where: {
          groupId,
        },
      });
      if (!categories) {
        throw new NotFoundException('Não há categorias cadastradas.');
      }
      return categories;
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: {
          id,
        },
      });
      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }
      return category;
    } catch (error) {
      return error;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.findOne(id);
      if (typeof category === 'object' && category instanceof Error) {
        return category;
      }
      return await this.prismaService.category.update({
        where: {
          id,
        },
        data: updateCategoryDto,
      });
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      const category = await this.findOne(id);
      if (typeof category === 'object' && category instanceof Error) {
        return category;
      }
      return await this.prismaService.category.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      return error;
    }
  }
}
