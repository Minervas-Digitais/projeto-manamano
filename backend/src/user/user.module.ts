import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ValidatorModule } from 'src/common/validators/validator.module';
import { TokenModule } from 'src/auth/token.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PrismaModule, ValidatorModule, TokenModule, MailModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
