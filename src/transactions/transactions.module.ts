import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';
import { TransactionRepository } from './repositories/transaction.repository';
import { TransactionsService } from './transactions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { DepositUseCase } from './use-cases/deposit.use-case';
import { TransferUseCase } from './use-cases/transfer.use-case';
import { ListTransactionsUseCase } from './use-cases/list-transactions.use-case';
import { ReverseTransactionUseCase } from './use-cases/reverse-transaction.use-case';

@Module({
  imports: [
    UsersModule,
    WalletModule,
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionRepository,
    DepositUseCase,
    TransferUseCase,
    ListTransactionsUseCase,
    ReverseTransactionUseCase
  ],
  exports: [TransactionRepository],
})
export class TransactionsModule {}
