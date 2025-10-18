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
import { MatchUserIdGuard } from 'src/auth/match-user-id.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpCode(201)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto): Promise<SerializedPost> {
    return this.postService.create(createPostDto);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findAll(): Promise<SerializedPost[]> {
    return this.postService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<SerializedPost> {
    return this.postService.findOne(id);
  }

  @HttpCode(201)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<SerializedPost> {
    return this.postService.update(id, updatePostDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  remove(@Param('id') id: string): Promise<SerializedPost> {
    return this.postService.remove(id);
  }

  @HttpCode(201)
  @Patch('save/:ids')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async savePost(@Param('ids') ids: string): Promise<any> {
    return this.postService.savePost(ids);
  }

  @HttpCode(201)
  @Patch('unsave/:ids')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async removeSavedPost(@Param('ids') ids: string): Promise<any> {
    return this.postService.removeSavedPost(ids);
  }

  @HttpCode(201)
  @Patch('pin/:postId')
  @UseGuards(JwtAuthGuard)
  async pinPost(@Param('postId') postId: string): Promise<SerializedPost> {
    return this.postService.pinPost(postId);
  }

  @HttpCode(201)
  @Patch('unpin/:postId')
  @UseGuards(JwtAuthGuard)
  async unpinPost(@Param('postId') postId: string): Promise<SerializedPost> {
    return this.postService.unpinPost(postId);
  }

  @HttpCode(200)
  @Get('group/pinned/:groupId')
  @UseGuards(JwtAuthGuard)
  async getPinnedPosts(
    @Param('groupId') groupId: string,
  ): Promise<SerializedPost[]> {
    return this.postService.getPinnedPosts(groupId);
  }

  @HttpCode(200)
  @Get('group/:groupId')
  @UseGuards(JwtAuthGuard)
  async getGroupPosts(
    @Param('groupId') groupId: string,
  ): Promise<SerializedPost[]> {
    return this.postService.getGroupPosts(groupId);
  }

  @HttpCode(200)
  @Get('category/:categoryId')
  @UseGuards(JwtAuthGuard)
  async getCategoryPosts(
    @Param('categoryId') categoryId: string,
  ): Promise<SerializedPost[]> {
    return this.postService.getCategoryPosts(categoryId);
  }

  @HttpCode(200)
  @Get(':id/posts')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async findUserPosts(@Param('id') id: string): Promise<SerializedPost[]> {
    return this.postService.getUserPosts(id);
  }

  @Get('saved/:userId')
  @UseGuards(JwtAuthGuard, MatchUserIdGuard)
  async getSavedPosts(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<SerializedPost[]> {
    return this.postService.getSavedPosts(userId, Number(page), Number(limit));
  }
}
