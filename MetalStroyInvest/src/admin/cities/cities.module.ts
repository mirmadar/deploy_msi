import { Module, forwardRef } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { PublicCitiesModule } from 'src/public/public-cities/public-cities.module';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
  imports: [PrismaModule, AuthModule, forwardRef(() => PublicCitiesModule)],
})
export class CitiesModule {}


