import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { MeUseCase } from './me.use-case';

import { UserRepository } from '../repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';

describe('MeUseCase', () => {
  let useCase: MeUseCase;

  const userRepository = {
    findById: jest.fn(),
  };

  const walletRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
      ],
    }).compile();

    useCase = module.get(MeUseCase);
  });

  it('should return user profile with balance', async () => {
    const mockUser = {
      id: 'user-id',
      name: 'André',
      email: 'andre@email.com',
      accountNumber: '000001',
      walletId: { toString: () => 'wallet-id' },
    };
    const mockWallet = { balance: 1500 };

    userRepository.findById.mockResolvedValue(mockUser);
    walletRepository.findById.mockResolvedValue(mockWallet);

    const result = await useCase.execute('user-id');

    expect(userRepository.findById).toHaveBeenCalledWith('user-id');
    expect(walletRepository.findById).toHaveBeenCalledWith('wallet-id');
    expect(result).toEqual({
      id: 'user-id',
      name: 'André',
      email: 'andre@email.com',
      accountNumber: '000001',
      balance: 1500,
    });
  });

  it('should throw NotFoundException when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(walletRepository.findById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when wallet not found', async () => {
    const mockUser = {
      id: 'user-id',
      walletId: { toString: () => 'wallet-id' },
    };

    userRepository.findById.mockResolvedValue(mockUser);
    walletRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return balance from wallet', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      name: 'Test',
      email: 'test@email.com',
      accountNumber: '000010',
      walletId: { toString: () => 'wallet-id' },
    });
    walletRepository.findById.mockResolvedValue({ balance: 5000 });

    const result = await useCase.execute('user-id');

    expect(result.balance).toBe(5000);
  });
});
