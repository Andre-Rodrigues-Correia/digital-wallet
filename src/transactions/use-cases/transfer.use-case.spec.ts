import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { TransferUseCase } from './transfer.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { TransactionRepository } from '../repositories/transaction.repository';

import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

describe('TransferUseCase', () => {
  let useCase: TransferUseCase;

  const userRepository = {
    findById: jest.fn(),
    findByAccountNumber: jest.fn(),
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
        TransferUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
        { provide: TransactionRepository, useValue: transactionRepository },
      ],
    }).compile();

    useCase = module.get(TransferUseCase);
  });

  it('should transfer successfully', async () => {
    const senderWallet = {
      _id: 'sender-wallet',
      balance: 1000,
      save: jest.fn(),
    };
    const receiverWallet = {
      _id: 'receiver-wallet',
      balance: 500,
      save: jest.fn(),
    };

    userRepository.findById.mockResolvedValue({
      id: 'sender-id',
      walletId: { toString: () => 'sender-wallet' },
    });
    userRepository.findByAccountNumber.mockResolvedValue({
      id: 'receiver-id',
      walletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce(senderWallet)
      .mockResolvedValueOnce(receiverWallet);
    transactionRepository.create.mockResolvedValue({
      id: 'tx-id',
      amount: 300,
    });

    const result = await useCase.execute('sender-id', {
      accountNumber: '000002',
      amount: 300,
    });

    expect(senderWallet.balance).toBe(700);
    expect(receiverWallet.balance).toBe(800);
    expect(walletRepository.save).toHaveBeenCalledTimes(2);
    expect(transactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 300,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        senderWalletId: 'sender-wallet',
        receiverWalletId: 'receiver-wallet',
      }),
    );
    expect(result.message).toBe('Transfer completed successfully.');
    expect(result.balance).toBe(700);
  });

  it('should throw NotFoundException when sender not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', { accountNumber: '000002', amount: 100 }),
    ).rejects.toThrow(NotFoundException);

    expect(userRepository.findByAccountNumber).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when receiver not found', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'sender-id',
      walletId: { toString: () => 'w1' },
    });
    userRepository.findByAccountNumber.mockResolvedValue(null);

    await expect(
      useCase.execute('sender-id', { accountNumber: '999999', amount: 100 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when transferring to own account', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });
    userRepository.findByAccountNumber.mockResolvedValue({
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    });

    await expect(
      useCase.execute('user-id', { accountNumber: '000001', amount: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when sender wallet not found', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'sender-id',
      walletId: { toString: () => 'sender-wallet' },
    });
    userRepository.findByAccountNumber.mockResolvedValue({
      id: 'receiver-id',
      walletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('sender-id', { accountNumber: '000002', amount: 100 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when receiver wallet not found', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'sender-id',
      walletId: { toString: () => 'sender-wallet' },
    });
    userRepository.findByAccountNumber.mockResolvedValue({
      id: 'receiver-id',
      walletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce({ _id: 'sender-wallet', balance: 1000 })
      .mockResolvedValueOnce(null);

    await expect(
      useCase.execute('sender-id', { accountNumber: '000002', amount: 100 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when insufficient balance', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'sender-id',
      walletId: { toString: () => 'sender-wallet' },
    });
    userRepository.findByAccountNumber.mockResolvedValue({
      id: 'receiver-id',
      walletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce({ _id: 'sender-wallet', balance: 50 })
      .mockResolvedValueOnce({ _id: 'receiver-wallet', balance: 200 });

    await expect(
      useCase.execute('sender-id', { accountNumber: '000002', amount: 100 }),
    ).rejects.toThrow(BadRequestException);

    expect(walletRepository.save).not.toHaveBeenCalled();
  });

  it('should correctly debit sender and credit receiver', async () => {
    const senderWallet = {
      _id: 'sender-wallet',
      balance: 2000,
      save: jest.fn(),
    };
    const receiverWallet = {
      _id: 'receiver-wallet',
      balance: 300,
      save: jest.fn(),
    };

    userRepository.findById.mockResolvedValue({
      id: 'sender-id',
      walletId: { toString: () => 'sender-wallet' },
    });
    userRepository.findByAccountNumber.mockResolvedValue({
      id: 'receiver-id',
      walletId: { toString: () => 'receiver-wallet' },
    });
    walletRepository.findById
      .mockResolvedValueOnce(senderWallet)
      .mockResolvedValueOnce(receiverWallet);
    transactionRepository.create.mockResolvedValue({ id: 'tx' });

    await useCase.execute('sender-id', { accountNumber: '000002', amount: 750 });

    expect(senderWallet.balance).toBe(1250);
    expect(receiverWallet.balance).toBe(1050);
  });
});
