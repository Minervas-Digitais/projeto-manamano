import { UpdateGroupDto } from './update-group.dto';

export const updateGroupDto = (
  overrides: Partial<UpdateGroupDto> = {},
): UpdateGroupDto => {
  return {
    ...overrides,
  };
};
