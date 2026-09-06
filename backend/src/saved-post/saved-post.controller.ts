import { Controller, Delete, Get, HttpCode, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.decorator';
import { SavedPostService } from './saved-post.service';
import { SerializedPost } from 'src/post/post.service';

@Controller('saved-post')
@UseGuards(JwtAuthGuard)
export class SavedPostController {
  constructor(private readonly savedPostService: SavedPostService) {}

  @HttpCode(201)
  @Post(':postId')
  async savePost(@Param('postId') postId: string, @User('id') userId: string) {
    return this.savedPostService.savePost(userId, postId);
  }

  @HttpCode(200)
  @Delete(':postId')
  async removeSavedPost(@Param('postId') postId: string, @User('id') userId: string) {
    return this.savedPostService.removeSavedPost(userId, postId);
  }

  @HttpCode(200)
  @Get()
  async getSavedPosts(
    @User('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('all') all = 'false',
  ): Promise<SerializedPost[]> {
    const isAll = all === 'true';
    return this.savedPostService.getSavedPosts(
      userId,
      isAll ? undefined : Number(page),
      isAll ? undefined : Number(limit),
      isAll,
    );
  }
}
