import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThrottlingModule } from 'src/common/throttling/throttling.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
  imports: [PrismaModule, ValidatorModule, ThrottlingModule],
})
export class MailModule {}
