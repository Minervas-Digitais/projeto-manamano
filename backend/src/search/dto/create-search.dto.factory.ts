import { CreateSearchDto } from '../dto/create-search.dto';

export function createSearchDto(input: string = 'default search input'): CreateSearchDto {
  const dto = new CreateSearchDto();
  dto.input = input;
  return dto;
}
