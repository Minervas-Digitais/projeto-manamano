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
  Req,
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
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpCode(201)
  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
  ): Promise<SerializedPost> {
    return this.postService.create(createPostDto, req.user.id);
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
  @Patch('save/:ids')
  @UseGuards(MatchUserIdGuard)
  async savePost(@Param('ids') ids: string): Promise<any> {
    return this.postService.savePost(ids);
  }

  @HttpCode(201)
  @Patch('unsave/:ids')
  @UseGuards(MatchUserIdGuard)
  async removeSavedPost(@Param('ids') ids: string): Promise<any> {
    return this.postService.removeSavedPost(ids);
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
  ): Promise<SerializedPost[]> {
    return this.postService.getGroupPosts(groupId);
  }

  @HttpCode(200)
  @Get('category/:categoryId')
  async getCategoryPosts(
    @Param('categoryId') categoryId: string,
  ): Promise<SerializedPost[]> {
    return this.postService.getCategoryPosts(categoryId);
  }

  @HttpCode(200)
  @Get(':id/posts')
  @UseGuards(MatchUserIdGuard)
  async findUserPosts(@Param('id') id: string): Promise<SerializedPost[]> {
    return this.postService.getUserPosts(id);
  }

  @Get('saved/:userId')
  @UseGuards(MatchUserIdGuard)
  async getSavedPosts(
    @Param('userId') userId: string,
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
