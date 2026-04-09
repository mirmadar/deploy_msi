import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CityGuard } from './public/public-cities/guards/city.guard';
import { ProductsModule } from './admin/products/products.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { S3Module } from './shared/s3/s3.module';
import { MailModule } from './shared/mail/mail.module';
import { UploadModule } from './admin/upload/upload.module';
import { HomepageModule } from './public/homepage/homepage.module';
import { UsersModule } from './admin/users/users.module';
import { RolesModule } from './admin/roles/roles.module';
import { AuthModule } from './admin/auth/auth.module';
import { CategoriesModule } from './admin/categories/categories.module';
import { CharacteristicNamesModule } from './admin/characteristic-names/characteristic-names.module';
import { ProductCharacteristicsModule } from './admin/product-characteristics/product-characteristics.module';
import { SearchModule } from './admin/search/search.module';
import { PublicSearchModule } from './public/public-search/public-search.module';
import { CategoryFiltersModule } from './admin/category-filters/category-filters.module';
import { PublicCategoriesModule } from './public/public-categories/public-categories.module';
import { CatalogModule } from './public/catalog/catalog.module';
import { PublicProductsModule } from './public/public-products/public-products.module';
import { CartModule } from './public/cart/cart.module';
import { CallbackRequestModule } from './public/callback-request/callback-request.module';
import { OrdersModule } from './public/public-orders/public-orders.module';
import { ArticlesModule } from './admin/articles/articles.module';
import { PublicArticlesModule } from './public/public-articles/public-articles.module';
import { AdminOrdersModule } from './admin/orders/orders.module';
import { CitiesModule } from './admin/cities/cities.module';
import { PublicCitiesModule } from './public/public-cities/public-cities.module';
import { ShipmentsModule } from './admin/shipments/shipments.module';
import { PublicShipmentsModule } from './public/public-shipments/public-shipments.module';
import { ServiceCategoriesModule } from './admin/service-categories/service-categories.module';
import { ServicesModule } from './admin/services/services.module';
import { PublicServiceCategoriesModule } from './public/public-service-categories/public-service-categories.module';
import { PublicServicesModule } from './public/public-services/public-services.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: Number(process.env.REDIS_PORT || 6379),
        ...(process.env.REDIS_PASSWORD
          ? { password: process.env.REDIS_PASSWORD }
          : {}),
      },
    }),
    PrismaModule,
    S3Module,
    MailModule,
    UploadModule,
    ProductsModule,
    HomepageModule,
    PublicSearchModule,
    PublicCategoriesModule,
    PublicProductsModule,
    CatalogModule,
    CartModule,
    CallbackRequestModule,
    OrdersModule,
    PublicArticlesModule,
    PublicCitiesModule,
    PublicShipmentsModule,
    PublicServiceCategoriesModule,
    PublicServicesModule,
    UsersModule,
    RolesModule,
    AuthModule,
    CategoriesModule,
    CharacteristicNamesModule,
    ProductCharacteristicsModule,
    SearchModule,
    CategoryFiltersModule,
    ArticlesModule,
    AdminOrdersModule,
    CitiesModule,
    ShipmentsModule,
    ServiceCategoriesModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CityGuard,
    },
  ],
})
export class AppModule {}
