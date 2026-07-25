import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { UserRepository } from '../users/repositories/user.repository';
import { WalletRepository } from '../wallet/repositories/wallet.repository';

import { PasswordService } from '../common/security/password.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async onApplicationBootstrap() {
    const users = [
      {
        name: 'João Silva',
        email: 'joao@email.com',
        accountNumber: '10000001',
      },
      {
        name: 'Maria Souza',
        email: 'maria@email.com',
        accountNumber: '10000002',
      },
      {
        name: 'Pedro Santos',
        email: 'pedro@email.com',
        accountNumber: '10000003',
      },
    ];

    for (const user of users) {
      const exists = await this.userRepository.findByEmail(user.email);

      if (exists) {
        continue;
      }

      const wallet = await this.walletRepository.create();

      wallet.balance = 1000;

      await this.walletRepository.save(wallet);

      await this.userRepository.create({
        name: user.name,
        email: user.email,
        password: await this.passwordService.hash('Password123'),
        accountNumber: user.accountNumber,
        walletId: wallet._id,
      });

      console.log(`Seed -> ${user.name} created.`);
    }
  }
}