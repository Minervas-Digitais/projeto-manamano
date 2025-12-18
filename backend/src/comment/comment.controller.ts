import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/user/user.decorator';

@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @HttpCode(201)
  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @User('id') userId: string,
  ) {
    return this.commentService.create(createCommentDto, userId);
  }

  @HttpCode(200)
  @Delete(':commentId')
  remove(@Param('commentId') commentId: string, @User('id') userId: string) {
    return this.commentService.remove(commentId, userId);
  }
}
