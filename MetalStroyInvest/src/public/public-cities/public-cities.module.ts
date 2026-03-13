import { Module, forwardRef } from '@nestjs/common';
import { PublicCitiesService } from './public-cities.service';
import { PublicCitiesController } from './public-cities.controller';
import { CityGuard } from './guards/city.guard';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [PublicCitiesController],
  providers: [PublicCitiesService, CityGuard],
  exports: [PublicCitiesService, CityGuard],
  imports: [PrismaModule],
})
export class PublicCitiesModule {}

