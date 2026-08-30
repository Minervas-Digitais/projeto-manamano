import { PaginationDto } from './pagination-dto';

export class PaginatedResponseDto<T> {
  data: T[];

  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };

  constructor(data: T[], total: number, pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    this.data = data;

    this.meta = {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }
}
