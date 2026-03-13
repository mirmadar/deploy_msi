import { Module } from '@nestjs/common';
import { PublicShipmentsService } from './public-shipments.service';
import { PublicShipmentsController } from './public-shipments.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [PublicShipmentsController],
  providers: [PublicShipmentsService],
  imports: [PrismaModule],
})
export class PublicShipmentsModule {}


