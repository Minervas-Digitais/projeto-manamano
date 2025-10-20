import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  imports: [PrismaModule, ValidatorModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
