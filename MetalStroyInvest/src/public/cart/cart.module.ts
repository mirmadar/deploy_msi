import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [PrismaModule],
  exports: [CartService], // Экспортируем для использования в других модулях (например, для очистки после заказа)
})
export class CartModule {}

