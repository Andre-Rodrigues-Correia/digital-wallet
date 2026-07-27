import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TransactionSummaryUseCase } from './transaction-summary.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('TransactionSummaryUseCase', () => {
  let useCase: TransactionSummaryUseCase;

  const userRepository = {
    findById: jest.fn(),
  };

  const walletRepository = {
    findById: jest.fn(),
  };

  const transactionRepository = {
    findByWallet: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionSummaryUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    useCase = module.get(TransactionSummaryUseCase);
  });

  it('should return summary with all zeros when no transactions exist', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', balance: 0 });
    transactionRepository.findByWallet.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result).toEqual({
      balance: 0,
      totalReceived: 0,
      totalSent: 0,
      totalDeposited: 0,
      totalTransferred: 0,
      totalReversed: 0,
      totalTransactions: 0,
    });
  });

  it('should throw NotFoundException when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when wallet not found', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id')).rejects.toThrow(NotFoundException);
  });

  it('should calculate deposited and received from deposits', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', balance: 1000 });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: 500,
        senderWalletId: null,
        receiverWalletId: { toString: () => 'wallet-id' },
      },
      {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: 300,
        senderWalletId: null,
        receiverWalletId: { toString: () => 'wallet-id' },
      },
    ]);

    const result = await useCase.execute('user-id');

    expect(result.totalDeposited).toBe(800);
    expect(result.totalReceived).toBe(800);
    expect(result.totalSent).toBe(0);
    expect(result.totalTransferred).toBe(0);
    expect(result.totalTransactions).toBe(2);
  });

  it('should calculate sent and transferred for outgoing transfers', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', id: 'wallet-id', balance: 200 });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        amount: 400,
        senderWalletId: { toString: () => 'wallet-id' },
        receiverWalletId: { toString: () => 'other-wallet' },
      },
    ]);

    const result = await useCase.execute('user-id');

    expect(result.totalSent).toBe(400);
    expect(result.totalTransferred).toBe(400);
    expect(result.totalReceived).toBe(0);
  });

  it('should calculate received for incoming transfers', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', id: 'wallet-id', balance: 500 });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        amount: 250,
        senderWalletId: { toString: () => 'other-wallet' },
        receiverWalletId: { toString: () => 'wallet-id' },
      },
    ]);

    const result = await useCase.execute('user-id');

    expect(result.totalReceived).toBe(250);
    expect(result.totalSent).toBe(0);
    expect(result.totalTransferred).toBe(0);
  });

  it('should count reversed transactions separately', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', balance: 100 });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount: 500,
        senderWalletId: null,
        receiverWalletId: { toString: () => 'wallet-id' },
      },
      {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.REVERSED,
        amount: 200,
        senderWalletId: null,
        receiverWalletId: { toString: () => 'wallet-id' },
      },
    ]);

    const result = await useCase.execute('user-id');

    expect(result.totalDeposited).toBe(500);
    expect(result.totalReceived).toBe(500);
    expect(result.totalReversed).toBe(200);
    expect(result.totalTransactions).toBe(2);
  });

  it('should skip PENDING and FAILED transactions', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', balance: 100 });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        amount: 500,
        senderWalletId: null,
        receiverWalletId: { toString: () => 'wallet-id' },
      },
      {
        type: TransactionType.TRANSFER,
        status: TransactionStatus.FAILED,
        amount: 300,
        senderWalletId: { toString: () => 'wallet-id' },
        receiverWalletId: { toString: () => 'other' },
      },
    ]);

    const result = await useCase.execute('user-id');

    expect(result.totalDeposited).toBe(0);
    expect(result.totalSent).toBe(0);
    expect(result.totalReceived).toBe(0);
    expect(result.totalTransactions).toBe(2);
  });

  it('should return correct balance from wallet', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id', balance: 2500 });
    transactionRepository.findByWallet.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result.balance).toBe(2500);
  });
});
