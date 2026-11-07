import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ThrottlingModule } from 'src/common/throttling/throttling.module';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  imports: [PrismaModule, ValidatorModule, ThrottlingModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
