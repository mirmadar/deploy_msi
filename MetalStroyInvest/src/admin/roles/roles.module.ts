import { forwardRef, Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthModule } from 'src/admin/auth/auth.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
  imports: [PrismaModule, forwardRef(() => AuthModule)],
})
export class RolesModule {}
