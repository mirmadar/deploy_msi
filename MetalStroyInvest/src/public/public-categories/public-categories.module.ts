import { Module } from '@nestjs/common';
import { PublicCategoriesController } from './public-categories.controller';
import { PublicCategoriesService } from './public-categories.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [PublicCategoriesController],
  providers: [PublicCategoriesService],
  imports: [PrismaModule],
})
export class PublicCategoriesModule {}
