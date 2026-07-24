import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { RegisterUseCase } from './use-cases/register.use-case';

import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { AccountModule } from '../account/account.module';
import { LoginUseCase } from './use-cases/login.use-case';

@Module({
  imports: [
    UsersModule,
    WalletModule,
    AccountModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, RegisterUseCase, LoginUseCase],

  exports: [AuthService],
})
export class AuthModule {}
