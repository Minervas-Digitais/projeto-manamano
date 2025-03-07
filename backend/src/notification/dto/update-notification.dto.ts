import { IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @IsBoolean()
  isRead: boolean;
}