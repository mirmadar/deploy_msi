import { Module } from '@nestjs/common';
import { PublicArticlesService } from './public-articles.service';
import { ArticlesController } from './public-articles.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [ArticlesController],
  providers: [PublicArticlesService],
  imports: [PrismaModule],
})
export class PublicArticlesModule {}

