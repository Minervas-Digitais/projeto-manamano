import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports: [PrismaModule, ValidatorModule],
})
export class MailModule {}
