import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { DepositUseCase } from './use-cases/deposit.use-case';
import { TransferUseCase } from './use-cases/transfer.use-case';
import { ListTransactionsUseCase } from './use-cases/list-transactions.use-case';
import { ReverseTransactionUseCase } from './use-cases/reverse-transaction.use-case';
import { TransactionSummaryUseCase } from './use-cases/transaction-summary.use-case';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const depositUseCase = { execute: jest.fn() };
  const transferUseCase = { execute: jest.fn() };
  const listTransactionsUseCase = { execute: jest.fn() };
  const reverseTransactionUseCase = { execute: jest.fn() };
  const transactionSummaryUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: DepositUseCase, useValue: depositUseCase },
        { provide: TransferUseCase, useValue: transferUseCase },
        { provide: ListTransactionsUseCase, useValue: listTransactionsUseCase },
        { provide: ReverseTransactionUseCase, useValue: reverseTransactionUseCase },
        { provide: TransactionSummaryUseCase, useValue: transactionSummaryUseCase },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
