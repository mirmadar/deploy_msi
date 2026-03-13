import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/admin/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';
const secret = process.env.PRIVATE_KEY;
const expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];

if (isProduction && !secret) {
  throw new Error(
    'PRIVATE_KEY is required in production. Set the PRIVATE_KEY environment variable.',
  );
}

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: secret || 'SECRET',
      signOptions: {
        expiresIn,
      },
    }),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
