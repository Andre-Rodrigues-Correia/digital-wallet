import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';

import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

@Injectable()
export class ReverseTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly walletRepository: WalletRepository,
  ) {}

  async execute(transactionId: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    if (transaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Transaction already reversed.');
    }

    switch (transaction.type) {
      case TransactionType.DEPOSIT:
        await this.reverseDeposit(transaction);
        break;

      case TransactionType.TRANSFER:
        await this.reverseTransfer(transaction);
        break;

      default:
        throw new BadRequestException('Transaction cannot be reversed.');
    }

    transaction.status = TransactionStatus.REVERSED;

    await this.transactionRepository.save(transaction);

    return {
      message: 'Transaction reversed successfully.',
    };
  }

  private async reverseDeposit(transaction: any) {
    const wallet = await this.walletRepository.findById(
      transaction.receiverWalletId.toString(),
    );

    if (!wallet) {
      throw new NotFoundException('Wallet not found.');
    }

    if (wallet.balance < transaction.amount) {
      throw new BadRequestException('Insufficient balance to reverse deposit.');
    }

    wallet.balance -= transaction.amount;

    await this.walletRepository.save(wallet);
  }

  private async reverseTransfer(transaction: any) {
    const sender = await this.walletRepository.findById(
      transaction.senderWalletId.toString(),
    );

    const receiver = await this.walletRepository.findById(
      transaction.receiverWalletId.toString(),
    );

    if (!sender || !receiver) {
      throw new NotFoundException('Wallet not found.');
    }

    if (receiver.balance < transaction.amount) {
      throw new BadRequestException('Receiver has insufficient balance.');
    }

    receiver.balance -= transaction.amount;

    sender.balance += transaction.amount;

    await this.walletRepository.save(sender);

    await this.walletRepository.save(receiver);
  }
}
