import {
  Body,
  Controller,
  Post,
  HttpCode,
  Param,
  Query,
  UseGuards,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateSearchDto } from './dto/create-search.dto';
import { SearchResult, SearchService } from './search.service';
import { SearchFilter } from './search-filter.enum';
import { Group, Post as PostEntity, User } from '@prisma/client';
import { SEARCH_MESSAGES } from 'src/messages/search.messages';
import { PaginationDto } from 'src/common/pagination/pagination-dto';
import { PaginatedResponseDto } from 'src/common/pagination/paginated-response-dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @HttpCode(201)
  @Post()
  search(
    @Body() createSearchDto: CreateSearchDto,
    @Query() pagination: PaginationDto,
  ): Promise<SearchResult> {
    return this.searchService.search(createSearchDto, pagination);
  }

  @HttpCode(200)
  @Post('filter/:filter')
  searchByFilter(
    @Body() createSearchDto: CreateSearchDto,
    @Param(
      'filter',
      new ParseEnumPipe(SearchFilter, {
        exceptionFactory: () => new BadRequestException(SEARCH_MESSAGES.INVALID_FILTER),
      }),
    )
    filter: SearchFilter,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<Omit<User, 'hash'> | Group | PostEntity>> {
    return this.searchService.searchByFilter(createSearchDto, filter, pagination);
  }
}
