import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductCharacteristicsModule } from 'src/admin/product-characteristics/product-characteristics.module';
import { CategoriesModule } from 'src/admin/categories/categories.module';
import { CharacteristicNamesModule } from 'src/admin/characteristic-names/characteristic-names.module';
import { SearchModule } from 'src/admin/search/search.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
  imports: [
    PrismaModule,
    ProductCharacteristicsModule,
    CategoriesModule,
    CharacteristicNamesModule,
    SearchModule,
    AuthModule,
  ],
})
export class ProductsModule {}
