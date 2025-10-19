import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import { CATEGORY_MESSAGES } from 'src/messages/category.messages';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const groupExists = await this.prismaService.group.findUnique({
      where: { id: createCategoryDto.groupId },
    });

    if (!groupExists) {
      throw new NotFoundException(CATEGORY_MESSAGES.GROUP_NOT_FOUND);
    }

    return await this.prismaService.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prismaService.category.findMany();
    if (categories.length === 0) {
      throw new NotFoundException(CATEGORY_MESSAGES.EMPTY_CATEGORY);
    }

    return categories;
  }

  async findCategoriesInGroup(groupId: string): Promise<Category[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        groupId,
      },
    });

    if (categories.length === 0) {
      throw new NotFoundException(CATEGORY_MESSAGES.EMPTY_CATEGORY);
    }

    return categories;
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException(CATEGORY_MESSAGES.NOT_FOUND);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.findOne(id);

    return await this.prismaService.category.update({
      where: {
        id,
      },
      data: updateCategoryDto,
    });
  }

  async remove(id: string): Promise<Category> {
    await this.findOne(id);

    return await this.prismaService.category.delete({
      where: {
        id,
      },
    });
  }
}
