import { Module } from '@nestjs/common';
import { ServiceCategoriesService } from './service-categories.service';
import { ServiceCategoriesController } from './service-categories.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';

@Module({
  controllers: [ServiceCategoriesController],
  providers: [ServiceCategoriesService],
  exports: [ServiceCategoriesService],
  imports: [PrismaModule, AuthModule],
})
export class ServiceCategoriesModule {}
