import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { NotificationModule } from 'src/notification/notification.module';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  imports: [PrismaModule, NotificationModule, ValidatorModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
