import { Module } from '@nestjs/common';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [HomepageController],
  providers: [HomepageService],
  imports: [PrismaModule],
})
export class HomepageModule {}
