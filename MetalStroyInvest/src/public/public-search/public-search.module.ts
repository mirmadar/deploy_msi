import { Module } from '@nestjs/common';
import { PublicSearchController } from './public-search.controller';
import { SearchModule } from 'src/admin/search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [PublicSearchController],
})
export class PublicSearchModule {}