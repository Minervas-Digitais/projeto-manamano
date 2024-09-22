import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { GroupModule } from './group/group.module';
import { MailModule } from './mail/mail.module';
import { ParticipantModule } from './participant/participant.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    PostModule,
    CategoryModule,
    GroupModule,
    ParticipantModule,
    AuthModule,
    CommentModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
