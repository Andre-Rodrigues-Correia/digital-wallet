import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { TransactionHistoryDto } from '../dto/transaction-history.dto';

@Injectable()
export class ListTransactionsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(userId: string) {
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

    const transactions = await this.transactionRepository.findByWallet(
      wallet.id,
    );

    const history: TransactionHistoryDto[] = [];

    for (const transaction of transactions) {
      let direction: 'IN' | 'OUT' = 'IN';

      let accountNumber: string | undefined;

      let otherUser: string | undefined;

      if (transaction.senderWalletId?.toString() === wallet.id) {
        direction = 'OUT';

        const receiver = await this.userRepository.findByWalletId(
          transaction.receiverWalletId.toString(),
        );

        accountNumber = receiver?.accountNumber;

        otherUser = receiver?.name;
      } else if (transaction.senderWalletId) {
        direction = 'IN';

        const sender = await this.userRepository.findByWalletId(
          transaction.senderWalletId.toString(),
        );

        accountNumber = sender?.accountNumber;

        otherUser = sender?.name;
      }

      history.push({
        id: transaction.id,
        type: transaction.type,
        direction,
        amount: transaction.amount,
        status: transaction.status,
        user: otherUser,
        accountNumber,
        createdAt: transaction.createdAt,
      });
    }

    return history;
  }
}
