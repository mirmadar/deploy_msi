import { Module } from '@nestjs/common';
import { AdminOrdersService } from './orders.service';
import { AdminOrdersController } from './orders.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { OrdersModule as PublicOrdersModule } from 'src/public/public-orders/public-orders.module';

@Module({
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
  exports: [AdminOrdersService],
  imports: [PrismaModule, AuthModule, PublicOrdersModule],
})
export class AdminOrdersModule {}
