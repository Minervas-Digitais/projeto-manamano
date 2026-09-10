import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ValidatorModule } from 'src/common/validators/validator.module';
import { SavedPostController } from './saved-post.controller';
import { SavedPostService } from './saved-post.service';

@Module({
  imports: [PrismaModule, ValidatorModule],
  controllers: [SavedPostController],
  providers: [SavedPostService],
  exports: [SavedPostService],
})
export class SavedPostModule {}
