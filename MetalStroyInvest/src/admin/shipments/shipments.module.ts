import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
  imports: [PrismaModule, AuthModule, CategoriesModule],
})
export class ShipmentsModule {}


