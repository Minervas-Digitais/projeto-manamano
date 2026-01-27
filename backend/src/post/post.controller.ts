import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService, SerializedPost } from './post.service';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RoleType } from '@prisma/client';
import { User } from 'src/user/user.decorator';

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

@Controller('post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpCode(201)
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @User('id') userId: string,
  ): Promise<SerializedPost> {
    return this.postService.create(createPostDto, userId);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  findAll(): Promise<SerializedPost[]> {
    return this.postService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<SerializedPost> {
    return this.postService.findOne(id);
  }

  @HttpCode(201)
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<SerializedPost> {
    return this.postService.update(id, updatePostDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string): Promise<SerializedPost> {
    return this.postService.remove(id);
  }

  @HttpCode(201)
  @Patch('save/:postId')
  async savePost(
    @Param('postId') postId: string,
    @User('id') userId: string,
  ): Promise<any> {
    return this.postService.savePost(userId, postId);
  }

  @HttpCode(201)
  @Patch('unsave/:postId')
  async removeSavedPost(
    @Param('postId') postId: string,
    @User('id') userId: string,
  ): Promise<any> {
    return this.postService.removeSavedPost(userId, postId);
  }

  @HttpCode(201)
  @Patch('pin/:postId')
  async pinPost(@Param('postId') postId: string): Promise<SerializedPost> {
    return this.postService.setPinStatus(postId, true);
  }

  @HttpCode(201)
  @Patch('unpin/:postId')
  async unpinPost(@Param('postId') postId: string): Promise<SerializedPost> {
    return this.postService.setPinStatus(postId, false);
  }

  @HttpCode(200)
  @Get('group/pinned/:groupId')
  async getPinnedPosts(
    @Param('groupId') groupId: string,
  ): Promise<SerializedPost[]> {
    return this.postService.getPinnedPosts(groupId);
  }

  @HttpCode(200)
  @Get('group/:groupId')
  async getGroupPosts(
    @Param('groupId') groupId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<SerializedPost>> {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return this.postService.getGroupPosts(groupId, pageNum, limitNum);
  }

  @HttpCode(200)
  @Get('category/:categoryId')
  async getCategoryPosts(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<SerializedPost>> {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return this.postService.getCategoryPosts(categoryId, pageNum, limitNum);
  }

  @HttpCode(200)
  @Get(':id/posts')
  async findUserPosts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponse<SerializedPost>> {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return this.postService.getUserPosts(id, pageNum, limitNum);
  }

  @Get('saved')
  async getSavedPosts(
    @User('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('all') all = 'false',
  ): Promise<SerializedPost[]> {
    const isAll = all === 'true';
    return this.postService.getSavedPosts(
      userId,
      isAll ? undefined : Number(page),
      isAll ? undefined : Number(limit),
      isAll,
    );
  }
}
