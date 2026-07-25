import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransferDto } from '../dto/transfer.dto';

import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

@Injectable()
export class TransferUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(userId: string, dto: TransferDto) {
    const sender = await this.userRepository.findById(userId);

    if (!sender) {
      throw new NotFoundException('User not found.');
    }

    const receiver = await this.userRepository.findByAccountNumber(
      dto.accountNumber,
    );

    if (!receiver) {
      throw new NotFoundException('Destination account not found.');
    }

    if (sender.id === receiver.id) {
      throw new BadRequestException('You cannot transfer to your own account.');
    }

    const senderWallet = await this.walletRepository.findById(
      sender.walletId.toString(),
    );

    if (!senderWallet) {
      throw new NotFoundException('Sender wallet not found.');
    }

    const receiverWallet = await this.walletRepository.findById(
      receiver.walletId.toString(),
    );

    if (!receiverWallet) {
      throw new NotFoundException('Receiver wallet not found.');
    }

    if (senderWallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance.');
    }

    senderWallet.balance -= dto.amount;

    receiverWallet.balance += dto.amount;

    await this.walletRepository.save(senderWallet);

    await this.walletRepository.save(receiverWallet);

    const transaction = await this.transactionRepository.create({
      amount: dto.amount,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      senderWalletId: senderWallet._id,
      receiverWalletId: receiverWallet._id,
    });

    return {
      message: 'Transfer completed successfully.',
      balance: senderWallet.balance,
      transactionId: transaction.id,
    };
  }
}
