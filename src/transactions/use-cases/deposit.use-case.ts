import { Injectable, NotFoundException } from '@nestjs/common';

import { DepositDto } from '../dto/deposit.dto';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

@Injectable()
export class DepositUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(userId: string, dto: DepositDto) {
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

    wallet.balance += dto.amount;

    await this.walletRepository.save(wallet);

    const transaction = await this.transactionRepository.create({
      amount: dto.amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      senderWalletId: null,
      receiverWalletId: wallet._id,
    });

    return {
      message: 'Deposit completed successfully.',
      balance: wallet.balance,
      transaction,
    };
  }
}
