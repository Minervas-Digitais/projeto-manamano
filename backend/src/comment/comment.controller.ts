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

@Controller('comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @HttpCode(201)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    return this.commentService.create(createCommentDto, req.user.id);
  }

  @HttpCode(200)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.commentService.remove(id, req.user.id);
  }
}
