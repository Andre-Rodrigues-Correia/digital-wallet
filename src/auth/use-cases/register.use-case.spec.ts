import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RegisterUseCase } from './register.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { AccountService } from '../../account/account.service';
import { PasswordService } from '../../common/security/password.service';
import { AuthService } from '../auth.service';
import { TransactionService } from '../../common/database/transaction.service';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  const userRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const walletRepository = {
    create: jest.fn(),
  };

  const accountService = {
    generateAccountNumber: jest.fn(),
  };

  const passwordService = {
    hash: jest.fn(),
  };

  const authService = {
    authenticate: jest.fn(),
  };

  const transactionService = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
        { provide: AccountService, useValue: accountService },
        { provide: PasswordService, useValue: passwordService },
        { provide: AuthService, useValue: authService },
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    useCase = module.get(RegisterUseCase);
  });

  it('should register a new user successfully', async () => {
    const dto = {
      name: 'André',
      email: 'andre@email.com',
      password: 'Password123',
    };

    const mockWallet = { _id: 'wallet-id', balance: 0 };
    const mockUser = {
      id: 'user-id',
      name: 'André',
      email: 'andre@email.com',
      accountNumber: '000001',
      walletId: 'wallet-id',
    };

    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');
    accountService.generateAccountNumber.mockResolvedValue('000001');
    walletRepository.create.mockResolvedValue(mockWallet);
    userRepository.create.mockResolvedValue(mockUser);
    authService.authenticate.mockResolvedValue({
      accessToken: 'jwt-token',
      user: { id: 'user-id', name: 'André', email: 'andre@email.com', accountNumber: '000001' },
    });

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith('andre@email.com');
    expect(passwordService.hash).toHaveBeenCalledWith('Password123');
    expect(accountService.generateAccountNumber).toHaveBeenCalled();
    expect(walletRepository.create).toHaveBeenCalled();
    expect(userRepository.create).toHaveBeenCalledWith({
      name: 'André',
      email: 'andre@email.com',
      password: 'hashed-password',
      accountNumber: '000001',
      walletId: 'wallet-id',
    });
    expect(authService.authenticate).toHaveBeenCalledWith(mockUser);
    expect(result.accessToken).toBe('jwt-token');
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(
      useCase.execute({
        name: 'André',
        email: 'andre@email.com',
        password: 'Password123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(accountService.generateAccountNumber).not.toHaveBeenCalled();
    expect(walletRepository.create).not.toHaveBeenCalled();
  });

  it('should hash the password before creating the user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');
    accountService.generateAccountNumber.mockResolvedValue('000001');
    walletRepository.create.mockResolvedValue({ _id: 'wallet-id' });
    userRepository.create.mockResolvedValue({
      id: 'user-id',
      name: 'André',
      email: 'andre@email.com',
    });
    authService.authenticate.mockResolvedValue({
      accessToken: 'jwt-token',
      user: { id: 'user-id', name: 'André', email: 'andre@email.com', accountNumber: '000001' },
    });

    await useCase.execute({
      name: 'André',
      email: 'andre@email.com',
      password: 'Password123',
    });

    expect(passwordService.hash).toHaveBeenCalledWith('Password123');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed-password' }),
    );
  });

  it('should generate an account number and create wallet', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed');
    accountService.generateAccountNumber.mockResolvedValue('000042');
    walletRepository.create.mockResolvedValue({ _id: 'wallet-42', balance: 0 });
    userRepository.create.mockResolvedValue({
      id: 'user-42',
      walletId: 'wallet-42',
    });
    authService.authenticate.mockResolvedValue({
      accessToken: 'jwt',
      user: { id: 'user-42' },
    });

    await useCase.execute({
      name: 'Test',
      email: 'test@email.com',
      password: 'Password1',
    });

    expect(accountService.generateAccountNumber).toHaveBeenCalledTimes(1);
    expect(walletRepository.create).toHaveBeenCalledTimes(1);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        accountNumber: '000042',
        walletId: 'wallet-42',
      }),
    );
  });
});
