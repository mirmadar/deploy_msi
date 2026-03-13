import { Module } from '@nestjs/common';
import { SearchAdminController } from './indexing.controller';
import { BulkIndexService } from './bulk-index.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AuthModule } from 'src/admin/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SearchAdminController, SearchController],
  providers: [BulkIndexService, SearchService],
  exports: [SearchService, BulkIndexService],
})
export class SearchModule {}
