import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @HttpCode(200)
  @Post()
  @UseGuards(JwtAuthGuard)
  search(@Body() createSearchDto: CreateSearchDto) {
    return this.searchService.search(createSearchDto);
  }

  @HttpCode(200)
  @Post('filter/:filter')
  @UseGuards(JwtAuthGuard)
  searchByFilter(
    @Body() createSearchDto: CreateSearchDto,
    @Param('filter') filter: string,
  ) {
    return this.searchService.searchByFilter(createSearchDto, filter);
  }
}
