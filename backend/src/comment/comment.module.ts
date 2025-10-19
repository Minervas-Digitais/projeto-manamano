import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
