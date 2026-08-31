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
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { SavedPostsQueryDto } from './dto/saved-posts-query.dto';

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

  @Get('saved')
  async getSavedPosts(
    @User('id') userId: string,
    @Query() query: SavedPostsQueryDto,
  ): Promise<PaginatedResponseDto<SerializedPost> | SerializedPost[]> {
    const isAll = query.all === 'true';
    const pagination: PaginationDto = { page: query.page, limit: query.limit };
    return this.postService.getSavedPosts(userId, pagination, isAll);
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
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto): Promise<SerializedPost> {
    return this.postService.update(id, updatePostDto);
  }

  @HttpCode(201)
  @Patch('save/:postId')
  async savePost(@Param('postId') postId: string, @User('id') userId: string): Promise<any> {
    return this.postService.savePost(userId, postId);
  }

  @HttpCode(201)
  @Patch('unsave/:postId')
  async removeSavedPost(@Param('postId') postId: string, @User('id') userId: string): Promise<any> {
    return this.postService.removeSavedPost(userId, postId);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string): Promise<SerializedPost> {
    return this.postService.remove(id);
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
  async getPinnedPosts(@Param('groupId') groupId: string): Promise<SerializedPost[]> {
    return this.postService.getPinnedPosts(groupId);
  }

  @HttpCode(200)
  @Get('group/:groupId')
  async getGroupPosts(
    @Param('groupId') groupId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    return this.postService.getGroupPosts(groupId, pagination);
  }

  @HttpCode(200)
  @Get('category/:categoryId')
  async getCategoryPosts(
    @Param('categoryId') categoryId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    return this.postService.getCategoryPosts(categoryId, pagination);
  }

  @HttpCode(200)
  @Get(':id/posts')
  async findUserPosts(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    return this.postService.getUserPosts(id, pagination);
  }
}
