import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { AccountModule } from './account/account.module';
import { ConfigModule } from '@nestjs/config';
import { MongoDatabaseModule } from './confg/database/mongodb.config';
import { SecurityModule } from './common/security/security.module';
import { DatabaseModule } from './common/database/database.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongoDatabaseModule,
    AuthModule,
    UsersModule,
    WalletModule,
    AccountModule,
    SecurityModule,
    DatabaseModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
