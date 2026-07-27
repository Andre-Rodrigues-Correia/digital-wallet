import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DepositUseCase } from './deposit.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('DepositUseCase', () => {
  let useCase: DepositUseCase;

  const userRepository = {
    findById: jest.fn(),
  };

  const walletRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const transactionRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    useCase = module.get(DepositUseCase);
  });

  it('should deposit successfully', async () => {
    const mockUser = {
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    };
    const mockWallet = {
      _id: 'wallet-id',
      balance: 1000,
      save: jest.fn(),
    };
    const mockTransaction = {
      id: 'tx-id',
      amount: 500,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
    };

    userRepository.findById.mockResolvedValue(mockUser);
    walletRepository.findById.mockResolvedValue(mockWallet);
    mockWallet.save.mockResolvedValue(mockWallet);
    transactionRepository.create.mockResolvedValue(mockTransaction);

    const result = await useCase.execute('user-id', { amount: 500 });

    expect(userRepository.findById).toHaveBeenCalledWith('user-id');
    expect(walletRepository.findById).toHaveBeenCalledWith('wallet-id');
    expect(mockWallet.balance).toBe(1500);
    expect(walletRepository.save).toHaveBeenCalledWith(mockWallet);
    expect(transactionRepository.create).toHaveBeenCalledWith({
      amount: 500,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      senderWalletId: null,
      receiverWalletId: 'wallet-id',
    });
    expect(result.message).toBe('Deposit completed successfully.');
    expect(result.balance).toBe(1500);
    expect(result.transaction).toBe(mockTransaction);
  });

  it('should throw NotFoundException when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', { amount: 100 })).rejects.toThrow(
      NotFoundException,
    );

    expect(walletRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when wallet not found', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id', { amount: 100 })).rejects.toThrow(
      NotFoundException,
    );

    expect(walletRepository.save).not.toHaveBeenCalled();
  });

  it('should create a DEPOSIT transaction with COMPLETED status', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({
      _id: 'wallet-id',
      balance: 0,
      save: jest.fn(),
    });
    transactionRepository.create.mockResolvedValue({ id: 'tx-1' });

    await useCase.execute('user-id', { amount: 250 });

    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        senderWalletId: null,
      }),
    );
  });

  it('should add deposit amount to current balance', async () => {
    const mockWallet = {
      _id: 'wallet-id',
      balance: 750,
      save: jest.fn(),
    };

    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue(mockWallet);
    transactionRepository.create.mockResolvedValue({ id: 'tx' });

    await useCase.execute('user-id', { amount: 250 });

    expect(mockWallet.balance).toBe(1000);
  });
});
