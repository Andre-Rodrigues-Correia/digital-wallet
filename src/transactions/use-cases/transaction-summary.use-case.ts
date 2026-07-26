import { Injectable, NotFoundException } from '@nestjs/common';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransactionSummaryDto } from '../dto/transaction-summary.dto';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Injectable()
export class TransactionSummaryUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(userId: string): Promise<TransactionSummaryDto> {
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

    let totalReceived = 0;
    let totalSent = 0;
    let totalDeposited = 0;
    let totalTransferred = 0;
    let totalReversed = 0;

    for (const transaction of transactions) {
      if (transaction.status === TransactionStatus.REVERSED) {
        totalReversed += transaction.amount;
        continue;
      }

      if (transaction.status !== TransactionStatus.COMPLETED) {
        continue;
      }

      switch (transaction.type) {
        case TransactionType.DEPOSIT:
          totalDeposited += transaction.amount;
          totalReceived += transaction.amount;
          break;

        case TransactionType.TRANSFER:
          if (transaction.senderWalletId?.toString() === wallet.id) {
            totalSent += transaction.amount;
            totalTransferred += transaction.amount;
          }

          if (transaction.receiverWalletId?.toString() === wallet.id) {
            totalReceived += transaction.amount;
          }

          break;
      }
    }

    return {
      balance: wallet.balance,
      totalReceived,
      totalSent,
      totalDeposited,
      totalTransferred,
      totalReversed,
      totalTransactions: transactions.length,
    };
  }
}
