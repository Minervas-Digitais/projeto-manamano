import { CreateGroupDto } from './create-group.dto';

export function createGroupDto(overrides?: Partial<CreateGroupDto>): CreateGroupDto {
    return {
        name: 'Grupo Padrão',
        inviteCode: 'INVITE123',
        description: 'Descrição padrão',
        ...overrides,
    };
}