import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 5 }]),
    PrismaModule,
    ValidatorModule,
  ],
})
export class MailModule {}
