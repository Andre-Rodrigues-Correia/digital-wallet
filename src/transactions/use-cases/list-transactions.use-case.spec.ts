import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ListTransactionsUseCase } from './list-transactions.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('ListTransactionsUseCase', () => {
  let useCase: ListTransactionsUseCase;

  const userRepository = {
    findById: jest.fn(),
    findByWalletId: jest.fn(),
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
        ListTransactionsUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    useCase = module.get(ListTransactionsUseCase);
  });

  it('should return transaction history for user', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({
      _id: 'wallet-id',
      id: 'wallet-id',
      balance: 1000,
    });
    transactionRepository.findByWallet.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result).toEqual([]);
    expect(userRepository.findById).toHaveBeenCalledWith('user-id');
    expect(walletRepository.findById).toHaveBeenCalledWith('wallet-id');
    expect(transactionRepository.findByWallet).toHaveBeenCalledWith('wallet-id');
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

  it('should return IN direction for incoming transfers', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({
      _id: 'wallet-id',
      balance: 1000,
    });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        id: 'tx-1',
        type: TransactionType.TRANSFER,
        amount: 200,
        status: TransactionStatus.COMPLETED,
        senderWalletId: { toString: () => 'other-wallet' },
        receiverWalletId: { toString: () => 'wallet-id' },
        createdAt: new Date('2025-01-01'),
      },
    ]);

    userRepository.findByWalletId.mockResolvedValue({
      name: 'Sender User',
      accountNumber: '000099',
    });

    const result = await useCase.execute('user-id');

    expect(result).toHaveLength(1);
    expect(result[0].direction).toBe('IN');
    expect(result[0].user).toBe('Sender User');
    expect(result[0].accountNumber).toBe('000099');
  });

  it('should return OUT direction for outgoing transfers', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({
      _id: 'wallet-id',
      id: 'wallet-id',
      balance: 1000,
    });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        id: 'tx-2',
        type: TransactionType.TRANSFER,
        amount: 300,
        status: TransactionStatus.COMPLETED,
        senderWalletId: { toString: () => 'wallet-id' },
        receiverWalletId: { toString: () => 'other-wallet' },
        createdAt: new Date('2025-01-02'),
      },
    ]);

    userRepository.findByWalletId.mockResolvedValue({
      name: 'Receiver User',
      accountNumber: '000088',
    });

    const result = await useCase.execute('user-id');

    expect(result).toHaveLength(1);
    expect(result[0].direction).toBe('OUT');
    expect(result[0].user).toBe('Receiver User');
    expect(result[0].accountNumber).toBe('000088');
  });

  it('should return IN direction for deposits (senderWalletId is null)', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({
      _id: 'wallet-id',
      id: 'wallet-id',
      balance: 1000,
    });
    transactionRepository.findByWallet.mockResolvedValue([
      {
        id: 'tx-3',
        type: TransactionType.DEPOSIT,
        amount: 500,
        status: TransactionStatus.COMPLETED,
        senderWalletId: null,
        receiverWalletId: { toString: () => 'wallet-id' },
        createdAt: new Date('2025-01-03'),
      },
    ]);

    const result = await useCase.execute('user-id');

    expect(result).toHaveLength(1);
    expect(result[0].direction).toBe('IN');
    expect(result[0].user).toBeUndefined();
    expect(result[0].accountNumber).toBeUndefined();
  });

  it('should return empty array when no transactions exist', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ _id: 'wallet-id' });
    transactionRepository.findByWallet.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result).toEqual([]);
  });
});
