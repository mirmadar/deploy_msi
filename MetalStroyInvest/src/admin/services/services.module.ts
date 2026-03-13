import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
  imports: [PrismaModule, AuthModule],
})
export class ServicesModule {}
