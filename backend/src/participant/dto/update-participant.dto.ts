import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateParticipantDto } from './create-participant.dto';

export class UpdateParticipantDto extends PartialType(
  OmitType(CreateParticipantDto, ['groupId'] as const),
) {}
