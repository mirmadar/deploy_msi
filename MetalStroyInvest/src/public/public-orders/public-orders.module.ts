import { Module } from '@nestjs/common';
import { OrdersController } from './public-orders.controller';
import { OrdersService } from './public-orders.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CartModule } from 'src/public/cart/cart.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [PrismaModule, CartModule],
  exports: [OrdersService],
})
export class OrdersModule {}
