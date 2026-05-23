import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { CreateArchiveDto, ResponseArchiveDto } from './dto/archive.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/user/user.decorator';

@Controller('archives')
@UseGuards(JwtAuthGuard)
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadArquivo(
    @Body() createArchiveDto: CreateArchiveDto,
    @User('id') userId: string,
  ): Promise<ResponseArchiveDto> {
    return this.archiveService.createArchive(createArchiveDto, userId);
  }

  @Get(':archiveId')
  async getArchive(@Param('archiveId') archiveId: string): Promise<ResponseArchiveDto> {
    return this.archiveService.getArchiveById(archiveId);
  }

  @Get('post/:postId')
  async getArchivesByPostId(@Param('postId') postId: string): Promise<ResponseArchiveDto[]> {
    return this.archiveService.getArchivesByPostId(postId);
  }

  @Get('group/:groupId')
  async getArchivesByGroupId(@Param('groupId') groupId: string): Promise<ResponseArchiveDto[]> {
    return this.archiveService.getArchivesByGroupId(groupId);
  }
}
