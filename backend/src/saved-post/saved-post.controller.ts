import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.decorator';
import { SavedPostService } from './saved-post.service';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { SerializedPost } from 'src/post/post.service';
import { CreateSavedPostDto } from './dto/create-saved-post.dto';

@Controller('saved-post')
@UseGuards(JwtAuthGuard)
export class SavedPostController {
  constructor(private readonly savedPostService: SavedPostService) {}

  @HttpCode(201)
  @Post()
  async savePost(@Body() createSavedPostDto: CreateSavedPostDto, @User('id') userId: string) {
    return this.savedPostService.savePost(userId, createSavedPostDto);
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
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<SerializedPost>> {
    return this.savedPostService.getSavedPosts(userId, pagination);
  }
}
