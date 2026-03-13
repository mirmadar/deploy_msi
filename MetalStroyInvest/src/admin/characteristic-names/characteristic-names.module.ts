import { Module } from '@nestjs/common';
import { CharacteristicNamesService } from './characteristic-names.service';
import { CharacteristicNamesController } from './characteristic-names.controller';
import { AuthModule } from 'src/admin/auth/auth.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  providers: [CharacteristicNamesService],
  controllers: [CharacteristicNamesController],
  exports: [CharacteristicNamesService],
  imports: [PrismaModule, AuthModule],
})
export class CharacteristicNamesModule {}
