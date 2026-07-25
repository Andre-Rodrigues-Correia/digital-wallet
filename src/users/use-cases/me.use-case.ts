import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository } from '../repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';

@Injectable()
export class MeUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(userId: string) {
    console.log(userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const wallet = await this.walletRepository.findById(
      user.walletId.toString(),
    );

    if (!wallet) {
      throw new NotFoundException('Wallet not found.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: wallet.balance,
    };
  }
}
