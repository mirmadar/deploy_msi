import { Module } from '@nestjs/common';
import { PublicProductsService } from './public-products.service';
import { PublicProductsController } from './public-products.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  providers: [PublicProductsService],
  controllers: [PublicProductsController],
  imports: [PrismaModule],
})
export class PublicProductsModule {}
