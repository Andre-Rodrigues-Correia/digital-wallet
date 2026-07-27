import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate token and return auth response', async () => {
    const mockUser = {
      id: 'user-id',
      name: 'André',
      email: 'andre@email.com',
      accountNumber: '000001',
    };

    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.authenticate(mockUser as any);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'andre@email.com',
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 'user-id',
        name: 'André',
        email: 'andre@email.com',
        accountNumber: '000001',
      },
    });
  });

  it('should pass correct payload to jwtService.signAsync', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Maria',
      email: 'maria@email.com',
      accountNumber: '000099',
    };

    jwtService.signAsync.mockResolvedValue('token');

    await service.authenticate(mockUser as any);

    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'maria@email.com',
    });
  });

  it('should return AuthResponseDto shape', async () => {
    jwtService.signAsync.mockResolvedValue('token');

    const result = await service.authenticate({
      id: '1',
      name: 'Test',
      email: 'test@email.com',
      accountNumber: '000010',
    } as any);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('user');
    expect(result.user).toHaveProperty('id');
    expect(result.user).toHaveProperty('name');
    expect(result.user).toHaveProperty('email');
    expect(result.user).toHaveProperty('accountNumber');
  });
});
