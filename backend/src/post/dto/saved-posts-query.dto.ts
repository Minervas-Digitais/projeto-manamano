import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination/pagination-dto';

export class SavedPostsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  all?: string;
}
