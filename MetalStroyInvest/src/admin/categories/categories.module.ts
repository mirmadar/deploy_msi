import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { SearchModule } from 'src/admin/search/search.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
  imports: [PrismaModule, AuthModule, SearchModule],
})
export class CategoriesModule {}
