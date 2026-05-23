import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdateVersionDto } from './update-version-dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('version') getVersion() {
    return this.appService.getVersion();
  }

  @Get('version/check')
  async checkVersion(@Query('build') build: number) {
    return this.appService.checkVersion(build);
  }

  @Post('version') updateVersion(@Body() body: UpdateVersionDto) {
    return this.appService.updateVersion(body);
  }
}
