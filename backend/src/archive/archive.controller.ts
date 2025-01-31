import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { ArchiveService } from './archive.service';

@Controller('archives')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post()
  async uploadArquivo(
    @Body() { name, mimeType, contentBase64, userId, groupId }: any,
  ) {
    return this.archiveService.createArchive({
      name,
      mimeType,
      contentBase64,
      userId,
      groupId,
    });
  }

  @Get(':id')
  async getArchive(@Param('id') id: string) {
    return this.archiveService.getArchiveById(id);
  }
}