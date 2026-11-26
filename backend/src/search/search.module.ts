import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ValidatorModule } from 'src/common/validators/validator.module';

@Module({
  controllers: [SearchController],
  providers: [SearchService],
  imports: [PrismaModule, ValidatorModule],
})
export class SearchModule {}
