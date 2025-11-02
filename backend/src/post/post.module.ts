import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { NotificationModule } from 'src/notification/notification.module';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  imports: [PrismaModule, NotificationModule, ValidatorModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
