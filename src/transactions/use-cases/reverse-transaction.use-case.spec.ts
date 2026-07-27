import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ReverseTransactionUseCase } from './reverse-transaction.use-case';

import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';

import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('ReverseTransactionUseCase', () => {
  let useCase: ReverseTransactionUseCase;

  const transactionRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  const walletRepository = {
    findById: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReverseTransactionUseCase,
        { provide: TransactionRepository, useValue: transactionRepository },
        { provide: WalletRepository, useValue: walletRepository },
      ],
    }).compile();

    useCase = module.get(ReverseTransactionUseCase);
  });

  it('should reverse a deposit successfully', async () => {
    const mockTransaction = {
      _id: 'tx-id',
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: 500,
      receiverWalletId: { toString: () => 'receiver-wallet' },
      save: jest.fn(),
    };

    const mockWallet = {
      _id: 'receiver-wallet',
      balance: 1000,
      save: jest.fn(),
    };

    transactionRepository.findById.mockResolvedValue(mockTransaction);
    walletRepository.findById.mockResolvedValue(mockWallet);
    transactionRepository.save.mockImplementation((tx) => Promise.resolve(tx));

    const result = await useCase.execute('tx-id');

    expect(mockWallet.balance).toBe(500);
    expect(walletRepository.save).toHaveBeenCalledWith(mockWallet);
    expect(mockTransaction.status).toBe(TransactionStatus.REVERSED);
    expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
    expect(result.message).toBe('Transaction reversed successfully.');
  });

  it('should reverse a transfer successfully', async () => {
    const mockTransaction = {
      _id: 'tx-id',
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      amount: 300,
      senderWalletId: { toString: () => 'sender-wallet' },
      receiverWalletId: { toString: () => 'receiver-wallet' },
      save: jest.fn(),
    };

    const senderWallet = {
      _id: 'sender-wallet',
      balance: 700,
      save: jest.fn(),
    };
    const receiverWallet = {
      _id: 'receiver-wallet',
      balance: 1300,
      save: jest.fn(),
    };

    transactionRepository.findById.mockResolvedValue(mockTransaction);
    walletRepository.findById
      .mockResolvedValueOnce(senderWallet)
      .mockResolvedValueOnce(receiverWallet);
    transactionRepository.save.mockImplementation((tx) => Promise.resolve(tx));

    const result = await useCase.execute('tx-id');

    expect(senderWallet.balance).toBe(1000);
    expect(receiverWallet.balance).toBe(1000);
    expect(walletRepository.save).toHaveBeenCalledTimes(2);
    expect(mockTransaction.status).toBe(TransactionStatus.REVERSED);
    expect(result.message).toBe('Transaction reversed successfully.');
  });

  it('should throw NotFoundException when transaction not found', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NotFoundException,
    );

    expect(walletRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when transaction already reversed', async () => {
    transactionRepository.findById.mockResolvedValue({
      _id: 'tx-id',
      status: TransactionStatus.REVERSED,
      type: TransactionType.DEPOSIT,
    });

    await expect(useCase.execute('tx-id')).rejects.toThrow(BadRequestException);

    expect(walletRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when wallet not found during deposit reversal', async () => {
    transactionRepository.findById.mockResolvedValue({
      _id: 'tx-id',
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: 500,
      receiverWalletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('tx-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when insufficient balance for deposit reversal', async () => {
    transactionRepository.findById.mockResolvedValue({
      _id: 'tx-id',
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      amount: 2000,
      receiverWalletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({
      _id: 'wallet-id',
      balance: 500,
    });

    await expect(useCase.execute('tx-id')).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when sender wallet not found during transfer reversal', async () => {
    transactionRepository.findById.mockResolvedValue({
      _id: 'tx-id',
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      amount: 100,
      senderWalletId: { toString: () => 'sender-wallet' },
      receiverWalletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: 'receiver-wallet', balance: 500 });

    await expect(useCase.execute('tx-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when receiver wallet not found during transfer reversal', async () => {
    transactionRepository.findById.mockResolvedValue({
      _id: 'tx-id',
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      amount: 100,
      senderWalletId: { toString: () => 'sender-wallet' },
      receiverWalletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce({ _id: 'sender-wallet', balance: 500 })
      .mockResolvedValueOnce(null);

    await expect(useCase.execute('tx-id')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when receiver has insufficient balance for transfer reversal', async () => {
    transactionRepository.findById.mockResolvedValue({
      _id: 'tx-id',
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      amount: 2000,
      senderWalletId: { toString: () => 'sender-wallet' },
      receiverWalletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce({ _id: 'sender-wallet', balance: 0 })
      .mockResolvedValueOnce({ _id: 'receiver-wallet', balance: 500 });

    await expect(useCase.execute('tx-id')).rejects.toThrow(BadRequestException);
  });
});
