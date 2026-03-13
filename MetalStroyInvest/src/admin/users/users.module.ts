import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesModule } from 'src/admin/roles/roles.module';
import { AuthModule } from 'src/admin/auth/auth.module';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, RolesModule, forwardRef(() => AuthModule)],
  exports: [UsersService],
})
export class UsersModule {}
