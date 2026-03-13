import { Controller, Post, UseGuards, Logger } from '@nestjs/common';
import { BulkIndexService } from './bulk-index.service';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/search')
export class SearchAdminController {
  private readonly logger = new Logger(SearchAdminController.name);

  constructor(private readonly bulk: BulkIndexService) {}

  @Post('reindex')
  reindex() {
    this.bulk.reindexAllProducts().catch((err) => {
      this.logger.error('Ошибка при переиндексации', err);
    });
    return { status: 'started' };
  }
}
