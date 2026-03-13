import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
  imports: [PrismaModule, AuthModule],
})
export class ArticlesModule {}


