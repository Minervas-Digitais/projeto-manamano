import {
  Body,
  Controller,
  Post,
  HttpCode,
  Param,
  UseGuards,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchService } from './search.service';
import { SearchFilter } from './search-filter.enum';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @HttpCode(201)
  @Post()
  async search(@Body() createSearchDto: CreateSearchDto) {
    return this.searchService.search(createSearchDto);
  }

  @HttpCode(200)
  @Post('filter/:filter')
  async searchByFilter(
    @Body() createSearchDto: CreateSearchDto,
    @Param(
      'filter',
      new ParseEnumPipe(SearchFilter, {
        exceptionFactory: () => new BadRequestException(SEARCH_MESSAGES.INVALID_FILTER),
      }),
    )
    filter: SearchFilter,
  ) {
    return this.searchService.searchByFilter(createSearchDto, filter);
  }
}