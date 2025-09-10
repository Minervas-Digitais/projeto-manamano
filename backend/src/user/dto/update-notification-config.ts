import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationConfigDto {
  @IsOptional()
  @IsBoolean()
  disablePopup?: boolean;

  @IsOptional()
  @IsBoolean()
  muteSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  muteGroups?: boolean;
}
