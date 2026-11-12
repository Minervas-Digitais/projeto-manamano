import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@prisma/client';
import { User } from 'src/user/user.decorator';

@Controller('category')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @HttpCode(201)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @User('id') callerId: string,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryDto, callerId);
  }

  @HttpCode(200)
  @Get()
  findAll(@User('id') callerId: string): Promise<Category[]> {
    return this.categoryService.findAll(callerId);
  }

  @HttpCode(200)
  @Get('group/:groupId')
  findCategoriesInGroup(
    @Param('groupId') groupId: string,
    @User('id') callerId: string,
  ): Promise<Category[]> {
    return this.categoryService.findCategoriesInGroup(groupId, callerId);
  }

  @HttpCode(200)
  @Get(':categoryId')
  findOne(
    @Param('categoryId') categoryId: string,
    @User('id') callerId: string,
  ): Promise<Category> {
    return this.categoryService.findOne(categoryId, callerId);
  }

  @HttpCode(201)
  @Patch(':categoryId')
  update(
    @Param('categoryId') categoryId: string,
    @User('id') callerId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(categoryId, updateCategoryDto, callerId);
  }

  @HttpCode(200)
  @Delete(':categoryId')
  remove(@Param('categoryId') categoryId: string, @User('id') callerId: string): Promise<Category> {
    return this.categoryService.remove(categoryId, callerId);
  }
}
