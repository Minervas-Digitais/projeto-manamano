import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import { CATEGORY_MESSAGES } from 'src/messages/category.messages';
import { ValidatorService } from 'src/common/validators/validator.service';

@Injectable()
export class CategoryService {
  constructor(
    private prismaService: PrismaService,
    private readonly validator: ValidatorService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, callerId: string): Promise<Category> {
    await this.validator.validateGroupExists(createCategoryDto.groupId);
    await this.validator.ensureGroupAccess(createCategoryDto.groupId, callerId);

    return await this.prismaService.category.create({
      data: createCategoryDto,
    });
  }

  async findAll(callerId: string): Promise<Category[]> {
    const { isAdmin, groupIds } = await this.validator.getAccessibleGroupIds(callerId);

    return this.prismaService.category.findMany({
      where: isAdmin ? undefined : { groupId: { in: groupIds } },
    });
  }

  async findCategoriesInGroup(groupId: string, callerId: string): Promise<Category[]> {
    const group = await this.prismaService.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    await this.validator.ensureGroupAccess(groupId, callerId);

    return this.prismaService.category.findMany({
      where: { groupId },
    });
  }

  async findOne(categoryId: string, callerId: string): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException(CATEGORY_MESSAGES.NOT_FOUND);
    }

    await this.validator.ensureGroupAccess(category.groupId, callerId);

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    callerId: string,
  ): Promise<Category> {
    const category = await this.findOne(id, callerId);

    if (updateCategoryDto.groupId && updateCategoryDto.groupId !== category.groupId) {
      await this.validator.validateGroupExists(updateCategoryDto.groupId);
      await this.validator.ensureGroupAccess(updateCategoryDto.groupId, callerId);
    }

    return await this.prismaService.category.update({
      where: {
        id,
      },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, callerId: string): Promise<Category> {
    await this.findOne(id, callerId);

    return await this.prismaService.category.delete({
      where: {
        id,
      },
    });
  }
}
