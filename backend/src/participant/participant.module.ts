import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThrottlingModule } from 'src/common/throttling/throttling.module';
import { ParticipantController } from './participant.controller';
import { ParticipantService } from './participant.service';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  imports: [PrismaModule, ValidatorModule, ThrottlingModule],
  controllers: [ParticipantController],
  providers: [ParticipantService],
})
export class ParticipantModule {}
