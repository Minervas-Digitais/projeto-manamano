import { Module } from '@nestjs/common';
import { ValidatorService } from './validator.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ValidatorService],
  exports: [ValidatorService],
})
export class ValidatorModule {}
