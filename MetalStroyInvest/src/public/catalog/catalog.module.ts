import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  providers: [CatalogService],
  controllers: [CatalogController],
  imports: [PrismaModule],
})
export class CatalogModule {}
