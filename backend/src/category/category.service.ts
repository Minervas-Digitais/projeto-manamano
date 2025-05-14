import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
        const groupExists = await this.prismaService.group.findUnique({
            where: { id: createCategoryDto.groupId },
        });

        if (!groupExists) {
            throw new NotFoundException(`Grupo não encontrado.`);
        }

        return await this.prismaService.category.create({
            data: createCategoryDto,
      });
    } catch (error) {
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  }
}
