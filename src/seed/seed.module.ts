import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { AccountModule } from '../account/account.module';

import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, WalletModule, AccountModule],
  providers: [SeedService],
})
export class SeedModule {}
