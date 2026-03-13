import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { PublicServicesController } from './public-services.controller';
import { PublicServicesService } from './public-services.service';

@Module({
  controllers: [PublicServicesController],
  providers: [PublicServicesService],
  imports: [PrismaModule],
})
export class PublicServicesModule {}

