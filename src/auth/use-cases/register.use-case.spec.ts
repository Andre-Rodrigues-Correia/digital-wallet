import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RegisterUseCase } from './register.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { CounterRepository } from '../../account/repositories/counter.repository';

import { PasswordService } from '../../common/security/password.service';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  const userRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const walletRepository = {
    create: jest.fn(),
  };

  const accountRepository = {
    create: jest.fn(),
    generateAccountNumber: jest.fn(),
  };

  const passwordService = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,

        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: WalletRepository,
          useValue: walletRepository,
        },
        {
          provide: CounterRepository,
          useValue: accountRepository,
        },
        {
          provide: PasswordService,
          useValue: passwordService,
        },
      ],
    }).compile();

    useCase = module.get(RegisterUseCase);
  });

  it('should register a new user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    walletRepository.create.mockResolvedValue({
      id: 'wallet-id',
    });

    accountRepository.generateAccountNumber.mockResolvedValue('0000000001');

    accountRepository.create.mockResolvedValue({
      id: 'account-id',
    });

    passwordService.hash.mockResolvedValue('hashed-password');

    userRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'André',
      email: 'andre@email.com',
    });

    const result = await useCase.execute({
      name: 'André',
      email: 'andre@email.com',
      password: 'Password123',
    });

    expect(result).toBeDefined();

    expect(userRepository.findByEmail).toHaveBeenCalledWith('andre@email.com');

    expect(passwordService.hash).toHaveBeenCalled();

    expect(walletRepository.create).toHaveBeenCalled();

    expect(userRepository.create).toHaveBeenCalled();

    expect(result.user.email).toBe('andre@email.com');
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: '1',
    });

    await expect(
      useCase.execute({
        name: 'André',
        email: 'andre@email.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
