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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpCode(201)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @HttpCode(200)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.postService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @HttpCode(201)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @HttpCode(200)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }

  @HttpCode(201)
  @Patch('save/:ids')
  @UseGuards(JwtAuthGuard)
  async savePost(@Param('ids') ids: string) {
    return this.postService.savePost(ids);
  }

  @HttpCode(201)
  @Patch('unsave/:ids')
  @UseGuards(JwtAuthGuard)
  async removeSavedPost(@Param('ids') ids: string) {
    return this.postService.removeSavedPost(ids);
  }

  @HttpCode(201)
  @Patch('pin/:postId')
  @UseGuards(JwtAuthGuard)
  async pinPost(@Param('postId') postId: string) {
    return this.postService.pinPost(postId);
  }

  @HttpCode(201)
  @Patch('unpin/:postId')
  @UseGuards(JwtAuthGuard)
  async unpinPost(@Param('postId') postId: string) {
    return this.postService.unpinPost(postId);
  }

  @HttpCode(200)
  @Get('group/pinned/:groupId')
  @UseGuards(JwtAuthGuard)
  async getPinnedPosts(@Param('groupId') groupId: string) {
    return this.postService.getPinnedPosts(groupId);
  }

  @HttpCode(200)
  @Get('group/:groupId')
  @UseGuards(JwtAuthGuard)
  async getGroupPosts(@Param('groupId') groupId: string) {
    return this.postService.getGroupPosts(groupId);
  }

  @HttpCode(200)
  @Get('category/:categoryId')
  @UseGuards(JwtAuthGuard)
  async getCategoryPosts(@Param('categoryId') categoryId: string) {
    return this.postService.getCategoryPosts(categoryId);
  }
}
