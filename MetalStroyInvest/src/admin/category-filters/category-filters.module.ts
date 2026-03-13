import { Module } from '@nestjs/common';
import { CategoryFiltersController } from './category-filters.controller';
import { CategoryFiltersService } from './category-filters.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';

@Module({
  controllers: [CategoryFiltersController],
  providers: [CategoryFiltersService],
  exports: [CategoryFiltersService],
  imports: [PrismaModule, AuthModule],
})
export class CategoryFiltersModule {}
