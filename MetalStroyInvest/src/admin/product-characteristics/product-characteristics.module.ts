import { Module } from '@nestjs/common';
import { ProductCharacteristicsService } from './product-characteristics.service';
import { ProductCharacteristicsController } from './product-characteristics.controller';
import { CharacteristicNamesModule } from 'src/admin/characteristic-names/characteristic-names.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  providers: [ProductCharacteristicsService],
  controllers: [ProductCharacteristicsController],
  exports: [ProductCharacteristicsService],
  imports: [PrismaModule, CharacteristicNamesModule, AuthModule],
})
export class ProductCharacteristicsModule {}
