import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { LoginUseCase } from './login.use-case';

import { UserRepository } from '../../users/repositories/user.repository';
import { PasswordService } from '../../common/security/password.service';
import { AuthService } from '../auth.service';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const userRepository = {
    findByEmailWithPassword: jest.fn(),
  };

  const passwordService = {
    compare: jest.fn(),
  };

  const authService = {
    authenticate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: UserRepository, useValue: userRepository },
        { provide: PasswordService, useValue: passwordService },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);
  });

  it('should login successfully with valid credentials', async () => {
    const dto = { email: 'andre@email.com', password: 'Password123' };
    const mockUser = {
      id: 'user-id',
      email: 'andre@email.com',
      password: 'hashed-password',
    };

    userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
    passwordService.compare.mockResolvedValue(true);
    authService.authenticate.mockResolvedValue({
      accessToken: 'jwt-token',
      user: { id: 'user-id', name: 'André', email: 'andre@email.com', accountNumber: '000001' },
    });

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith('andre@email.com');
    expect(passwordService.compare).toHaveBeenCalledWith('Password123', 'hashed-password');
    expect(authService.authenticate).toHaveBeenCalledWith(mockUser);
    expect(result.accessToken).toBe('jwt-token');
  });

  it('should throw UnauthorizedException when user not found', async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@email.com', password: 'Password123' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(passwordService.compare).not.toHaveBeenCalled();
    expect(authService.authenticate).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password does not match', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'andre@email.com',
      password: 'hashed-password',
    };

    userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
    passwordService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'andre@email.com', password: 'WrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(authService.authenticate).not.toHaveBeenCalled();
  });

  it('should call findByEmailWithPassword with the provided email', async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(null);

    try {
      await useCase.execute({ email: 'test@email.com', password: 'Password1' });
    } catch {
      // expected
    }

    expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@email.com');
  });
});
