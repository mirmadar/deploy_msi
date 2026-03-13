import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { PublicServiceCategoriesController } from './public-service-categories.controller';
import { PublicServiceCategoriesService } from './public-service-categories.service';

@Module({
  controllers: [PublicServiceCategoriesController],
  providers: [PublicServiceCategoriesService],
  imports: [PrismaModule],
})
export class PublicServiceCategoriesModule {}

