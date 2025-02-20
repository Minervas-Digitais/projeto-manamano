import { Body, Controller, Post, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { CreateArchiveDto, ResponseArchiveDto } from './dto/archive.dto';

@Controller('archives')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadArquivo(@Body() createArchiveDto: CreateArchiveDto): Promise<ResponseArchiveDto> {
    return this.archiveService.createArchive(createArchiveDto);
  }

  @Get(':id')
  async getArchive(@Param('id') id: string): Promise<ResponseArchiveDto> {
    return this.archiveService.getArchiveById(id);
  }
}

