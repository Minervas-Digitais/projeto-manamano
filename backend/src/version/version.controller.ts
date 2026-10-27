import { Controller, Get, Query } from '@nestjs/common';
import { VersionService } from './version.service';
import { VersionInfo } from './version.types';

@Controller('version')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  getLatest(@Query('current') currentVersion?: string): Promise<VersionInfo> {
    return this.versionService.getLatest(currentVersion);
  }
}
