import {
  Body,
  Controller,
  Post,
  HttpCode,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchService } from './search.service';
import { SearchFilter } from './search-filter.enum';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @HttpCode(201)
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
    @Param('filter', new ParseEnumPipe(SearchFilter)) filter: SearchFilter,
  ) {
    return this.searchService.searchByFilter(createSearchDto, filter);
  }
}
