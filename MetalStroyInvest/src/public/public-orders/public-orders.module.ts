import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './public-orders.controller';
import { OrdersService } from './public-orders.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { CartModule } from 'src/public/cart/cart.module';
import { PublicOrdersProcessor } from './public-orders.processor';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PublicOrdersProcessor],
  imports: [
    PrismaModule,
    CartModule,
    BullModule.registerQueue({
      name: 'orders-processing',
    }),
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
